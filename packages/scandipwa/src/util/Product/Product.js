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
    BUNDLE,
    CONFIGURABLE,
    DOWNLOADABLE,
    SIMPLE
} from 'Util/Product';

/**
 * Checks whether every option is in attributes
 * @param {Object} attributes
 * @param {{ attribute_code: string }[]} options
 * @returns {boolean}
 * @namespace Util/Product/checkEveryOption
 */
export const checkEveryOption = (attributes, options) => Object.keys(options)
    .every((option) => {
        if (!attributes[option]) {
            return false;
        }

        const { attribute_value } = attributes[option];
        if (typeof options[option] === 'string') {
            return options[option] === attribute_value;
        }

        return options[option].includes(attribute_value);
    });

/** @namespace Util/Product/getIndexedAttributeOption */
export const getIndexedAttributeOption = (option) => {
    const { swatch_data: defaultSwatchData } = option;
    if (!defaultSwatchData) {
        return option;
    }

    const { type } = defaultSwatchData;
    const swatch_data = type ? defaultSwatchData : null;

    return {
        ...option,
        swatch_data
    };
};

/** @namespace Util/Product/getIndexedAttributes */
export const getIndexedAttributes = (attributes) => attributes.reduce((indexedAttributes, attribute) => {
    const { attribute_code, attribute_options = [] } = attribute;

    return {
        ...indexedAttributes,
        [attribute_code]: {
            ...attribute,
            attribute_options: attribute_options.reduce((acc, option) => {
                const { value } = option;

                return {
                    ...acc,
                    [value]: getIndexedAttributeOption(option)
                };
            }, {})
        }
    };
}, {});

/** @namespace Util/Product/getIndexedConfigurableOptions */
export const getIndexedConfigurableOptions = (configurableOptions, indexedAttributes) => (
    configurableOptions.reduce((indexedConfigurableOptions, configurableOption) => {
        const { values, attribute_code } = configurableOption;

        return {
            ...indexedConfigurableOptions,
            [attribute_code]: {
                ...configurableOption,
                ...indexedAttributes[attribute_code],
                attribute_values: values.map(({ value_index }) => `${ value_index }`)
            }
        };
    }, {})
);

/** @namespace Util/Product/getIndexedVariants */
export const getIndexedVariants = (variants) => variants.map(({ product }) => {
    const { attributes } = product;
    return {
        ...product,
        attributes: getIndexedAttributes(attributes || [])
    };
});

/** @namespace Util/Product/getIndexedSingleVariant */
export const getIndexedSingleVariant = (variants, itemSku) => {
    const index = variants.findIndex(({ product: { sku } }) => sku === itemSku || itemSku.includes(sku));

    if (index < 0) {
        return getIndexedVariants(variants);
    }

    const indexedProduct = variants[index].product;
    const { attributes } = indexedProduct;

    return [
        { ...indexedProduct, attributes: getIndexedAttributes(attributes || []) }
    ];
};

/**
 * Get product variant index by options
 * @param {Object[]} variants
 * @param {{ attribute_code: string }[]} options
 * @returns {number}
 * @namespace Util/Product/getVariantIndex
 */
export const getVariantIndex = (variants, options) => variants
    .findIndex((variant) => checkEveryOption(variant.attributes, options));

/** @namespace Util/Product/getVariantsIndexes */
export const getVariantsIndexes = (variants, options) => Object.entries(variants)
    .reduce((indexes, [index, variant]) => {
        if (checkEveryOption(variant.attributes, options)) {
            indexes.push(+index);
        }

        return indexes;
    }, []);

/** @namespace Util/Product/getIndexedCustomOption */
export const getIndexedCustomOption = (option) => {
    const {
        checkboxValues,
        dropdownValues,
        fieldValues,
        areaValues,
        fileValues,
        ...otherFields
    } = option;

    if (checkboxValues) {
        const data = Array.isArray(checkboxValues) ? checkboxValues : [checkboxValues];
        return { type: 'checkbox', data, ...otherFields };
    }

    if (dropdownValues) {
        const data = Array.isArray(dropdownValues) ? dropdownValues : [dropdownValues];
        return { type: 'dropdown', data, ...otherFields };
    }

    if (fieldValues) {
        const data = Array.isArray(fieldValues) ? fieldValues : [fieldValues];
        return { type: 'field', data, ...otherFields };
    }

    if (areaValues) {
        const data = Array.isArray(areaValues) ? areaValues : [areaValues];
        return { type: 'area', data, ...otherFields };
    }

    if (fileValues) {
        const data = Array.isArray(fileValues) ? fileValues : [fileValues];
        return { type: 'file', data, ...otherFields };
    }

    // skip unsupported types
    return null;
};

/** @namespace Util/Product/getIndexedCustomOptions */
export const getIndexedCustomOptions = (options) => options.reduce(
    (acc, option) => {
        const indexedOption = getIndexedCustomOption(option);

        if (indexedOption) {
            acc.push(indexedOption);
        }

        return acc;
    },
    []
);

/** @namespace Util/Product/getIndexedReviews */
export const getIndexedReviews = (reviews) => {
    if (!reviews) {
        return null;
    }

    const { items } = reviews;
    const ONE_FIFTH_OF_A_HUNDRED = 20;

    return items.reduce((acc, review) => {
        const { rating_votes = [], ...restOfReview } = review;

        const newRatingVotes = rating_votes.reduce((acc, vote) => {
            const { rating_code, value } = vote;

            return [
                ...acc,
                {
                    rating_code,
                    value,
                    // stars / 5 * 100 to get percent
                    percent: value * ONE_FIFTH_OF_A_HUNDRED
                }
            ];
        }, []);

        return [
            ...acc,
            {
                ...restOfReview,
                rating_votes: newRatingVotes
            }
        ];
    }, []);
};

/** @namespace Util/Product/getBundleOptions */
export const getBundleOptions = (options, items) => {
    const bundleOptions = options.reduce((prev, next) => [...prev, ...next.selection_details], []);

    return items.map((item) => ({
        ...item,
        options: item?.options?.map((option) => {
            const selection = bundleOptions.find((o) => o.selection_id === option.id) || {};
            const {
                regular_option_price: regularOptionPrice = 0,
                regular_option_price_excl_tax: regularOptionPriceExclTax = 0,
                final_option_price: finalOptionPrice = 0,
                final_option_price_excl_tax: finalOptionPriceExclTax = 0
            } = selection;

            return {
                ...option,
                regularOptionPrice,
                regularOptionPriceExclTax,
                finalOptionPrice,
                finalOptionPriceExclTax
            };
        })
    }));
};

/** @namespace Util/Product/getIndexedProduct */
export const getIndexedProduct = (product, itemSku) => {
    const {
        variants: initialVariants = [],
        configurable_options: initialConfigurableOptions = [],
        attributes: initialAttributes = [],
        options: initialOptions = [],
        rating_summary,
        review_count,
        reviews: initialReviews,
        items = [],
        bundle_options = []
    } = product;

    const attributes = getIndexedAttributes(initialAttributes || []);
    const reviews = getIndexedReviews(initialReviews);

    const updatedProduct = {
        ...product,
        configurable_options: getIndexedConfigurableOptions(initialConfigurableOptions, attributes),
        variants: itemSku ? getIndexedSingleVariant(initialVariants, itemSku) : getIndexedVariants(initialVariants),
        options: getIndexedCustomOptions(initialOptions || []),
        attributes,
        // Magento 2.4.1 review endpoint compatibility
        reviews,
        review_summary: {
            rating_summary,
            review_count
        }
    };

    if (bundle_options) {
        updatedProduct.items = getBundleOptions(bundle_options, items);
    }

    return updatedProduct;
};

/** @namespace Util/Product/getIndexedProducts */
export const getIndexedProducts = (products) => products.map((product) => getIndexedProduct(product));

/** @namespace Util/Product/getIndexedParameteredProducts */
export const getIndexedParameteredProducts = (products) => Object.entries(products)
    .reduce((products, [id, product]) => ({
        ...products,
        [id]: getIndexedProduct(product)
    }), {});

/** @namespace Util/Product/getExtensionAttributes */
export const getExtensionAttributes = (product) => {
    const {
        configurable_options,
        configurableVariantIndex,
        productOptions,
        productOptionsMulti,
        downloadableLinks,
        variants,
        type_id
    } = product;

    if (type_id === CONFIGURABLE) {
        const { attributes = {} } = variants[configurableVariantIndex] || {};
        const properties = {
            configurable_item_options: Object.values(configurable_options)
                .reduce((prev, { attribute_id, attribute_code }) => {
                    const {
                        attribute_value,
                        attribute_id: attrId
                    } = attributes[attribute_code] || {};

                    if (attribute_value) {
                        return [
                            ...prev,
                            {
                                option_id: attribute_id || attrId,
                                option_value: attribute_value
                            }
                        ];
                    }

                    return prev;
                }, [])
        };

        if (productOptions) {
            properties.customizable_options = productOptions;
        }
        if (productOptionsMulti) {
            properties.customizable_options_multi = productOptionsMulti;
        }

        return properties;
    }

    if (type_id === BUNDLE && (productOptions || productOptionsMulti)) {
        return { bundle_options: Array.from(productOptions || []) };
    }

    if (type_id === SIMPLE && (productOptions || productOptionsMulti)) {
        return {
            customizable_options: productOptions || [],
            customizable_options_multi: productOptionsMulti || []
        };
    }

    if (type_id === DOWNLOADABLE && downloadableLinks) {
        return {
            downloadable_product_links: downloadableLinks
        };
    }

    return {};
};

/** @namespace Util/Product/sortBySortOrder */
export const sortBySortOrder = (options, sortKey = 'sort_order') => options.sort(
    (a, b) => {
        if (a[sortKey] < b[sortKey]) {
            return -1;
        }

        if (a[sortKey] > b[sortKey]) {
            return 1;
        }

        return 0;
    }
);

/** @namespace Util/Product/sortAlphabetically */
export const sortAlphabetically = (options, key, caseSensitive = false) => options
    .sort((a, b) => {
        const textA = caseSensitive ? a[key] : a[key].toUpperCase();
        const textB = caseSensitive ? b[key] : b[key].toUpperCase();

        if (textA < textB) {
            return -1;
        }

        if (textA > textB) {
            return 1;
        }

        return 0;
    });

/** @namespace Util/Product/getBooleanLabel */
export const getBooleanLabel = (label, isBoolean = false) => {
    if (!isBoolean) {
        return label;
    }

    return +label ? __('Yes') : __('No');
};
