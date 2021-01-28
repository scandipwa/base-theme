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
import { getIndexedProduct } from 'Util/Product';

import { UPDATE_PRODUCT_DETAILS, UPDATE_PRODUCT_QUANTITY } from './Product.action';

/** @namespace Store/Product/Reducer/getInitialState */
export const getInitialState = () => ({
    product: {},
    formattedConfigurableOptions: {}
});

/** @namespace Store/Product/Reducer/formatConfigurableOptions */
export const formatConfigurableOptions = (configurable_options) => configurable_options
    .reduce((prev, option) => {
        const {
            attribute_id,
            label,
            attribute_code
        } = option;

        return {
            ...prev,
            [attribute_code]: {
                attribute_id,
                label
            }
        };
    }, {});

/** @namespace Store/Product/Reducer */
export const ProductReducer = (
    state = getInitialState(),
    action
) => {
    switch (action.type) {
    case UPDATE_PRODUCT_DETAILS:
        const { product } = action;

        return {
            ...state,
            product: getIndexedProduct(product)
        };
    case UPDATE_PRODUCT_QUANTITY:
        const { quantity } = action;

        return {
            ...state,
            quantity
        };

    default:
        return state;
    }
};

export default ProductReducer;
