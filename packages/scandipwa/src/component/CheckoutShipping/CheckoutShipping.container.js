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
import { connect } from 'react-redux';

import {
    STORE_IN_PICK_UP_ATTRIBUTE_CODE,
    STORE_IN_PICK_UP_METHOD_CODE
} from 'Component/StoreInPickUp/StoreInPickUp.config';
import { updateShippingFields } from 'Store/Checkout/Checkout.action';
import { customerType } from 'Type/Account';
import { shippingMethodsType } from 'Type/Checkout';
import { getFormFields, trimAddressFields, trimCustomerAddress } from 'Util/Address';
import { getCartTotalSubPrice } from 'Util/Cart';

import CheckoutShipping from './CheckoutShipping.component';

/** @namespace Component/CheckoutShipping/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    customer: state.MyAccountReducer.customer,
    addressLinesQty: state.ConfigReducer.address_lines_quantity,
    totals: state.CartReducer.cartTotals,
    cartTotalSubPrice: getCartTotalSubPrice(state)
});

/** @namespace Component/CheckoutShipping/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    updateShippingFields: (fields) => dispatch(updateShippingFields(fields))
});

/** @namespace Component/CheckoutShipping/Container */
export class CheckoutShippingContainer extends PureComponent {
    static propTypes = {
        saveAddressInformation: PropTypes.func.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        customer: customerType.isRequired,
        addressLinesQty: PropTypes.number.isRequired,
        updateShippingFields: PropTypes.func.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired
    };

    containerFunctions = {
        onShippingSuccess: this.onShippingSuccess.bind(this),
        onShippingError: this.onShippingError.bind(this),
        onAddressSelect: this.onAddressSelect.bind(this),
        onShippingMethodSelect: this.onShippingMethodSelect.bind(this),
        onStoreSelect: this.onStoreSelect.bind(this)
    };

    __construct(props) {
        super.__construct(props);

        const { shippingMethods } = props;
        const [selectedShippingMethod] = shippingMethods;
        const { method_code = '' } = selectedShippingMethod || {};

        this.state = {
            selectedCustomerAddressId: 0,
            isSubmitted: false,
            selectedShippingMethod: method_code && method_code !== STORE_IN_PICK_UP_METHOD_CODE
                ? selectedShippingMethod
                : {}
        };
    }

    getStoreAddress(shippingAddress) {
        const {
            selectedStoreAddress: {
                region,
                city,
                postcode,
                phone,
                street,
                name,
                pickup_location_code
            }
        } = this.state;

        return {
            ...shippingAddress,
            region,
            city,
            postcode,
            telephone: phone,
            street: [street],
            firstname: name,
            lastname: 'Store',
            extension_attributes: [
                {
                    attribute_code: STORE_IN_PICK_UP_ATTRIBUTE_CODE,
                    value: pickup_location_code
                }
            ]
        };
    }

    onAddressSelect(id) {
        this.setState({ selectedCustomerAddressId: id });
    }

    onShippingMethodSelect(method) {
        const { onShippingMethodSelect } = this.props;

        this.setState({ selectedShippingMethod: method });
        onShippingMethodSelect(method);
    }

    onShippingError() {
        // TODO: implement notification if some data in Form can not display error
        const { isSubmitted } = this.state;
        this.setState({ isSubmitted: !isSubmitted });
    }

    onStoreSelect(address) {
        this.setState({ selectedStoreAddress: address });
    }

    onShippingSuccess(fields) {
        const {
            saveAddressInformation,
            updateShippingFields,
            addressLinesQty
        } = this.props;

        const {
            selectedCustomerAddressId,
            selectedShippingMethod,
            selectedStoreAddress
        } = this.state;

        const formFields = getFormFields(fields, addressLinesQty);

        const shippingAddress = selectedCustomerAddressId
            ? this._getAddressById(selectedCustomerAddressId)
            : trimAddressFields(formFields);

        const {
            carrier_code: shipping_carrier_code,
            method_code: shipping_method_code
        } = selectedShippingMethod;

        const data = {
            billing_address: shippingAddress,
            shipping_address: selectedStoreAddress ? this.getStoreAddress(shippingAddress) : shippingAddress,
            shipping_carrier_code,
            shipping_method_code
        };

        saveAddressInformation(data);
        updateShippingFields(fields);
    }

    _getAddressById(addressId) {
        const { customer: { addresses } } = this.props;
        const address = addresses.find(({ id }) => id === addressId);

        return {
            ...trimCustomerAddress(address),
            save_in_address_book: false,
            id: addressId
        };
    }

    render() {
        return (
            <CheckoutShipping
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutShippingContainer);
