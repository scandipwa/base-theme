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
    SHOW_OFFLINE_NOTICE,
    SET_BIG_OFFLINE_NOTICE
} from './Offline.action';

export const initialState = {
    isOffline: true,
    isBig: false
};

const OfflineReducer = (state = initialState, action) => {
    switch (action.type) {
    case SHOW_OFFLINE_NOTICE:
        const { isOffline } = action;

        return {
            ...state,
            isOffline
        };
    case SET_BIG_OFFLINE_NOTICE:
        const { isBig } = action;

        return {
            ...state,
            isBig
        };
    default:
        return state;
    }
};

export default OfflineReducer;
