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

import CheckoutAddressBook from 'Component/CheckoutAddressBook';
import CheckoutDeliveryOptions from 'Component/CheckoutDeliveryOptions';
import Form from 'Component/Form';
import Loader from 'Component/Loader';
import { STORE_IN_PICK_UP_METHOD_CODE } from 'Component/StoreInPickUp/StoreInPickUp.config';
import { SHIPPING_STEP } from 'Route/Checkout/Checkout.config';
import { addressType } from 'Type/Account';
import { shippingMethodsType, shippingMethodType } from 'Type/Checkout';

/** @namespace Component/CheckoutShipping/Component */
export class CheckoutShipping extends PureComponent {
    static propTypes = {
        obtainOrderTotal: PropTypes.object.isRequired,
        onShippingSuccess: PropTypes.func.isRequired,
        onShippingError: PropTypes.func.isRequired,
        onShippingEstimationFieldsChange: PropTypes.func.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired,
        selectedShippingMethod: shippingMethodType,
        onAddressSelect: PropTypes.func.isRequired,
        onStoreSelect: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        estimateAddress: addressType.isRequired,
        selectedStoreAddress: addressType
    };

    static defaultProps = {
        selectedShippingMethod: null,
        selectedStoreAddress: {}
    };

    renderActions() {
        const { selectedShippingMethod, selectedStoreAddress, obtainOrderTotal } = this.props;
        const { method_code } = selectedShippingMethod;

        return (
            <div block="Checkout" elem="StickyButtonWrapper">
                { obtainOrderTotal }
                <button
                  type="submit"
                  block="Button"
                  disabled={ !selectedShippingMethod
                      || (method_code === STORE_IN_PICK_UP_METHOD_CODE && !Object.keys(selectedStoreAddress).length) }
                  mix={ { block: 'CheckoutShipping', elem: 'Button' } }
                >
                    { __('Proceed to billing') }
                </button>
            </div>
        );
    }

    renderDelivery() {
        const {
            shippingMethods,
            onShippingMethodSelect,
            estimateAddress,
            onStoreSelect
        } = this.props;

        return (
            <CheckoutDeliveryOptions
              shippingMethods={ shippingMethods }
              onShippingMethodSelect={ onShippingMethodSelect }
              estimateAddress={ estimateAddress }
              onStoreSelect={ onStoreSelect }
            />
        );
    }

    renderAddressBook() {
        const {
            onAddressSelect,
            onShippingEstimationFieldsChange
        } = this.props;

        return (
            <CheckoutAddressBook
              onAddressSelect={ onAddressSelect }
              onShippingEstimationFieldsChange={ onShippingEstimationFieldsChange }
            />
        );
    }

    render() {
        const {
            onShippingSuccess,
            onShippingError,
            isLoading
        } = this.props;

        return (
            <Form
              id={ SHIPPING_STEP }
              mix={ { block: 'CheckoutShipping' } }
              onSubmitError={ onShippingError }
              onSubmitSuccess={ onShippingSuccess }
            >
                { this.renderAddressBook() }
                <div>
                    <Loader isLoading={ isLoading } />
                    { this.renderDelivery() }
                    { this.renderActions() }
                </div>
            </Form>
        );
    }
}

export default CheckoutShipping;
