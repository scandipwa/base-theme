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
    BUNDLE, CONFIGURABLE, GROUPED, SIMPLE
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
        ...otherFields
    } = option;

    if (checkboxValues) {
        return { type: 'checkbox', data: checkboxValues, ...otherFields };
    }

    if (dropdownValues) {
        return { type: 'dropdown', data: dropdownValues, ...otherFields };
    }

    if (fieldValues) {
        return { type: 'field', data: fieldValues, ...otherFields };
    }

    if (areaValues) {
        return { type: 'area', data: areaValues, ...otherFields };
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

/** @namespace Util/Product/getIndexedProduct */
export const getIndexedProduct = (product) => {
    const {
        variants: initialVariants = [],
        configurable_options: initialConfigurableOptions = [],
        attributes: initialAttributes = [],
        options: initialOptions = [],
        rating_summary,
        review_count,
        reviews: initialReviews
    } = product;

    const attributes = getIndexedAttributes(initialAttributes || []);
    const reviews = getIndexedReviews(initialReviews);

    return {
        ...product,
        configurable_options: getIndexedConfigurableOptions(initialConfigurableOptions, attributes),
        variants: getIndexedVariants(initialVariants),
        options: getIndexedCustomOptions(initialOptions || []),
        attributes,
        // Magento 2.4.1 review endpoint compatibility
        reviews,
        review_summary: {
            rating_summary,
            review_count
        }
    };
};

/** @namespace Util/Product/getIndexedProducts */
export const getIndexedProducts = (products) => products.map(getIndexedProduct);

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
        variants,
        type_id,
        groupedProductQuantity
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

    if (type_id === GROUPED) {
        const grouped_options = Object.entries(groupedProductQuantity)
            .map(([product_id, quantity]) => ({ product_id: Number(product_id), quantity }));

        return { grouped_options };
    }

    return {};
};
