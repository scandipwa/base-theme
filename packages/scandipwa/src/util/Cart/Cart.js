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

import {
    DISPLAY_SHIPPING_PRICES_BOTH,
    DISPLAY_SHIPPING_PRICES_EXCL_TAX
} from 'Component/CheckoutDeliveryOption/CheckoutDeliveryOption.config';
import { OUT_OF_STOCK } from 'Component/ProductCard/ProductCard.config';
import { CONFIGURABLE } from 'Util/Product';

export const DISPLAY_CART_TAX_IN_SUBTOTAL_INCL_TAX = 'DISPLAY_CART_TAX_IN_SUBTOTAL_INCL_TAX';
export const DISPLAY_CART_TAX_IN_SUBTOTAL_EXL_TAX = 'DISPLAY_CART_TAX_IN_SUBTOTAL_EXL_TAX';
export const DISPLAY_CART_TAX_IN_SUBTOTAL_BOTH = 'DISPLAY_CART_TAX_IN_SUBTOTAL_BOTH';

export const DISPLAY_CART_TAX_IN_SHIPPING_INCL_TAX = 'DISPLAY_CART_TAX_IN_SHIPPING_INCL_TAX';
export const DISPLAY_CART_TAX_IN_SHIPPING_EXL_TAX = 'DISPLAY_CART_TAX_IN_SHIPPING_EXL_TAX';
export const DISPLAY_CART_TAX_IN_SHIPPING_BOTH = 'DISPLAY_CART_TAX_IN_SHIPPING_BOTH';

export const DISPLAY_CART_TAX_IN_PRICE_INCL_TAX = 'DISPLAY_CART_TAX_IN_PRICE_INCL_TAX';
export const DISPLAY_CART_TAX_IN_PRICE_EXL_TAX = 'DISPLAY_CART_TAX_IN_PRICE_EXL_TAX';
export const DISPLAY_CART_TAX_IN_PRICE_BOTH = 'DISPLAY_CART_TAX_IN_PRICE_BOTH';

/**
 * Checks whether item in cart are out of stock
 * @namespace Util/Cart/itemIsOutOfStock
 * */
export const itemIsOutOfStock = (item) => {
    const {
        product: {
            stock_status,
            variants,
            type_id
        },
        sku: itemSku
    } = item;

    if (stock_status === OUT_OF_STOCK) {
        // item is out of stock
        return true;
    }

    if (type_id !== CONFIGURABLE) {
        // item is not configurable => previous check is sufficient
        return false;
    }

    if (
        variants.some(({ sku }) => sku === itemSku)
        && variants.find(({ sku }) => sku === itemSku).stock_status !== OUT_OF_STOCK
    ) {
        // item added to cart is present in variants and it stock status is IN_STOCK
        return false;
    }

    return true;
};

/**
 * Checks whether some items in cart are out of stock
 * @param {Array} items cartTotals items
 * @namespace Util/Cart/hasOutOfStockProductsInCartItems */
export const hasOutOfStockProductsInCartItems = (items = []) => items.some(itemIsOutOfStock);

/** @namespace Util/Cart/getCartSubtotal */
export const getCartSubtotal = (state) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_subtotal
            } = {}
        } = {},
        CartReducer: {
            cartTotals: {
                subtotal = 0,
                subtotal_incl_tax = 0
            } = {}
        } = {}
    } = state;

    if (display_tax_in_subtotal === DISPLAY_CART_TAX_IN_SUBTOTAL_EXL_TAX) {
        return subtotal;
    }

    return subtotal_incl_tax;
};

/** @namespace Util/Cart/getCartSubtotalSubPrice */
export const getCartSubtotalSubPrice = (state) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_subtotal
            } = {}
        } = {},
        CartReducer: {
            cartTotals: {
                subtotal = 0
            } = {}
        } = {}
    } = state;

    if (display_tax_in_subtotal === DISPLAY_CART_TAX_IN_SUBTOTAL_BOTH) {
        return subtotal;
    }

    return null;
};

/** @namespace Util/Cart/getCartItemPrice */
export const getCartItemPrice = (state) => (props) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_price
            } = {}
        } = {}
    } = state;

    const {
        row_total = 0,
        row_total_incl_tax = 0
    } = props;

    if (display_tax_in_price === DISPLAY_CART_TAX_IN_PRICE_EXL_TAX) {
        return row_total;
    }

    return row_total_incl_tax;
};

/** @namespace Util/Cart/getCartItemSubPrice */
export const getCartItemSubPrice = (state) => (props) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_price
            } = {}
        } = {}
    } = state;

    const {
        row_total = 0
    } = props;

    if (display_tax_in_price === DISPLAY_CART_TAX_IN_PRICE_BOTH) {
        return row_total;
    }

    return null;
};

/** @namespace Util/Cart/getCartShippingPrice */
export const getCartShippingPrice = (state) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_shipping_amount
            } = {}
        } = {},
        CartReducer: {
            cartTotals: {
                shipping_amount = 0,
                shipping_incl_tax = 0
            } = {}
        } = {}
    } = state;

    if (display_tax_in_shipping_amount === DISPLAY_CART_TAX_IN_SHIPPING_EXL_TAX) {
        return shipping_amount;
    }

    return shipping_incl_tax;
};

/** @namespace Util/Cart/getCartShippingSubPrice */
export const getCartShippingSubPrice = (state) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                display_tax_in_shipping_amount
            } = {}
        } = {},
        CartReducer: {
            cartTotals: {
                shipping_amount = 0
            } = {}
        } = {}
    } = state;

    if (display_tax_in_shipping_amount === DISPLAY_CART_TAX_IN_SHIPPING_BOTH) {
        return shipping_amount;
    }

    return null;
};

/** @namespace Util/Cart/getCartShippingItemPrice */
export const getCartShippingItemPrice = (state) => (props) => {
    const {
        ConfigReducer: {
            priceTaxDisplay: {
                shipping_price_display_type
            } = {}
        } = {}
    } = state;

    const {
        price_incl_tax = 0,
        price_excl_tax = 0
    } = props;

    if (shipping_price_display_type === DISPLAY_SHIPPING_PRICES_EXCL_TAX) {
        return price_excl_tax;
    }

    return price_incl_tax;
};

/** @namespace Util/Cart/getCartShippingItemSubPrice */
export const getCartShippingItemSubPrice = (state) => (props) => {
    const {
        ConfigReducer: {
            priceTaxDisplay: {
                shipping_price_display_type
            } = {}
        } = {}
    } = state;

    const {
        price_excl_tax = 0
    } = props;

    if (shipping_price_display_type === DISPLAY_SHIPPING_PRICES_BOTH) {
        return price_excl_tax;
    }

    return null;
};

/** @namespace Util/Cart/getCartTotalSubPrice */
export const getCartTotalSubPrice = (state) => {
    const {
        ConfigReducer: {
            cartDisplayConfig: {
                include_tax_in_order_total
            } = {}
        } = {},
        CartReducer: {
            cartTotals: {
                grand_total = 0,
                tax_amount = 0
            } = {}
        } = {}
    } = state;

    if (include_tax_in_order_total) {
        return grand_total - tax_amount;
    }

    return null;
};

/** @namespace Util/Cart/getItemsCountLabel */
export const getItemsCountLabel = (items_qty) => (items_qty === 1 ? __('1 item') : __('%s items', items_qty || 0));
