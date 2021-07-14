/* eslint-disable no-magic-numbers */

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

import Field from 'Component/Field';
import Html from 'Component/Html';
import { MixType } from 'Type/Common';
import { AttributeType } from 'Type/ProductList';
import { getBooleanLabel } from 'Util/Product';

import { STRING_ONLY_ATTRIBUTE_CODES } from './ProductAttributeValue.config';

import './ProductAttributeValue.style';

/** @namespace Component/ProductAttributeValue/Component */
export class ProductAttributeValue extends PureComponent {
    static propTypes = {
        getLink: PropTypes.func,
        onClick: PropTypes.func,
        attribute: AttributeType.isRequired,
        isSelected: PropTypes.bool,
        isAvailable: PropTypes.bool,
        mix: MixType,
        isFormattedAsText: PropTypes.bool,
        isProductCountVisible: PropTypes.bool,
        showProductAttributeAsLink: PropTypes.bool
    };

    static defaultProps = {
        isSelected: false,
        onClick: () => {},
        getLink: () => {},
        mix: {},
        isAvailable: true,
        isFormattedAsText: false,
        isProductCountVisible: false,
        showProductAttributeAsLink: true
    };

    clickHandler = this.clickHandler.bind(this);

    getOptionLabel = this.getOptionLabel.bind(this);

    getIsColorLight(hex) {
        const color = (hex.charAt(0) === '#') ? hex.substring(1, 7) : hex;
        const r = parseInt(color.substring(0, 2), 16); // hexToR
        const g = parseInt(color.substring(2, 4), 16); // hexToG
        const b = parseInt(color.substring(4, 6), 16); // hexToB

        return ((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186;
    }

    getOptionLabel(value) {
        const {
            attribute: {
                attribute_options,
                is_boolean
            },
            isProductCountVisible
        } = this.props;

        if (attribute_options) {
            const optionValues = attribute_options[value];
            if (optionValues) {
                if (!isProductCountVisible) {
                    const { label } = optionValues;

                    return { ...optionValues, labelText: label };
                }

                const { label, count = 0 } = optionValues;

                const adjustedLabel = getBooleanLabel(label, is_boolean);

                return {
                    ...optionValues,
                    label: `${adjustedLabel} (${count})`,
                    labelText: adjustedLabel,
                    count
                };
            }
        }

        return {};
    }

    clickHandler(e) {
        const { onClick, attribute } = this.props;

        e.preventDefault();
        e.stopPropagation();
        onClick(attribute);
    }

    renderTextAttribute() {
        const { attribute: { attribute_value } } = this.props;

        return this.renderStringValue(attribute_value);
    }

    renderBooleanAttribute() {
        const { attribute: { attribute_value } } = this.props;

        return this.renderStringValue(+attribute_value ? __('Yes') : __('No'));
    }

    renderMultiSelectAttribute() {
        const { attribute: { attribute_value } } = this.props;

        const labelsArray = attribute_value.split(',').reduce((labels, value) => {
            const { label } = this.getOptionLabel(value);
            if (label) {
                labels.push(label);
            }

            return labels;
        }, []);

        return this.renderStringValue(labelsArray.length ? labelsArray.join(', ') : __('N/A'));
    }

    renderSelectAttribute() {
        const { attribute: { attribute_value, attribute_code, has_swatch } } = this.props;
        const attributeOption = this.getOptionLabel(attribute_value);
        const {
            label, labelText, count, swatch_data
        } = attributeOption;

        // skip attributes without valid swatches
        if (!swatch_data && has_swatch) {
            return null;
        }

        if (!swatch_data || STRING_ONLY_ATTRIBUTE_CODES.includes(attribute_code)) {
            return this.renderStringValue(labelText || __('N/A'), null, count);
        }

        const { value, type } = swatch_data;

        switch (type) {
        case '0':
            return this.renderStringValue(value, labelText, count);
        case '1':
            return this.renderColorValue(value, label);
        case '2':
            return this.renderImageValue(value, label);
        default:
            return this.renderStringValue(labelText || __('N/A'), labelText, count);
        }
    }

    renderImageAttribute() {
        const {
            attribute: {
                attribute_label,
                attribute_value
            }
        } = this.props;

        if (!attribute_value || attribute_value === 'no_selection') {
            return this.renderPlaceholder();
        }

        return (
            <img
              block="ProductAttributeValue"
              elem="MediaImage"
              src={ `/media/catalog/product${attribute_value}` }
              alt={ attribute_label }
            />
        );
    }

    renderTextAreaAttribute() {
        const {
            attribute: { attribute_value }
        } = this.props;

        return (
            <div
              block="ProductAttributeValue"
              elem="TextArea"
            >
                <Html content={ attribute_value } />
            </div>
        );
    }

    renderPlaceholder() {
        return (
            <div
              block="ProductAttributeValue"
              elem="Placeholder"
            />
        );
    }

    renderColorValue(color, label) {
        const { isFormattedAsText, isSelected } = this.props;
        const isLight = this.getIsColorLight(color);

        if (isFormattedAsText) {
            return label || __('N/A');
        }

        const style = {
            '--option-background-color': color,
            '--option-border-color': isLight ? '#dddddd' : color,
            '--option-check-mark-background': isLight ? '#000' : '#fff',
            // stylelint-disable-next-line value-keyword-case
            '--option-is-selected': isSelected ? 1 : 0
        };

        return (
            <data
              block="ProductAttributeValue"
              elem="Color"
              value={ label }
              title={ label }
              style={ style }
            />
        );
    }

    renderImageValue(img, label) {
        const { isFormattedAsText, isSelected } = this.props;

        if (isFormattedAsText) {
            return label || __('N/A');
        }

        const style = {
            // stylelint-disable-next-line value-keyword-case
            '--option-is-selected': isSelected ? 1 : 0
        };

        return (
            <>
                <img
                  block="ProductAttributeValue"
                  elem="Image"
                  src={ `/media/attribute/swatch${img}` }
                  alt={ label }
                />
                <data
                  block="ProductAttributeValue"
                  elem="Image-Overlay"
                  value={ label }
                  title={ label }
                  style={ style }
                />
            </>
        );
    }

    renderDropdown(value, subLabel) {
        const { isSelected } = this.props;

        return (
            <Field
              id={ value }
              name={ value }
              type="checkbox"
              label={ value }
              value={ value }
              subLabel={ subLabel }
              mix={ {
                  block: 'ProductAttributeValue',
                  elem: 'Text',
                  mods: { isSelected }
              } }
              checked={ isSelected }
            />
        );
    }

    renderStringValue(value, label, count) {
        const { isFormattedAsText, isSelected } = this.props;
        const isSwatch = label;

        if (isFormattedAsText) {
            return label || value || __('N/A');
        }

        if (!isSwatch) {
            return this.renderDropdown(value, count);
        }

        return (
            <span
              block="ProductAttributeValue"
              elem="String"
              mods={ { isSelected } }
              title={ label }
            >
                { value }
            </span>
        );
    }

    renderNumericAttribute() {
        const { attribute: { attribute_value } } = this.props;

        return this.renderStringValue(parseFloat(attribute_value).toFixed(2));
    }

    renderAttributeByType() {
        const { attribute: { attribute_type } } = this.props;

        switch (attribute_type) {
        case 'select':
            return this.renderSelectAttribute();
        case 'boolean':
            return this.renderBooleanAttribute();
        case 'text':
            return this.renderTextAttribute();
        case 'multiselect':
            return this.renderMultiSelectAttribute();
        case 'media_image':
            return this.renderImageAttribute();
        case 'textarea':
            return this.renderTextAreaAttribute();
        case 'weight':
            return this.renderNumericAttribute();
        default:
            return this.renderPlaceholder();
        }
    }

    render() {
        const {
            getLink,
            attribute,
            isAvailable,
            attribute: { attribute_code, attribute_value },
            mix,
            isFormattedAsText,
            showProductAttributeAsLink
        } = this.props;

        if (attribute_code && !attribute_value) {
            return null;
        }

        const href = getLink(attribute);
        // Invert to apply css rule without using not()
        const isNotAvailable = !isAvailable;

        if (isFormattedAsText) {
            return (
                <div
                  block="ProductAttributeValue"
                  mix={ mix }
                >
                    { this.renderAttributeByType() }
                </div>
            );
        }

        if (!showProductAttributeAsLink) {
            return (
                <span
                  block="ProductAttributeValue"
                  mods={ { isNotAvailable } }
                  onClick={ this.clickHandler }
                  onKeyDown={ this.clickHandler }
                  role="link"
                  tabIndex="-1"
                  aria-hidden={ isNotAvailable }
                  mix={ mix }
                >
                { this.renderAttributeByType() }
                </span>
            );
        }

        return (
            <a
              href={ href }
              block="ProductAttributeValue"
              mods={ { isNotAvailable } }
              onClick={ this.clickHandler }
              aria-hidden={ isNotAvailable }
              mix={ mix }
            >
                { this.renderAttributeByType() }
            </a>
        );
    }
}

export default ProductAttributeValue;
