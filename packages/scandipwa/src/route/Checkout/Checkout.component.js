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

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CartCoupon from 'Component/CartCoupon';
import CheckoutBilling from 'Component/CheckoutBilling';
import CheckoutGuestForm from 'Component/CheckoutGuestForm';
import CheckoutOrderSummary from 'Component/CheckoutOrderSummary';
import CheckoutShipping from 'Component/CheckoutShipping';
import CheckoutSuccess from 'Component/CheckoutSuccess';
import CmsBlock from 'Component/CmsBlock';
import ContentWrapper from 'Component/ContentWrapper';
import ExpandableContent from 'Component/ExpandableContent';
import { CHECKOUT, CHECKOUT_SUCCESS } from 'Component/Header/Header.config';
import Loader from 'Component/Loader';
import { addressType } from 'Type/Account';
import { paymentMethodsType, shippingMethodsType } from 'Type/Checkout';
import { HistoryType } from 'Type/Common';
import { TotalsType } from 'Type/MiniCart';
import { appendWithStoreCode } from 'Util/Url';

import {
    BILLING_STEP,
    CHECKOUT_URL,
    DETAILS_STEP,
    SHIPPING_STEP
} from './Checkout.config';

import './Checkout.style';

/** @namespace Route/Checkout/Component */
export class Checkout extends PureComponent {
    static propTypes = {
        setLoading: PropTypes.func.isRequired,
        setDetailsStep: PropTypes.func.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        onShippingEstimationFieldsChange: PropTypes.func.isRequired,
        setHeaderState: PropTypes.func.isRequired,
        paymentMethods: paymentMethodsType.isRequired,
        saveAddressInformation: PropTypes.func.isRequired,
        savePaymentInformation: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isDeliveryOptionsLoading: PropTypes.bool.isRequired,
        shippingAddress: addressType.isRequired,
        billingAddress: addressType.isRequired,
        estimateAddress: addressType.isRequired,
        checkoutTotals: TotalsType.isRequired,
        orderID: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        isEmailAvailable: PropTypes.bool.isRequired,
        selectedShippingMethod: PropTypes.string.isRequired,
        history: HistoryType.isRequired,
        onEmailChange: PropTypes.func.isRequired,
        paymentTotals: TotalsType,
        checkoutStep: PropTypes.oneOf([
            SHIPPING_STEP,
            BILLING_STEP,
            DETAILS_STEP
        ]).isRequired,
        isCreateUser: PropTypes.bool.isRequired,
        onCreateUserChange: PropTypes.func.isRequired,
        onPasswordChange: PropTypes.func.isRequired,
        isGuestEmailSaved: PropTypes.bool.isRequired,
        goBack: PropTypes.func.isRequired,
        totals: TotalsType.isRequired,
        isMobile: PropTypes.bool.isRequired,
        onCouponCodeUpdate: PropTypes.func.isRequired,
        isPickInStoreMethodSelected: PropTypes.bool.isRequired,
        handleSelectDeliveryMethod: PropTypes.func.isRequired,
        isInStoreActivated: PropTypes.bool.isRequired
    };

    static defaultProps = {
        paymentTotals: {}
    };

    stepMap = {
        [SHIPPING_STEP]: {
            title: __('Shipping step'),
            url: '/shipping',
            render: this.renderShippingStep.bind(this),
            areTotalsVisible: true,
            renderCartCoupon: this.renderCartCoupon.bind(this)
        },
        [BILLING_STEP]: {
            title: __('Billing step'),
            url: '/billing',
            render: this.renderBillingStep.bind(this),
            areTotalsVisible: true,
            renderCartCoupon: this.renderCartCoupon.bind(this)
        },
        [DETAILS_STEP]: {
            title: __('Thank you for your purchase!'),
            url: '/success',
            render: this.renderDetailsStep.bind(this),
            areTotalsVisible: false
        }
    };

    componentDidMount() {
        const { checkoutStep, history } = this.props;
        const { url } = this.stepMap[checkoutStep];

        this.updateHeader();

        history.replace(appendWithStoreCode(`${ CHECKOUT_URL }${ url }`));
    }

    componentDidUpdate(prevProps) {
        const { checkoutStep } = this.props;
        const { checkoutStep: prevCheckoutStep } = prevProps;

        if (checkoutStep !== prevCheckoutStep) {
            this.updateHeader();
            this.updateStep();
        }
    }

    updateHeader() {
        const { setHeaderState, checkoutStep, goBack } = this.props;
        const { title = '' } = this.stepMap[checkoutStep];

        setHeaderState({
            name: checkoutStep === DETAILS_STEP ? CHECKOUT_SUCCESS : CHECKOUT,
            title,
            onBackClick: () => goBack()
        });
    }

    updateStep() {
        const { checkoutStep, history } = this.props;
        const { url } = this.stepMap[checkoutStep];

        history.push(appendWithStoreCode(`${ CHECKOUT_URL }${ url }`));
    }

    renderTitle() {
        const { checkoutStep } = this.props;
        const { title = '' } = this.stepMap[checkoutStep];

        return (
            <h2 block="Checkout" elem="Title">
                { title }
            </h2>
        );
    }

    renderGuestForm() {
        const {
            checkoutStep,
            isCreateUser,
            onEmailChange,
            onCreateUserChange,
            onPasswordChange,
            isGuestEmailSaved
        } = this.props;
        const isBilling = checkoutStep === BILLING_STEP;

        return (
            <CheckoutGuestForm
              isBilling={ isBilling }
              isCreateUser={ isCreateUser }
              onEmailChange={ onEmailChange }
              onCreateUserChange={ onCreateUserChange }
              onPasswordChange={ onPasswordChange }
              isGuestEmailSaved={ isGuestEmailSaved }
            />
        );
    }

    renderShippingStep() {
        const {
            shippingMethods,
            onShippingEstimationFieldsChange,
            saveAddressInformation,
            isDeliveryOptionsLoading,
            onPasswordChange,
            onCreateUserChange,
            onEmailChange,
            isCreateUser,
            estimateAddress,
            isPickInStoreMethodSelected,
            handleSelectDeliveryMethod
        } = this.props;

        return (
            <CheckoutShipping
              isLoading={ isDeliveryOptionsLoading }
              shippingMethods={ shippingMethods }
              saveAddressInformation={ saveAddressInformation }
              onShippingEstimationFieldsChange={ onShippingEstimationFieldsChange }
              onPasswordChange={ onPasswordChange }
              onCreateUserChange={ onCreateUserChange }
              onEmailChange={ onEmailChange }
              isCreateUser={ isCreateUser }
              estimateAddress={ estimateAddress }
              handleSelectDeliveryMethod={ handleSelectDeliveryMethod }
              isPickInStoreMethodSelected={ isPickInStoreMethodSelected }
            />
        );
    }

    renderBillingStep() {
        const {
            setLoading,
            setDetailsStep,
            shippingAddress,
            paymentMethods = [],
            savePaymentInformation,
            selectedShippingMethod
        } = this.props;

        return (
            <CheckoutBilling
              setLoading={ setLoading }
              paymentMethods={ paymentMethods }
              setDetailsStep={ setDetailsStep }
              shippingAddress={ shippingAddress }
              savePaymentInformation={ savePaymentInformation }
              selectedShippingMethod={ selectedShippingMethod }
            />
        );
    }

    renderDetailsStep() {
        const {
            orderID,
            isEmailAvailable,
            email,
            billingAddress: {
                firstname,
                lastname
            }
        } = this.props;

        return (
            <CheckoutSuccess
              email={ email }
              firstName={ firstname }
              lastName={ lastname }
              isEmailAvailable={ isEmailAvailable }
              orderID={ orderID }
            />
        );
    }

    renderStep() {
        const { checkoutStep } = this.props;
        const { render } = this.stepMap[checkoutStep];

        if (render) {
            return render();
        }

        return null;
    }

    renderLoader() {
        const { isLoading } = this.props;
        return <Loader isLoading={ isLoading } />;
    }

    renderSummary(showOnMobile = false) {
        const {
            checkoutTotals,
            checkoutStep,
            paymentTotals,
            isMobile,
            totals: { coupon_code },
            onCouponCodeUpdate
        } = this.props;
        const { areTotalsVisible } = this.stepMap[checkoutStep];

        if (!areTotalsVisible || (showOnMobile && !isMobile) || (!showOnMobile && isMobile)) {
            return null;
        }

        return (
            <CheckoutOrderSummary
              checkoutStep={ checkoutStep }
              totals={ checkoutTotals }
              paymentTotals={ paymentTotals }
              isExpandable={ isMobile }
              couponCode={ coupon_code }
              // eslint-disable-next-line react/jsx-no-bind
              renderCmsBlock={ () => this.renderPromo(true) }
              onCouponCodeUpdate={ onCouponCodeUpdate }
            />
        );
    }

    renderCoupon() {
        const { checkoutStep } = this.props;
        const { renderCartCoupon } = this.stepMap[checkoutStep];

        if (renderCartCoupon) {
            return renderCartCoupon();
        }

        return null;
    }

    renderCartCoupon() {
        const {
            totals: { coupon_code },
            isMobile,
            onCouponCodeUpdate,
            checkoutStep
        } = this.props;

        if (isMobile || checkoutStep === SHIPPING_STEP) {
            return null;
        }

        return (
            <ExpandableContent
              heading={ __('Have a discount code?') }
              mix={ { block: 'Checkout', elem: 'Coupon' } }
            >
                <CartCoupon
                  couponCode={ coupon_code }
                  onCouponCodeUpdate={ onCouponCodeUpdate }
                />
            </ExpandableContent>
        );
    }

    renderPromo(showOnMobile = false) {
        const { checkoutStep, isMobile } = this.props;
        const isBilling = checkoutStep === BILLING_STEP;

        if (!showOnMobile && isMobile) {
            return null;
        }

        const {
            checkout_content: {
                [isBilling ? 'checkout_billing_cms' : 'checkout_shipping_cms']: promo
            } = {}
        } = window.contentConfiguration;

        if (!promo) {
            return null;
        }

        return <CmsBlock identifier={ promo } />;
    }

    renderStoreInPickUpMethod() {
        const {
            isPickInStoreMethodSelected,
            handleSelectDeliveryMethod,
            checkoutStep,
            isInStoreActivated
        } = this.props;

        if (checkoutStep !== SHIPPING_STEP || !isInStoreActivated) {
            return null;
        }

        return (
            <div
              block="Checkout"
              elem="DeliverySelect"
            >
                <button
                  block="Checkout"
                  elem="ShippingButton"
                  mix={ { block: 'Button', mods: { isHollow: !isPickInStoreMethodSelected } } }
                  type="button"
                  disabled={ !isPickInStoreMethodSelected }
                  onClick={ handleSelectDeliveryMethod }
                >
                   { __('Shipping') }
                </button>
                <button
                  block="Checkout"
                  elem="PickInStore"
                  mix={ { block: 'Button', mods: { isHollow: isPickInStoreMethodSelected } } }
                  type="button"
                  disabled={ isPickInStoreMethodSelected }
                  onClick={ handleSelectDeliveryMethod }
                >
                    { __('Pick in Store') }
                </button>
            </div>
        );
    }

    render() {
        return (
            <main block="Checkout">
                <ContentWrapper
                  wrapperMix={ { block: 'Checkout', elem: 'Wrapper' } }
                  label={ __('Checkout page') }
                >
                    { this.renderSummary(true) }
                    <div block="Checkout" elem="Step">
                        { this.renderTitle() }
                        { this.renderStoreInPickUpMethod() }
                        { this.renderGuestForm() }
                        { this.renderStep() }
                        { this.renderLoader() }
                    </div>
                    <div>
                        { this.renderSummary() }
                        { this.renderPromo() }
                        { this.renderCoupon() }
                    </div>
                </ContentWrapper>
            </main>
        );
    }
}

export default Checkout;
