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

import { formatPrice } from 'Util/Price';

/** @namespace Util/Category/Filters/getPriceFilterLabel */
export const getPriceFilterLabel = (from, to, currencyCode) => {
    const priceFrom = formatPrice(from, currencyCode);
    const priceTo = formatPrice(to, currencyCode);

    if (from === '*') {
        return __('Up to %s', priceTo);
    }

    if (to === '*') {
        return __('From %s', priceFrom);
    }

    return __('From %s to %s', priceFrom, priceTo);
};

/** @namespace Util/Category/Filters/getFiltersCount */
export const getFiltersCount = (filters) => Object.values(filters).reduce((prev, next) => prev + next.length, 0);
