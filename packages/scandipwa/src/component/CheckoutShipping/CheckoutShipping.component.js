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
import StoreInPickUpComponent from 'Component/StoreInPickUp';
import { SHIPPING_STEP } from 'Route/Checkout/Checkout.config';
import { addressType } from 'Type/Account';
import { shippingMethodsType, shippingMethodType } from 'Type/Checkout';
import { TotalsType } from 'Type/MiniCart';
import { formatPrice } from 'Util/Price';

import './CheckoutShipping.style';

/** @namespace Component/CheckoutShipping/Component */
export class CheckoutShipping extends PureComponent {
    static propTypes = {
        totals: TotalsType.isRequired,
        cartTotalSubPrice: PropTypes.number,
        onShippingSuccess: PropTypes.func.isRequired,
        onShippingError: PropTypes.func.isRequired,
        onShippingEstimationFieldsChange: PropTypes.func.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired,
        selectedShippingMethod: shippingMethodType,
        onAddressSelect: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isSubmitted: PropTypes.bool,
        onStoreSelect: PropTypes.func.isRequired,
        estimateAddress: addressType.isRequired,
        handleSelectDeliveryMethod: PropTypes.func.isRequired,
        isPickInStoreMethodSelected: PropTypes.bool.isRequired,
        setSelectedShippingMethodCode: PropTypes.func
    };

    static defaultProps = {
        selectedShippingMethod: null,
        setSelectedShippingMethodCode: null,
        isSubmitted: false,
        cartTotalSubPrice: null
    };

    renderOrderTotalExlTax() {
        const {
            cartTotalSubPrice,
            totals: { quote_currency_code }
        } = this.props;

        if (!cartTotalSubPrice) {
            return null;
        }

        const orderTotalExlTax = formatPrice(cartTotalSubPrice, quote_currency_code);

        return (
            <span>
                { `${ __('Excl. tax:') } ${ orderTotalExlTax }` }
            </span>
        );
    }

    renderOrderTotal() {
        const {
            totals: {
                grand_total,
                quote_currency_code
            }
        } = this.props;

        const orderTotal = formatPrice(grand_total, quote_currency_code);

        return (
            <dl block="Checkout" elem="OrderTotal">
                <dt>
                    { __('Order total:') }
                </dt>
                <dt>
                    { orderTotal }
                    { this.renderOrderTotalExlTax() }
                </dt>
            </dl>
        );
    }

    renderActions() {
        const { selectedShippingMethod } = this.props;

        return (
            <div block="Checkout" elem="StickyButtonWrapper">
                { this.renderOrderTotal() }
                <button
                  type="submit"
                  block="Button"
                  disabled={ !selectedShippingMethod }
                  mix={ { block: 'CheckoutShipping', elem: 'Button' } }
                >
                    { __('Proceed to billing') }
                </button>
            </div>
        );
    }

    renderPickInStoreMethod() {
        const {
            estimateAddress: { country_id },
            shippingMethods,
            onStoreSelect,
            onShippingMethodSelect,
            estimateAddress,
            setSelectedShippingMethodCode
        } = this.props;

        return (
            <StoreInPickUpComponent
              countryId={ country_id }
              shippingMethods={ shippingMethods }
              onStoreSelect={ onStoreSelect }
              onShippingMethodSelect={ onShippingMethodSelect }
              estimateAddress={ estimateAddress }
              setSelectedShippingMethodCode={ setSelectedShippingMethodCode }
            />
        );
    }

    renderDelivery() {
        const {
            shippingMethods,
            onShippingMethodSelect,
            estimateAddress,
            onStoreSelect,
            handleSelectDeliveryMethod
        } = this.props;

        return (
            <CheckoutDeliveryOptions
              shippingMethods={ shippingMethods }
              onShippingMethodSelect={ onShippingMethodSelect }
              estimateAddress={ estimateAddress }
              onStoreSelect={ onStoreSelect }
              handleSelectDeliveryMethod={ handleSelectDeliveryMethod }
            />
        );
    }

    renderAddressBook() {
        const {
            onAddressSelect,
            onShippingEstimationFieldsChange,
            isSubmitted
        } = this.props;

        return (
            <CheckoutAddressBook
              onAddressSelect={ onAddressSelect }
              onShippingEstimationFieldsChange={ onShippingEstimationFieldsChange }
              isSubmitted={ isSubmitted }
            />
        );
    }

    renderContent() {
        const { isLoading, isPickInStoreMethodSelected } = this.props;

        if (isPickInStoreMethodSelected) {
            return this.renderPickInStoreMethod();
        }

        return (
            <>
                { this.renderAddressBook() }
                <div>
                    <Loader isLoading={ isLoading } />
                    { this.renderDelivery() }
                    { this.renderActions() }
                </div>
            </>
        );
    }

    render() {
        const {
            onShippingSuccess,
            onShippingError
        } = this.props;

        return (
            <Form
              id={ SHIPPING_STEP }
              mix={ { block: 'CheckoutShipping' } }
              onSubmitError={ onShippingError }
              onSubmitSuccess={ onShippingSuccess }
            >
                { this.renderContent() }
            </Form>
        );
    }
}

export default CheckoutShipping;
