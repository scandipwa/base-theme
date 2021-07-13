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

import CheckoutDeliveryOption from 'Component/CheckoutDeliveryOption';
import StoreInPickUp from 'Component/StoreInPickUp';
import { STORE_IN_PICK_UP_METHOD_CODE } from 'Component/StoreInPickUp/StoreInPickUp.config';
import { addressType } from 'Type/Account';
import { shippingMethodsType } from 'Type/Checkout';

import './CheckoutDeliveryOptions.style';

/** @namespace Component/CheckoutDeliveryOptions/Component */
export class CheckoutDeliveryOptions extends PureComponent {
    static propTypes = {
        shippingMethods: shippingMethodsType.isRequired,
        selectShippingMethod: PropTypes.func.isRequired,
        onStoreSelect: PropTypes.func.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired,
        setSelectedShippingMethodCode: PropTypes.func.isRequired,
        selectedShippingMethodCode: PropTypes.string,
        estimateAddress: addressType.isRequired
    };

    static defaultProps = {
        selectedShippingMethodCode: null
    };

    shippingRenderMap = {
        [STORE_IN_PICK_UP_METHOD_CODE]: this.renderStoreInPickUp.bind(this)
    };

    renderHeading() {
        return (
            <h2 block="Checkout" elem="Heading">
                { __('Shipping method') }
            </h2>
        );
    }

    renderStoreInPickUp() {
        const {
            estimateAddress,
            shippingMethods,
            onStoreSelect,
            onShippingMethodSelect,
            setSelectedShippingMethodCode
        } = this.props;

        return (
            <StoreInPickUp
              estimateAddress={ estimateAddress }
              shippingMethods={ shippingMethods }
              onStoreSelect={ onStoreSelect }
              onShippingMethodSelect={ onShippingMethodSelect }
              setSelectedShippingMethodCode={ setSelectedShippingMethodCode }
            />
        );
    }

    renderDeliveryOption = (option) => {
        const {
            selectedShippingMethodCode,
            selectShippingMethod
        } = this.props;

        const { carrier_code, method_code } = option;
        const isSelected = selectedShippingMethodCode === method_code;

        return (
            <CheckoutDeliveryOption
              key={ carrier_code }
              isSelected={ isSelected }
              option={ option }
              onClick={ selectShippingMethod }
            />
        );
    };

    renderNoDeliveryOptions() {
        return (
            <p block="CheckoutDeliveryOptions" elem="NoOptions">
                { __('There are no shipping methods available, try different address.') }
            </p>
        );
    }

    renderShippingMethods() {
        const { shippingMethods } = this.props;
        if (!shippingMethods.length) {
            return this.renderNoDeliveryOptions();
        }

        return shippingMethods.map(this.renderDeliveryOption);
    }

    renderSelectedShippingMethod() {
        const { selectedShippingMethodCode } = this.props;
        const render = this.shippingRenderMap[selectedShippingMethodCode];
        if (!render) {
            return null;
        }

        return render();
    }

    render() {
        return (
            <div block="CheckoutDeliveryOptions">
                { this.renderHeading() }
                <ul block="CheckoutPayments" elem="Methods">
                    { this.renderShippingMethods() }
                </ul>
                { this.renderSelectedShippingMethod() }
            </div>
        );
    }
}

export default CheckoutDeliveryOptions;
