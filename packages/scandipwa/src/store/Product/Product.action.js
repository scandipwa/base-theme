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

export const UPDATE_PRODUCT_DETAILS = 'UPDATE_PRODUCT_DETAILS';

export const UPDATE_PRODUCT_QUANTITY = 'UPDATE_PRODUCT_QUANTITY';

/**
 * Update product list with new list (rewrite if already exists).
 * @param  {Array<Object>} items List of products returned from fetch
 * @param  {Number} totalItems Total number of products in this filter
 * @return {void}
 * @namespace Store/Product/Action/updateProductDetails
 */
export const updateProductDetails = (product) => ({
    type: UPDATE_PRODUCT_DETAILS,
    product
});

export const updateProductQuantity = (quantity) => ({
    type: UPDATE_PRODUCT_QUANTITY,
    quantity
});
