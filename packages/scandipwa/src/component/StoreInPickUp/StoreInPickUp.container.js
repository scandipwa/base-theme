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
import { connect } from 'react-redux';

import { STORE_IN_PICK_UP_POPUP_ID } from 'Component/StoreInPickUpPopup/StoreInPickUpPopup.config';
import { hideActiveOverlay } from 'Store/Overlay/Overlay.action';
import { showPopup } from 'Store/Popup/Popup.action';
import { addressType } from 'Type/Account';
import { shippingMethodsType } from 'Type/Checkout';

import StoreInPickUp from './StoreInPickUp.component';

/** @namespace Component/StoreInPickUp/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showPopup: (popupId) => dispatch(showPopup(popupId)),
    hideActiveOverlay: () => dispatch(hideActiveOverlay())
});

/** @namespace Component/StoreInPickUp/Container/mapStateToProps */
export const mapStateToProps = () => ({});

/** @namespace Component/StoreInPickUp/Container */
export class StoreInPickUpContainer extends PureComponent {
    static propTypes = {
        showPopup: PropTypes.func.isRequired,
        estimateAddress: addressType.isRequired,
        shippingMethods: shippingMethodsType.isRequired,
        onStoreSelect: PropTypes.func.isRequired,
        onShippingMethodSelect: PropTypes.func.isRequired,
        countryId: PropTypes.string.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired,
        setSelectedShippingMethodCode: PropTypes.func
    };

    static defaultProps = {
        setSelectedShippingMethodCode: null
    };

    containerFunctions = {
        handleOpenPopup: this.handleOpenPopup.bind(this),
        setSelectedStore: this.setSelectedStore.bind(this)
    };

    state = {
        selectedStore: null
    };

    containerProps = () => {
        const {
            countryId,
            estimateAddress,
            onShippingMethodSelect,
            onStoreSelect,
            shippingMethods,
            setSelectedShippingMethodCode
        } = this.props;
        const { selectedStore } = this.state;

        return {
            countryId,
            estimateAddress,
            onShippingMethodSelect,
            onStoreSelect,
            selectedStore,
            shippingMethods,
            setSelectedShippingMethodCode
        };
    };

    handleOpenPopup() {
        const { showPopup } = this.props;

        showPopup(STORE_IN_PICK_UP_POPUP_ID);
    }

    setSelectedStore(store) {
        this.setState({ selectedStore: store });
    }

    render() {
        return (
            <StoreInPickUp
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreInPickUpContainer);
