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

import currencyMap from './Price.config';

/** @namespace Util/Price/formatCurrency */
export const formatCurrency = (currency = 'USD') => currencyMap[currency];

/** @namespace Util/Price/formatPrice */
export const formatPrice = (price, currency = 'USD') => {
    const language = navigator.languages ? navigator.languages[0] : navigator.language;

    return new Intl.NumberFormat(language, { style: 'currency', currency }).format(price);
};

/**
 * Calculate final price
 * @param {Number} discount discount percentage
 * @param {Number} min minimum price
 * @param {Number} reg regular price
 * @return {Number} final price
 * @namespace Util/Price/calculateFinalPrice
 */
export const calculateFinalPrice = (discount, min, reg) => (discount ? min : reg);

/**
 * Calculate final price
 * @param {Number} price
 * @return {Number} price rounded to 2 digits
 * @namespace Util/Price/roundPrice
 */
export const roundPrice = (price) => parseFloat(price).toFixed(2);

/** @namespace Util/Price/getLowestPriceTiersPrice */
export const getLowestPriceTiersPrice = (price_tiers, currency) => {
    const lowestValue = price_tiers
        .reduce((acc, { final_price: { value } }) => (acc < value ? acc : value), price_tiers[0].final_price.value);

    return formatPrice(lowestValue, currency);
};
