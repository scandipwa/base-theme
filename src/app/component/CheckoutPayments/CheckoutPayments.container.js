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

import BraintreeDropIn from 'Util/Braintree';
import { paymentMethodsType } from 'Type/Checkout';

import { BILLING_STEP } from 'Route/Checkout/Checkout.component';
import { BRAINTREE_CONTAINER_ID } from 'Component/Braintree/Braintree.component';
import CheckoutPayments, { BRAINTREE } from './CheckoutPayments.component';

export class CheckoutPaymentsContainer extends PureComponent {
    static propTypes = {
        onPaymentMethodSelect: PropTypes.func.isRequired,
        paymentMethods: paymentMethodsType.isRequired
    };

    containerFunctions = {
        initBraintree: this.initBraintree.bind(this),
        selectPaymentMethod: this.selectPaymentMethod.bind(this)
    };

    braintree = new BraintreeDropIn(BRAINTREE_CONTAINER_ID);

    dataMap = {
        [BRAINTREE]: this.getBraintreeData.bind(this)
    };

    constructor(props) {
        super(props);

        const { paymentMethods } = props;
        const [method] = paymentMethods;
        const { code } = method || {};

        this.state = { selectedPaymentCode: code };
    }

    componentDidMount() {
        if (window.formPortalCollector) {
            window.formPortalCollector.subscribe(BILLING_STEP, this.collectAdditionalData);
        }
    }

    componentWillUnmount() {
        if (window.formPortalCollector) {
            window.formPortalCollector.unsubscribe(BILLING_STEP, this.collectAdditionalData);
        }
    }

    getBraintreeData() {
        return { asyncData: this.braintree.requestPaymentNonce() };
    }

    collectAdditionalData = () => {
        const { selectedPaymentCode } = this.state;
        const additionalDataGetter = this.dataMap[selectedPaymentCode];
        if (!additionalDataGetter) return {};
        return additionalDataGetter();
    };

    initBraintree() {
        return this.braintree.create();
    }

    selectPaymentMethod(paymentMethod) {
        const { onPaymentMethodSelect } = this.props;
        const { code } = paymentMethod;
        this.setState({ selectedPaymentCode: code });
        onPaymentMethodSelect(code);
    }

    render() {
        return (
            <CheckoutPayments
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.state }
            />
        );
    }
}

export default CheckoutPaymentsContainer;
