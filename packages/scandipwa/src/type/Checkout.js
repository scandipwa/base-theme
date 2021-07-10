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

import PropTypes from 'prop-types';

export const paymentMethodType = PropTypes.shape({
    code: PropTypes.string,
    title: PropTypes.string
});

export const paymentMethodsType = PropTypes.arrayOf(
    paymentMethodType
);

export const shippingMethodType = PropTypes.shape({
    amount: PropTypes.number,
    available: PropTypes.bool,
    base_amount: PropTypes.number,
    carrier_code: PropTypes.string,
    carrier_title: PropTypes.string,
    error_message: PropTypes.string,
    method_code: PropTypes.string,
    method_title: PropTypes.string,
    price_excl_tax: PropTypes.number,
    price_incl_tax: PropTypes.number
});

export const shippingMethodsType = PropTypes.arrayOf(
    shippingMethodType
);

export const storeType = PropTypes.shape({
    city: PropTypes.string,
    country: PropTypes.string,
    description: PropTypes.string,
    name: PropTypes.string,
    phone: PropTypes.string,
    pickup_location_code: PropTypes.string,
    postcode: PropTypes.string,
    region: PropTypes.string,
    street: PropTypes.string
});
