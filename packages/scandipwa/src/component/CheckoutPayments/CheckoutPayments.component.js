/* eslint-disable no-console */
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

import CheckoutPayment from 'Component/CheckoutPayment';
import Klarna from 'Component/Klarna';
import NotSupportedPayment from 'Component/NotSupportedPayment';
import { PurchaseOrder } from 'Component/PurchaseOrder/PurchaseOrder.component';
import { BILLING_STEP } from 'Route/Checkout/Checkout.config';
import { paymentMethodsType } from 'Type/Checkout';

import { KLARNA, PURCHASE_ORDER } from './CheckoutPayments.config';

import './CheckoutPayments.style';

/** @namespace Component/CheckoutPayments/Component */
export class CheckoutPayments extends PureComponent {
    static propTypes = {
        showError: PropTypes.func.isRequired,
        selectPaymentMethod: PropTypes.func.isRequired,
        paymentMethods: paymentMethodsType.isRequired,
        setOrderButtonEnableStatus: PropTypes.func.isRequired,
        selectedPaymentCode: PropTypes.string.isRequired,
        billingAddress: PropTypes.shape({
            city: PropTypes.string,
            company: PropTypes.string,
            country_id: PropTypes.string,
            email: PropTypes.string,
            firstname: PropTypes.string,
            lastname: PropTypes.string,
            postcode: PropTypes.string,
            region_id: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ]),
            region: PropTypes.oneOfType([
                PropTypes.object,
                PropTypes.string
            ]),
            street: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.array
            ]),
            telephone: PropTypes.string
        }).isRequired
    };

    paymentRenderMap = {
        [KLARNA]: this.renderKlarnaPayment.bind(this),
        [PURCHASE_ORDER]: this.renderPurchaseOrderPayment.bind(this)
    };

    state = {
        hasError: false
    };

    componentDidCatch(error, info) {
        const { showError, setOrderButtonEnableStatus } = this.props;

        console.groupCollapsed('Suppressed error log:');
        console.error(error.toString(), info.toString());
        console.groupEnd();

        this.setState(
            { hasError: true },
            () => {
                setOrderButtonEnableStatus(false);
                showError(`${error} Please try again later`);
            }
        );
    }

    renderKlarnaPayment() {
        const { setOrderButtonEnableStatus } = this.props;

        return <Klarna setOrderButtonEnableStatus={ setOrderButtonEnableStatus } />;
    }

    renderPurchaseOrderPayment() {
        return <PurchaseOrder id={ BILLING_STEP } />;
    }

    renderNotSupported() {
        const { setOrderButtonEnableStatus } = this.props;

        return <NotSupportedPayment disableButton={ setOrderButtonEnableStatus } />;
    }

    renderPayment = (method) => {
        const {
            selectPaymentMethod,
            selectedPaymentCode
        } = this.props;

        const { code } = method;
        const isSelected = selectedPaymentCode === code;

        return (
            <CheckoutPayment
              key={ code }
              isSelected={ isSelected }
              method={ method }
              onClick={ selectPaymentMethod }
            />
        );
    };

    renderPayments() {
        const { paymentMethods } = this.props;

        return paymentMethods.map(this.renderPayment);
    }

    renderSelectedPayment() {
        const { selectedPaymentCode } = this.props;
        const render = this.paymentRenderMap[selectedPaymentCode];
        if (!render) {
            return null;
        }

        return render();
    }

    renderHeading() {
        return (
            <h2 block="Checkout" elem="Heading">
                { __('Payment method') }
            </h2>
        );
    }

    renderContent() {
        const { hasError } = this.state;

        if (hasError) {
            return (
                <p>{ __('The error occurred during initializing payment methods. Please try again later!') }</p>
            );
        }

        return (
            <>
                { this.renderHeading() }
                <ul block="CheckoutPayments" elem="Methods">
                    { this.renderPayments() }
                </ul>
                { this.renderSelectedPayment() }
            </>
        );
    }

    render() {
        return (
            <div block="CheckoutPayments">
                { this.renderContent() }
            </div>
        );
    }
}

export default CheckoutPayments;
