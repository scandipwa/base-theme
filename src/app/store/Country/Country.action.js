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

const GET_COUNTRY_LIST = 'GET_COUNTRY_LIST';

const getCountryList = countries => ({
    type: GET_COUNTRY_LIST,
    countries
});

export {
    getCountryList,
    GET_COUNTRY_LIST
};
