/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/scandipwa
 * @link https://github.com/scandipwa/scandipwa
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import StoreInPickUpPopupComponent from 'Component/StoreInPickUpPopup';
import StoreInPickUpStoreComponent from 'Component/StoreInPickUpStore';
import { addressType } from 'Type/Account';
import { shippingMethodsType, storeType } from 'Type/Checkout';

import './StoreInPickUp.style';

/** @namespace Component/StoreInPickUp/Component */
export class StoreInPickUpComponent extends PureComponent {
    static propTypes = {
        selectStore: PropTypes.func,
        handleOpenPopup: PropTypes.func.isRequired,
        countryId: PropTypes.string.isRequired,
        estimateAddress: addressType.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        onStoreSelect: PropTypes.func.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired,
        setSelectedStore: PropTypes.func.isRequired,
        setSelectedShippingMethodCode: PropTypes.func,
        selectedStore: storeType
    };

    static defaultProps = {
        selectedStore: null,
        selectStore: null,
        setSelectedShippingMethodCode: null
    };

    renderEmptyResult() {
        return (
            <span block="StoreInPickUp" elem="Empty">
                { __('We could not preselect pickup location based on available information, '
                + 'please select it manually.') }
            </span>
        );
    }

    renderHeading() {
        return (
            <h3
              block="StoreInPickUp"
              elem="Heading"
            >
                { __('Store') }
            </h3>
        );
    }

    renderStore() {
        const { selectStore, selectedStore, setSelectedShippingMethodCode } = this.props;
        const { pickup_location_code } = selectedStore;

        return (
            <StoreInPickUpStoreComponent
              store={ selectedStore }
              selectStore={ selectStore }
              key={ pickup_location_code }
              setSelectedShippingMethodCode={ setSelectedShippingMethodCode }
              isSelectedStore
            />
        );
    }

    renderResult() {
        const { selectedStore } = this.props;

        if (!selectedStore) {
            return this.renderEmptyResult();
        }

        return (
            <div block="StoreInPickUp" elem="Results">
                { this.renderStore() }
            </div>
        );
    }

    renderPopup() {
        const {
            countryId,
            estimateAddress,
            shippingMethods,
            onStoreSelect,
            onShippingMethodSelect,
            setSelectedStore
        } = this.props;

        return (
            <StoreInPickUpPopupComponent
              countryId={ countryId }
              estimateAddress={ estimateAddress }
              shippingMethods={ shippingMethods }
              onStoreSelect={ onStoreSelect }
              onShippingMethodSelect={ onShippingMethodSelect }
              setSelectedStore={ setSelectedStore }
            />
        );
    }

    renderActions() {
        const { handleOpenPopup, selectedStore } = this.props;

        return (
            <div
              block="StoreInPickUp"
              elem="Actions"
            >
                <button
                  block="StoreInPickUp"
                  elem="SelectButton"
                  mix={ { block: 'Button' } }
                  type="button"
                  onClick={ handleOpenPopup }
                >
                   { __('Select store') }
                </button>
                <button
                  type="submit"
                  block="Button"
                  mix={ { block: 'CheckoutShipping', elem: 'Button' } }
                  disabled={ !selectedStore }
                >
                    { __('Proceed to billing') }
                </button>
            </div>
        );
    }

    render() {
        return (
            <div
              block="StoreInPickUp"
              elem="Wrapper"
            >
                { this.renderHeading() }
                { this.renderResult() }
                { this.renderActions() }
                { this.renderPopup() }
            </div>
        );
    }
}

export default StoreInPickUpComponent;
