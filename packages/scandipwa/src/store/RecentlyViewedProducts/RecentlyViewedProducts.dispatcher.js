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

import ProductListQuery from 'Query/ProductList.query';
import { showNotification } from 'Store/Notification/Notification.action';
import {
    updateLoadStatus,
    updateRecentlyViewedProducts
} from 'Store/RecentlyViewedProducts/RecentlyViewedProducts.action';
import { QueryDispatcher } from 'Util/Request';
import getStore from 'Util/Store';

/**
 * RecentlyViewedProducts Dispatcher
 * @class RecentlyViewedProductsDispatcher
 * @extends QueryDispatcher
 * @namespace Store/RecentlyViewedProducts/Dispatcher
 */
export class RecentlyViewedProductsDispatcher extends QueryDispatcher {
    __construct() {
        super.__construct('recentlyViewedProducts');
    }

    onSuccess({ products: { items } }, dispatch) {
        const state = getStore().getState();
        const {
            code: storeCode
        } = state.ConfigReducer;

        dispatch(updateRecentlyViewedProducts(items, storeCode));
    }

    onError(error, dispatch) {
        dispatch(showNotification('error', __('Error fetching Recently Viewed Products Information!'), error));
    }

    /**
     * Prepare recentlyViewedProducts query
     * @return {Query} RecentlyViewedProducts query
     * @memberof recentlyViewedProductsDispatcher
     * @param recentlyViewedProducts
     */
    prepareRequest(options, dispatch) {
        const { recentProducts, store } = options;
        const recentlyViewedProductsSKUs = recentProducts[store].reduce((productSKUs, item) => {
            const { sku } = item;

            return [...productSKUs, `${ sku.replace(/ /g, '%20') }`];
        }, []);

        dispatch(updateLoadStatus(true));

        return [
            ProductListQuery.getQuery({
                args: {
                    filter: {
                        productsSkuArray: recentlyViewedProductsSKUs
                    }
                },
                notRequireInfo: true
            })
        ];
    }
}

export default new RecentlyViewedProductsDispatcher();
