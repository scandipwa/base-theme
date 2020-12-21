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

import { UPDATE_CONFIG, UPDATE_CONFIG_DEVICE } from './Config.action';

export const MAX_WIDTH = 150;
export const MAX_HEIGHT = 40;

/** @namespace Store/Config/Reducer/filterStoreConfig */
export const filterStoreConfig = (config) => Object.entries(config).reduce(
    (acc, [key, value]) => (value !== null ? { ...acc, [key]: value } : acc),
    {}
);

export const {
    countries, reviewRatings, storeConfig, currencyData
} = BrowserDatabase.getItem('config') || {
    countries: [],
    reviewRatings: [],
    storeConfig: {},
    currencyData: {}
};

/** @namespace Store/Config/Reducer/getIndexedRatings */
export const getIndexedRatings = (reviewRatings) => ((reviewRatings) ? reviewRatings.items || [] : []);

/** @namespace Store/Config/Reducer/getCurrencyData */
export const getCurrencyData = (base, state) => ((base) || state.currencyData || {});

/** @namespace Store/Config/Reducer/getInitialState */
export const getInitialState = () => ({
    ...filterStoreConfig(storeConfig),
    countries,
    reviewRatings,
    checkoutAgreements: [],
    currencyData,
    isLoading: true,
    device: {
        isMobile: true,
        android: true,
        ios: false,
        blackberry: false,
        opera: false,
        windows: false,
        standaloneMode: window.matchMedia('(display-mode: standalone)').matches
    }
});

/** @namespace Store/Config/Reducer */
export const ConfigReducer = (
    state = getInitialState(),
    action
) => {
    const {
        type,
        config: {
            countries,
            reviewRatings,
            checkoutAgreements,
            currencyData,
            storeConfig = {}
        } = {},
        device
    } = action;

    switch (type) {
    case UPDATE_CONFIG:
        const filteredStoreConfig = filterStoreConfig(storeConfig);
        const { secure_base_media_url } = filteredStoreConfig;
        window.secure_base_media_url = secure_base_media_url;

        return {
            ...state,
            countries,
            reviewRatings: getIndexedRatings(reviewRatings),
            checkoutAgreements,
            currencyData: getCurrencyData(currencyData, state),
            ...filteredStoreConfig,
            // Should be updated manually as filteredStoreConfig does not contain header_logo_src when it is null
            // and header_logo_src takes old value
            isLoading: false
        };

    case UPDATE_CONFIG_DEVICE:
        return {
            ...state,
            device: {
                ...state.device,
                ...device
            }
        };

    default:
        return state;
    }
};

export default ConfigReducer;
