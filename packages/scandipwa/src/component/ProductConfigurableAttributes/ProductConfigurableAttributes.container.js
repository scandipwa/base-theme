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
import { PureComponent } from 'react';

import { getBooleanLabel } from 'Util/Product';

import ProductConfigurableAttributes from './ProductConfigurableAttributes.component';

/** @namespace Component/ProductConfigurableAttributes/Container */
export class ProductConfigurableAttributesContainer extends PureComponent {
    static propTypes = {
        getLink: PropTypes.func,
        parameters: PropTypes.shape({}).isRequired,
        updateConfigurableVariant: PropTypes.func.isRequired,
        isExpandable: PropTypes.bool,
        showProductAttributeAsLink: PropTypes.bool,
        variants: PropTypes.array
    };

    static defaultProps = {
        getLink: () => {},
        isExpandable: true,
        showProductAttributeAsLink: true,
        variants: null
    };

    containerFunctions = {
        handleOptionClick: this.handleOptionClick.bind(this),
        getSubHeading: this.getSubHeading.bind(this),
        isSelected: this.isSelected.bind(this),
        getLink: this.getLink.bind(this),
        getIsConfigurableAttributeAvailable: this.getIsConfigurableAttributeAvailable.bind(this)
    };

    getLink({ attribute_code, attribute_value }) {
        const { getLink } = this.props;

        return getLink(attribute_code, attribute_value);
    }

    getSubHeading({
        attribute_values, attribute_code, attribute_options, is_boolean = false
    }) {
        return attribute_values.reduce((acc, attribute_value) => (this.isSelected({
            attribute_code,
            attribute_value
        })
            ? [...acc, getBooleanLabel(attribute_options[attribute_value].label, is_boolean)]
            : acc), []).join(', ');
    }

    handleOptionClick({ attribute_code, attribute_value }) {
        const { updateConfigurableVariant } = this.props;
        updateConfigurableVariant(attribute_code, attribute_value);
    }

    isSelected({ attribute_code, attribute_value }) {
        const { parameters = {} } = this.props;
        const parameter = parameters[attribute_code];

        if (parameter === undefined) {
            return false;
        }
        if (parameter.length !== undefined) {
            return parameter.includes(attribute_value);
        }

        return parameter === attribute_value;
    }

    getIsConfigurableAttributeAvailable({ attribute_code, attribute_value }) {
        const { parameters, variants } = this.props;

        // skip out of stock check, if variants data has not been provided
        if (!variants) {
            return true;
        }

        const isAttributeSelected = Object.hasOwnProperty.call(parameters, attribute_code);

        // If value matches current attribute_value, option should be enabled
        if (isAttributeSelected && parameters[attribute_code] === attribute_value) {
            return true;
        }

        const parameterPairs = Object.entries(parameters);

        const selectedAttributes = isAttributeSelected
            // Need to exclude itself, otherwise different attribute_values of the same attribute_code will always be disabled
            ? parameterPairs.filter(([key]) => key !== attribute_code)
            : parameterPairs;

        return variants
            .some(({ stock_status, attributes }) => {
                const { attribute_value: foundValue } = attributes[attribute_code] || {};

                return (
                    stock_status === 'IN_STOCK'
                    // Variant must have currently checked attribute_code and attribute_value
                    && foundValue === attribute_value
                    // Variant must have all currently selected attributes
                    && selectedAttributes.every(([key, value]) => attributes[key].attribute_value === value)
                );
            });
    }

    render() {
        return (
            <ProductConfigurableAttributes
              { ...this.props }
              { ...this.containerFunctions }
            />
        );
    }
}

export default ProductConfigurableAttributesContainer;
