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

import BrowserDatabase from 'Util/BrowserDatabase';
import { getIndexedProduct } from 'Util/Product';
import { UPDATE_TOTALS } from './Cart.action';

export const PRODUCTS_IN_CART = 'cart_products';
export const CART_TOTALS = 'cart_totals';

const updateCartTotals = (action) => {
    const { cartData: cartTotals } = action;
    // let { cartTotals } = state;
    if (Object.hasOwnProperty.call(cartTotals, 'items')) {
        const normalizedItemsProduct = cartTotals.items.map((item) => {
            item.product = getIndexedProduct(item.product);
            return item;
        });
        cartTotals.items = normalizedItemsProduct;
    }

    BrowserDatabase.setItem(
        cartTotals,
        CART_TOTALS
    );

    return { cartTotals };
};

const initialState = {
    cartTotals: BrowserDatabase.getItem(CART_TOTALS) || {}
};

const CartReducer = (state = initialState, action) => {
    const { type } = action;

    switch (type) {
    case UPDATE_TOTALS:
        return updateCartTotals(action, state);

    default:
        return state;
    }
};

export default CartReducer;
