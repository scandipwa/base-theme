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
import { updateLinkedProducts } from 'Store/LinkedProducts/LinkedProducts.action';
import { showNotification } from 'Store/Notification/Notification.action';
import BrowserDatabase from 'Util/BrowserDatabase';
import { getIndexedProduct } from 'Util/Product';
import { fetchQuery, QueryDispatcher } from 'Util/Request';
import { ONE_MONTH_IN_SECONDS } from 'Util/Request/QueryDispatcher';

export const LINKED_PRODUCTS = 'LINKED_PRODUCTS';

/**
 * Linked Prodcts List Dispatcher
 * @class LinkedProductsDispatcher
 * @extends QueryDispatcher
 * @namespace Store/LinkedProducts/Dispatcher
 */
export class LinkedProductsDispatcher extends QueryDispatcher {
    __construct() {
        super.__construct('LinkedProducts', ONE_MONTH_IN_SECONDS);
    }

    onSuccess(data, dispatch, product_links) {
        const linkedProducts = this._processResponse(data, product_links);

        BrowserDatabase.setItem(linkedProducts, LINKED_PRODUCTS);
        dispatch(updateLinkedProducts(linkedProducts));
    }

    onError(error, dispatch) {
        dispatch(showNotification('error', __('Error fetching LinkedProducts!'), error));
    }

    /**
     * Prepare LinkedProducts query
     * @return {Query} ProductList query
     * @memberof LinkedProductsDispatcher
     * @param product_links
     */
    prepareRequest(product_links) {
        const relatedSKUs = product_links.reduce((links, link) => {
            const { linked_product_sku } = link;

            return [...links, `${ linked_product_sku.replace(/ /g, '%20') }`];
        }, []);

        return [
            ProductListQuery.getQuery({
                args: {
                    filter: {
                        productsSkuArray: relatedSKUs
                    }
                },
                notRequireInfo: true
            })
        ];
    }

    /**
     * Clear linked products list
     * @param {{productsSkuArray: Array<String>}} options A object containing different aspects of query, each item can be omitted
     * @return {Query} ProductList query
     * @memberof LinkedProductsDispatcher
     */
    clearLinkedProducts(dispatch, updateCrossSell = false) {
        const linkedProducts = {
            upsell: { total_count: 0, items: [] },
            related: { total_count: 0, items: [] },
            crosssell: { total_count: 0, items: [] }
        };

        BrowserDatabase.setItem(linkedProducts, LINKED_PRODUCTS);

        dispatch(updateLinkedProducts({
            ...linkedProducts,
            updateCrossSell
        }));
    }

    async fetchCrossSellProducts(dispatch, product_links) {
        const query = this.prepareRequest(product_links);
        const data = await fetchQuery(query);
        const { crosssell } = this._processResponse(data, product_links);
        const linkedProducts = BrowserDatabase.getItem(LINKED_PRODUCTS) || {};

        Object.assign(linkedProducts, {
            crosssell,
            updateCrossSell: true
        });

        dispatch(updateLinkedProducts(linkedProducts));
    }

    clearCrossSellProducts(dispatch) {
        const linkedProducts = BrowserDatabase.getItem(LINKED_PRODUCTS) || {};

        Object.assign(linkedProducts, {
            crosssell: { total_count: 0, items: [] },
            updateCrossSell: true
        });

        dispatch(updateLinkedProducts(linkedProducts));
    }

    _processResponse(data, product_links) {
        const { products: { items } } = data;

        const indexedBySku = items.reduce((acc, item) => {
            const { sku } = item;
            acc[sku] = getIndexedProduct(item);

            return acc;
        }, {});

        const linkedProducts = product_links.reduce((acc, link) => {
            const { linked_product_sku, link_type } = link;

            if (indexedBySku[linked_product_sku] && acc[link_type]) {
                acc[link_type].items.push(
                    indexedBySku[linked_product_sku]
                );

                acc[link_type].total_count++;
            }

            return acc;
        }, {
            upsell: { total_count: 0, items: [] },
            related: { total_count: 0, items: [] },
            crosssell: { total_count: 0, items: [] },
            associated: { total_count: 0, items: [] }
        });

        return linkedProducts;
    }
}

export default new LinkedProductsDispatcher();
