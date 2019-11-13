/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ONE_MONTH_IN_SECONDS } from 'Util/Request/QueryDispatcher';
import CartDispatcher from 'Store/Cart/Cart.dispatcher';
import { fetchMutation, fetchQuery } from 'Util/Request';
import { showNotification } from 'Store/Notification';
import { toggleBreadcrumbs } from 'Store/Breadcrumbs';
import BrowserDatabase from 'Util/BrowserDatabase';
import { changeHeaderState } from 'Store/Header';
import CheckoutQuery from 'Query/Checkout.query';
import { GUEST_QUOTE_ID } from 'Store/Cart';
import { TotalsType } from 'Type/MiniCart';
import { HistoryType } from 'Type/Common';

import { isSignedIn } from 'Util/Auth';
import { BRAINTREE } from 'Component/CheckoutPayments/CheckoutPayments.component';
import Checkout, { SHIPPING_STEP, BILLING_STEP, DETAILS_STEP } from './Checkout.component';

export const PAYMENT_TOTALS = 'PAYMENT_TOTALS';

export const mapStateToProps = state => ({
    totals: state.CartReducer.cartTotals
});

export const mapDispatchToProps = dispatch => ({
    resetCart: () => CartDispatcher._updateCartData({}, dispatch),
    toggleBreadcrumbs: state => dispatch(toggleBreadcrumbs(state)),
    showErrorNotification: message => dispatch(showNotification('error', message)),
    setHeaderState: stateName => dispatch(changeHeaderState(stateName))
});

export class CheckoutContainer extends PureComponent {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired,
        toggleBreadcrumbs: PropTypes.func.isRequired,
        resetCart: PropTypes.func.isRequired,
        totals: TotalsType.isRequired,
        history: HistoryType.isRequired
    };

    containerFunctions = {
        onShippingEstimationFieldsChange: this.onShippingEstimationFieldsChange.bind(this),
        savePaymentInformation: this.savePaymentInformation.bind(this),
        saveAddressInformation: this.saveAddressInformation.bind(this)
    };

    customPaymentMethods = [
        BRAINTREE
    ];

    constructor(props) {
        super(props);

        const {
            toggleBreadcrumbs,
            history,
            totals: { items = [], is_virtual }
        } = props;

        toggleBreadcrumbs(false);

        if (!items.length) history.push('/cart');

        this.state = {
            isLoading: is_virtual,
            isDeliveryOptionsLoading: false,
            requestsSent: 0,
            paymentMethods: [],
            shippingMethods: [],
            shippingAddress: {},
            checkoutStep: is_virtual ? BILLING_STEP : SHIPPING_STEP,
            orderID: '',
            paymentTotals: BrowserDatabase.getItem(PAYMENT_TOTALS) || {}
        };

        if (is_virtual) {
            this._getPaymentMethods();
        }
    }

    componentWillUnmount() {
        const { toggleBreadcrumbs } = this.props;
        toggleBreadcrumbs(true);
    }

    onShippingEstimationFieldsChange(address) {
        const { requestsSent } = this.state;

        this.setState({
            isDeliveryOptionsLoading: true,
            requestsSent: requestsSent + 1
        });

        fetchMutation(CheckoutQuery.getEstimateShippingCosts(
            address,
            this._getGuestCartId()
        )).then(
            ({ estimateShippingCosts: shippingMethods }) => {
                const { requestsSent } = this.state;

                this.setState({
                    shippingMethods,
                    isDeliveryOptionsLoading: requestsSent > 1,
                    requestsSent: requestsSent - 1
                });
            },
            this._handleError
        );
    }

    setDetailsStep(orderID) {
        const { resetCart } = this.props;

        BrowserDatabase.deleteItem(PAYMENT_TOTALS);
        resetCart();

        this.setState({
            isLoading: false,
            paymentTotals: {},
            checkoutStep: DETAILS_STEP,
            orderID
        });
    }

    containerProps = () => ({
        checkoutTotals: this._getCheckoutTotals()
    });

    _handleError = (error) => {
        const { showErrorNotification } = this.props;

        this.setState({
            isDeliveryOptionsLoading: false,
            isLoading: false
        }, () => {
            showErrorNotification(error[0].message);
        });
    };

    _getGuestCartId = () => BrowserDatabase.getItem(GUEST_QUOTE_ID);

    _getPaymentMethods() {
        fetchQuery(CheckoutQuery.getPaymentMethodsQuery(
            this._getGuestCartId()
        )).then(
            ({ getPaymentMethods: paymentMethods }) => {
                this.setState({ isLoading: false, paymentMethods });
            },
            this._handleError
        );
    }

    _getCheckoutTotals() {
        const { totals: cartTotals } = this.props;
        const { paymentTotals: { shipping_amount } } = this.state;

        return shipping_amount
            ? { ...cartTotals, shipping_amount }
            : cartTotals;
    }

    saveAddressInformation(addressInformation) {
        const { shipping_address } = addressInformation;

        this.setState({
            isLoading: true,
            shippingAddress: shipping_address
        });

        fetchMutation(CheckoutQuery.getSaveAddressInformation(
            addressInformation,
            this._getGuestCartId()
        )).then(
            ({ saveAddressInformation: data }) => {
                const { payment_methods, totals } = data;

                BrowserDatabase.setItem(
                    totals,
                    PAYMENT_TOTALS,
                    ONE_MONTH_IN_SECONDS
                );

                this.setState({
                    isLoading: false,
                    paymentMethods: payment_methods,
                    checkoutStep: BILLING_STEP,
                    paymentTotals: totals
                });
            },
            this._handleError
        );
    }

    savePaymentInformation(paymentInformation) {
        const { paymentMethod: { method } } = paymentInformation;
        this.setState({ isLoading: true });

        if (this.customPaymentMethods.includes(method)) {
            this.savePaymentMethodAndPlaceOrder(paymentInformation);
            return;
        }

        this.savePaymentInformationAndPlaceOrder(paymentInformation);
    }

    async savePaymentMethodAndPlaceOrder(paymentInformation) {
        const { paymentMethod: { method: code, additional_data } } = paymentInformation;
        const guest_cart_id = !isSignedIn() ? this._getGuestCartId() : '';

        try {
            await fetchMutation(CheckoutQuery.getSetPaymentMethodOnCartMutation({
                guest_cart_id,
                payment_method: {
                    code, [code]: additional_data
                }
            }));

            const orderData = await fetchMutation(CheckoutQuery.getPlaceOrderMutation(guest_cart_id));
            const { placeOrder: { order: { order_id } } } = orderData;

            this.setDetailsStep(order_id);
        } catch (e) {
            this._handleError(e);
        }
    }

    savePaymentInformationAndPlaceOrder(paymentInformation) {
        fetchMutation(CheckoutQuery.getSavePaymentInformationAndPlaceOrder(
            paymentInformation,
            this._getGuestCartId()
        )).then(
            ({ savePaymentInformationAndPlaceOrder: data }) => {
                const { orderID } = data;
                this.setDetailsStep(orderID);
            },
            this._handleError
        );
    }

    render() {
        return (
            <Checkout
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);
