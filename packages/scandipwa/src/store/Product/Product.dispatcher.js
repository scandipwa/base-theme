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
import { updateNoMatch } from 'Store/NoMatch/NoMatch.action';
import { updateProductDetails } from 'Store/Product/Product.action';
import { QueryDispatcher } from 'Util/Request';

export const LinkedProductsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/LinkedProducts/LinkedProducts.dispatcher'
);

/**
 * Product List Dispatcher
 * @class ProductDispatcher
 * @extends ProductDispatcher
 * @namespace Store/Product/Dispatcher
 */
export class ProductDispatcher extends QueryDispatcher {
    __construct() {
        super.__construct('Product');
    }

    onSuccess(data, dispatch) {
        const { products: { items } } = data;

        /**
         * In case there are no items, or item count is
         * smaller then 0 => the product was not found.
         */
        if (!items || items.length <= 0) {
            dispatch(updateNoMatch(true));

            return;
        }

        const [product] = items;

        const product_links = items.reduce((links, product) => {
            const { product_links } = product;

            if (product_links) {
                Object.values(product_links).forEach((item) => {
                    links.push(item);
                });
            }

            return links;
        }, []);

        LinkedProductsDispatcher.then(
            ({ default: dispatcher }) => {
                if (product_links.length > 0) {
                    dispatcher.handleData(dispatch, product_links);
                } else {
                    dispatcher.clearLinkedProducts(dispatch);
                }
            }
        );

        dispatch(updateProductDetails(product));
    }

    onError(_, dispatch) {
        dispatch(updateNoMatch(true));
    }

    prepareRequest(options) {
        return ProductListQuery.getQuery(options);
    }
}

export default new ProductDispatcher();
