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

/** @namespace Util/Address/trimCustomerAddress */
export const trimCustomerAddress = (customerAddress) => {
    const {
        city,
        company,
        country_id,
        email,
        firstname,
        lastname,
        method,
        postcode,
        street,
        telephone,
        region,
        vat_id
    } = customerAddress;

    return {
        city,
        company,
        country_id,
        email,
        firstname,
        lastname,
        method,
        postcode,
        street,
        telephone,
        vat_id,
        ...region
    };
};

/** @namespace Util/Address/trimAddressFields */
export const trimAddressFields = (fields) => {
    const {
        region_string: region,
        ...fieldsData
    } = fields;

    return { ...fieldsData, region };
};

/** transforming "street[index]" entries into a single "street" object
    for checkout/billing/myAccoutAddress form fields object */
/** @namespace Util/Address/setAddressesInFormObject */
export const setAddressesInFormObject = (fields, numberOfLines) => {
    const addressKeys = new Array(numberOfLines)
        .fill('')
        .map((_, index) => `street${index}`);

    const addressValues = addressKeys.map((key) => fields[key]);

    // removing street related fields from the form object
    const newFields = Object.keys(fields)
        .filter((key) => !addressKeys.includes(key))
        .reduce(
            (acc, key) => {
                acc[key] = fields[key];

                return acc;
            }, {}
        );

    // setting single street entry to the form object
    newFields.street = addressValues;

    return newFields;
};

// get Form Fields object depending on addressLinesQty
/** @namespace Util/Address/getFormFields */
export const getFormFields = (fields, addressLinesQty) => {
    if (addressLinesQty === 1) {
        return fields;
    }

    return setAddressesInFormObject(fields, addressLinesQty);
};

/** @namespace Util/Address/getCityAndRegionFromZipcode */
export const getCityAndRegionFromZipcode = async (countryId, value) => {
    const response = await fetch(`https://api.zippopotam.us/${countryId}/${value.split(' ')[0]}`);
    const data = await response.json();

    return data && Object.entries(data).length > 0
        ? [
            data.places[0]['place name'],
            data.places[0]['state abbreviation']
        ]
        : [null, null];
};

/** @namespace Util/Address/getDefaultAddressLabel */
export const getDefaultAddressLabel = (address) => {
    const { default_billing, default_shipping } = address;
    if (!default_billing && !default_shipping) {
        return '';
    }
    if (default_billing && default_shipping) {
        return __(' (default shipping & billing)');
    }
    if (default_billing) {
        return __(' (default billing address)');
    }

    return __(' (default shipping address)');
};
