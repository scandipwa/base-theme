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

import { storeType } from 'Type/Checkout';

import StoreInPickUpStoreComponent from './StoreInPickUpStore.component';

/** @namespace Component/StoreInPickUpStore/Container */
export class StoreInPickUpStoreContainer extends PureComponent {
    static propTypes = {
        selectStore: PropTypes.func,
        isSelectedStore: PropTypes.bool,
        store: storeType.isRequired
    };

    static defaultProps = {
        selectStore: null,

        isSelectedStore: false
    };

    containerFunctions = {
        handleSelectStore: this.handleSelectStore.bind(this)
    };

    containerProps() {
        const { store, isSelectedStore } = this.props;

        return { store, isSelectedStore };
    }

    handleSelectStore() {
        const { selectStore, store } = this.props;

        selectStore(store);
    }

    render() {
        return (
            <StoreInPickUpStoreComponent
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default StoreInPickUpStoreContainer;
