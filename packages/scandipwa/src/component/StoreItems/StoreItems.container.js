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

import StoreItems from './StoreItems.component';

/** @namespace Component/StoreItems/Container/storeItemsContainer */
export class StoreItemsContainer extends PureComponent {
    static propTypes = {
        item: PropTypes.object.isRequired,
        handleStoreSelect: PropTypes.func.isRequired
    };

    containerFunctions = {
        getStoreCode: this.getStoreCode.bind(this)
    };

    containerProps = () => {
        const { item } = this.props;

        return { item };
    };

    getStoreCode() {
        const { item: { value }, handleStoreSelect } = this.props;

        handleStoreSelect(value);
    }

    render() {
        return (
            <StoreItems
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default StoreItemsContainer;
