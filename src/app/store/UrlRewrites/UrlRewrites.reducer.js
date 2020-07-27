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
    CLEAR_URL_REWRITE,
    IS_LOADING_URL_REWRITE,
    UPDATE_URL_REWRITE
} from './UrlRewrites.action';

export const initialState = {
    urlRewrite: {},
    isLoading: false
};

const UrlRewritesReducer = (state = initialState, action) => {
    switch (action.type) {
    case UPDATE_URL_REWRITE:
        const { urlRewrite } = action;

        return {
            ...state,
            isLoading: false,
            urlRewrite
        };
    case CLEAR_URL_REWRITE:
        return {
            ...state,
            urlRewrite: {}
        };
    case IS_LOADING_URL_REWRITE:
        const { isLoading } = action;

        return {
            ...state,
            isLoading
        };
    default:
        return state;
    }
};

export default UrlRewritesReducer;
