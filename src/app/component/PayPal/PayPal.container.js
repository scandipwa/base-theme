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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isSignedIn } from 'Util/Auth';
import { CartDispatcher } from 'Store/Cart';
import { fetchMutation } from 'Util/Request';
import { CheckoutQuery, PayPalQuery } from 'Query';
import { showNotification } from 'Store/Notification';
import { DETAILS_STEP } from 'Route/Checkout/Checkout.component';
import PayPal from './PayPal.component';

export const PAYPAL_SCRIPT = 'PAYPAL_SCRIPT';

export const mapStateToProps = state => ({
    cartTotals: state.CartReducer.cartTotals
});

export const mapDispatchToProps = dispatch => ({
    showNotification: (type, message, e) => dispatch(showNotification(type, __(message), e))
});

export class PayPalContainer extends PureComponent {
    static propTypes = {
        setLoading: PropTypes.func.isRequired,
        setDetailsStep: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired
    };

    componentDidMount() {
        const script = document.getElementById(PAYPAL_SCRIPT);
        script.onload = () => this.forceUpdate();
    }

    containerProps = () => ({
        paypal: this.getPayPal(),
        clientId: this.getClientID(),
        environment: this.getEnvironment()
    });

    containerFunctions = () => ({
        onError: this.onError,
        onCancel: this.onCancel,
        onApprove: this.onApprove,
        createOrder: this.createOrder
    });

    onApprove = async (data) => {
        const { showNotification, setDetailsStep } = this.props;
        const { orderID, payerID } = data;
        const guest_cart_id = this._getGuestQuoteId();

        try {
            await fetchMutation(CheckoutQuery.getSetPaymentMethodOnCartMutation({
                guest_cart_id,
                payment_method: {
                    code: 'paypal_express',
                    paypal_express: {
                        token: orderID,
                        payer_id: payerID
                    }
                }
            }));

            const orderData = await fetchMutation(CheckoutQuery.getPlaceOrderMutation(guest_cart_id));
            const { placeOrder: { order: { order_id } } } = orderData;

            setDetailsStep(order_id);
        } catch (e) {
            showNotification('error', 'Something went wrong');
        }
    };

    onCancel = (data) => {
        const { showNotification, setLoading } = this.props;
        setLoading(false);
        showNotification('error', 'Your payment has been canceled', data);
    };

    onError = (err) => {
        const { showNotification, setLoading } = this.props;
        setLoading(false);
        showNotification('error', 'Some error appeared with PayPal', err);
    };

    getPayPal = () => {
        const { paypal } = window;
        return paypal || false;
    };

    getClientID = () => {
        const { PAYPAL_CLIENT_ID } = process.env;
        return PAYPAL_CLIENT_ID || 'sb';
    };

    getEnvironment = () => {
        const { PAYPAL_SANDBOX_STATUS } = process.env;
        return PAYPAL_SANDBOX_STATUS === 'ENABLED' ? 'sandbox' : 'production';
    };

    createOrder = async () => {
        const { setLoading } = this.props;

        const guest_cart_id = this._getGuestQuoteId();

        const {
            paypalExpress: { token }
        } = await fetchMutation(PayPalQuery.getCreatePaypalExpressTokenMutation({
            guest_cart_id,
            express_button: false,
            code: 'paypal_express',
            urls: {
                cancel_url: 'www.paypal.com/checkoutnow/error',
                return_url: 'www.paypal.com/checkoutnow/error'
            }
        }));

        setLoading(true);

        return token;
    };

    _getGuestQuoteId = () => (isSignedIn() ? '' : CartDispatcher._getGuestQuoteId());

    render() {
        return (
            <PayPal
              { ...this.props }
              { ...this.containerProps() }
              { ...this.containerFunctions() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PayPalContainer);
