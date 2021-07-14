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
import { lazy, PureComponent, Suspense } from 'react';

import CheckoutGuestForm from 'Component/CheckoutGuestForm';
import ContentWrapper from 'Component/ContentWrapper';
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

export const CartCoupon = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-info" */
    'Component/CartCoupon'
));

export const CmsBlock = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-info" */
    'Component/CmsBlock'
));

export const CheckoutOrderSummary = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-info" */
    'Component/CheckoutOrderSummary'
));

export const CheckoutBilling = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-billing" */
    'Component/CheckoutBilling'
));

export const CheckoutShipping = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-shipping" */
    'Component/CheckoutShipping'
));

export const CheckoutSuccess = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-success" */
    'Component/CheckoutSuccess'
));

export const ExpandableContent = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "checkout-info" */
    'Component/ExpandableContent'
));

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
        cartTotalSubPrice: PropTypes.number.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired
    };

    static defaultProps = {
        paymentTotals: {}
    };

    stepMap = {
        [SHIPPING_STEP]: {
            number: 1,
            title: __('Personal information'),
            url: '/shipping',
            render: this.renderShippingStep.bind(this),
            areTotalsVisible: true
        },
        [BILLING_STEP]: {
            number: 2,
            title: __('Payment'),
            url: '/billing',
            render: this.renderBillingStep.bind(this),
            areTotalsVisible: true
        },
        [DETAILS_STEP]: {
            title: __('Thank you for your purchase!'),
            mobileTitle: __('Order details'),
            url: '/success',
            render: this.renderDetailsStep.bind(this),
            areTotalsVisible: false
        }
    };

    stepsCount = 2;

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
        const { mobileTitle, title } = this.stepMap[checkoutStep];

        setHeaderState({
            name: checkoutStep === DETAILS_STEP ? CHECKOUT_SUCCESS : CHECKOUT,
            title: mobileTitle || title,
            onBackClick: () => goBack()
        });
    }

    updateStep() {
        const { checkoutStep, history } = this.props;
        const { url } = this.stepMap[checkoutStep];

        history.push(appendWithStoreCode(`${ CHECKOUT_URL }${ url }`));
    }

    renderTitle() {
        const { checkoutStep, totals: { is_virtual } } = this.props;
        const { title = '', number } = this.stepMap[checkoutStep];

        if (is_virtual || !number) {
            return (
                <div block="Checkout" elem="Header">
                    <div block="Checkout" elem="Title">{ title }</div>
                </div>
            );
        }

        return (
            <div block="Checkout" elem="ProgressSection">
                <div block="Checkout" elem="Header">
                    <div block="Checkout" elem="Title">{ title }</div>
                    <div block="Checkout" elem="Step">
                        <span block="Checkout" elem="SelectedStep">{ number }</span>
                        <span block="Checkout" elem="StepsBorder">/</span>
                        <span block="Checkout" elem="TotalSteps">{ this.stepsCount }</span>
                    </div>
                </div>
                <div block="Checkout" elem="StepBarTotal" />
                <div block="Checkout" elem="StepBarActive" mods={ { isSecond: number === 2 } } />
            </div>
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
            cartTotalSubPrice,
            onShippingMethodSelect
        } = this.props;

        return (
            <Suspense fallback={ <Loader /> }>
                <CheckoutShipping
                  isLoading={ isDeliveryOptionsLoading }
                  shippingMethods={ shippingMethods }
                  cartTotalSubPrice={ cartTotalSubPrice }
                  saveAddressInformation={ saveAddressInformation }
                  onShippingEstimationFieldsChange={ onShippingEstimationFieldsChange }
                  onShippingMethodSelect={ onShippingMethodSelect }
                  onPasswordChange={ onPasswordChange }
                  onCreateUserChange={ onCreateUserChange }
                  onEmailChange={ onEmailChange }
                  isCreateUser={ isCreateUser }
                  estimateAddress={ estimateAddress }
                />
            </Suspense>
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
            <Suspense fallback={ <Loader /> }>
                <CheckoutBilling
                  setLoading={ setLoading }
                  paymentMethods={ paymentMethods }
                  setDetailsStep={ setDetailsStep }
                  shippingAddress={ shippingAddress }
                  savePaymentInformation={ savePaymentInformation }
                  selectedShippingMethod={ selectedShippingMethod }
                />
            </Suspense>
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
            <Suspense fallback={ <Loader /> }>
                <CheckoutSuccess
                  email={ email }
                  firstName={ firstname }
                  lastName={ lastname }
                  isEmailAvailable={ isEmailAvailable }
                  orderID={ orderID }
                />
            </Suspense>
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
            isMobile
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
              // eslint-disable-next-line react/jsx-no-bind
              renderCmsBlock={ () => this.renderPromo(true) }
              showItems
            />
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
                        { this.renderGuestForm() }
                        { this.renderStep() }
                        { this.renderLoader() }
                    </div>
                    <div>
                        <Suspense fallback={ <Loader /> }>
                            { this.renderSummary() }
                            { this.renderPromo() }
                        </Suspense>
                    </div>
                </ContentWrapper>
            </main>
        );
    }
}

export default Checkout;
