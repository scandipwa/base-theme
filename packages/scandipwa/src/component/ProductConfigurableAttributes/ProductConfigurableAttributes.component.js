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

import ProductAttributeValue from 'Component/ProductAttributeValue';
import ProductConfigurableAttributeDropdown from 'Component/ProductConfigurableAttributeDropdown';
import {
    BIG_PLACEHOLDER_CONFIG,
    SMALL_PLACEHOLDER_CONFIG
} from 'Component/ProductConfigurableAttributes/ProductConfigurableAttributes.config';
import { MixType } from 'Type/Common';
import { AttributeType } from 'Type/ProductList';

import './ProductConfigurableAttributes.style';

/** @namespace Component/ProductConfigurableAttributes/Component */
export class ProductConfigurableAttributes extends PureComponent {
    static propTypes = {
        numberOfPlaceholders: PropTypes.arrayOf(PropTypes.number),
        configurable_options: PropTypes.objectOf(AttributeType).isRequired,
        parameters: PropTypes.shape({}).isRequired,
        updateConfigurableVariant: PropTypes.func.isRequired,
        isReady: PropTypes.bool,
        mix: MixType,
        getIsConfigurableAttributeAvailable: PropTypes.func,
        handleOptionClick: PropTypes.func.isRequired,
        isSelected: PropTypes.func.isRequired,
        getLink: PropTypes.func.isRequired,
        isExpandable: PropTypes.bool,
        showProductAttributeAsLink: PropTypes.bool
    };

    static defaultProps = {
        isReady: true,
        mix: {},
        numberOfPlaceholders: BIG_PLACEHOLDER_CONFIG,
        getIsConfigurableAttributeAvailable: () => true,
        isExpandable: true,
        showProductAttributeAsLink: true
    };

    renderConfigurableAttributeValue(attribute) {
        const {
            getIsConfigurableAttributeAvailable,
            handleOptionClick,
            getLink,
            isSelected,
            showProductAttributeAsLink
        } = this.props;

        const { attribute_value } = attribute;

        return (
            <ProductAttributeValue
              key={ attribute_value }
              attribute={ attribute }
              isSelected={ isSelected(attribute) }
              isAvailable={ getIsConfigurableAttributeAvailable(attribute) }
              onClick={ handleOptionClick }
              getLink={ getLink }
              showProductAttributeAsLink={ showProductAttributeAsLink }
            />
        );
    }

    renderSwatch(option) {
        const { attribute_values, attribute_code } = option;

        return (
            <div
              block="ProductConfigurableAttributes"
              elem="SwatchList"
              key={ attribute_code }
            >
                { attribute_values.map((attribute_value) => (
                    this.renderConfigurableAttributeValue({ ...option, attribute_value })
                )) }
            </div>
        );
    }

    renderDropdown(option) {
        const {
            updateConfigurableVariant,
            getIsConfigurableAttributeAvailable,
            parameters
        } = this.props;

        return (
            <ProductConfigurableAttributeDropdown
              option={ option }
              updateConfigurableVariant={ updateConfigurableVariant }
              getIsConfigurableAttributeAvailable={ getIsConfigurableAttributeAvailable }
              parameters={ parameters }
            />
        );
    }

    renderPlaceholders() {
        const { numberOfPlaceholders, isExpandable } = this.props;
        const numberOfPlaceholdersToRender = isExpandable ? numberOfPlaceholders : SMALL_PLACEHOLDER_CONFIG;

        return numberOfPlaceholdersToRender.map((length, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={ i }
                  block="ProductConfigurableAttributes"
                  elem="SwatchList"
                >
                    { Array.from({ length }, (_, i) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={ i }
                          block="ProductConfigurableAttributes"
                          elem="Placeholder"
                        />
                    )) }
                </div>
        ));
    }

    renderConfigurableAttributes() {
        const {
            configurable_options,
            isExpandable
        } = this.props;

        return Object.values(configurable_options).map((option) => {
            const {
                attribute_label,
                attribute_options
            } = option;

            const [{ swatch_data }] = attribute_options ? Object.values(attribute_options) : [{}];
            const isSwatch = !!swatch_data;

            // render content without heading and subheading
            if (!isExpandable) {
                return isSwatch ? this.renderSwatch(option) : this.renderDropdown(option);
            }

            return (
                <div>
                    <p block="ProductConfigurableAttributes" elem="Title">{ attribute_label }</p>
                    { isSwatch ? this.renderSwatch(option) : this.renderDropdown(option) }
                </div>
            );
        });
    }

    render() {
        const { isReady, mix } = this.props;

        return (
            <div
              block="ProductConfigurableAttributes"
              mods={ { isLoading: !isReady } }
              mix={ mix }
            >
                { isReady ? this.renderConfigurableAttributes() : this.renderPlaceholders() }
            </div>
        );
    }
}

export default ProductConfigurableAttributes;
