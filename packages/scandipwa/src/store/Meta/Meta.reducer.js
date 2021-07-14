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

import { UPDATE_META } from './Meta.action';

export const updateEveryTime = [
    'title',
    'description',
    'keywords',
    'canonical_url',
    'robots',
    'status_code'
];

/** @namespace Store/Meta/Reducer/filterData */
export const filterData = (data) => {
    const updated = updateEveryTime.reduce((acc, key) => {
        acc[key] = data[key];

        return acc;
    }, {});

    return { ...data, ...updated };
};

/** @namespace Store/Meta/Reducer/getInitialState */
export const getInitialState = () => ({
    title: '',
    title_prefix: '',
    title_suffix: '',
    description: '',
    keywords: '',
    canonical_url: '',
    robots: '',
    status_code: ''
});

/** @namespace Store/Meta/Reducer */
export const MetaReducer = (
    state = getInitialState(),
    action
) => {
    const { payload = {}, type } = action;

    switch (type) {
    case UPDATE_META:
        const filteredData = filterData(payload);

        return {
            ...state,
            ...filteredData
        };

    default:
        return state;
    }
};

export default MetaReducer;
