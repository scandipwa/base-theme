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

import CheckoutPayment from 'Component/CheckoutPayment';
import { paymentMethodsType } from 'Type/Checkout';
import Braintree from 'Component/Braintree';

import './CheckoutPayments.style';

export const BRAINTREE = 'braintree';
export const CHECK_MONEY = 'checkmo';

class CheckoutPayments extends PureComponent {
    static propTypes = {
        initBraintree: PropTypes.func.isRequired,
        paymentMethods: paymentMethodsType.isRequired,
        selectPaymentMethod: PropTypes.func.isRequired,
        selectedPaymentCode: PropTypes.oneOf([
            BRAINTREE,
            CHECK_MONEY
        ]).isRequired
    };

    paymentRenderMap = {
        [BRAINTREE]: this.renderBrainTreePayment.bind(this)
    };

    renderBrainTreePayment() {
        const { initBraintree } = this.props;
        return <Braintree init={ initBraintree } />;
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
        if (!render) return null;
        return render();
    }

    renderHeading() {
        return (
            <h2 block="Checkout" elem="Heading">
                { __('Select payment method') }
            </h2>
        );
    }

    render() {
        return (
            <div block="CheckoutPayments">
                { this.renderHeading() }
                <ul block="CheckoutPayments" elem="Methods">
                    { this.renderPayments() }
                </ul>
                { this.renderSelectedPayment() }
            </div>
        );
    }
}

export default CheckoutPayments;
