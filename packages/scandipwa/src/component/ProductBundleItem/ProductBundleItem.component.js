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

import Field from 'Component/Field';
import ProductCustomizableOption from 'Component/ProductCustomizableOption/ProductCustomizableOption.component';

import {
    CHECKBOX,
    MULTI,
    RADIO,
    SELECT
} from './ProductBundleItem.config';

import './ProductBundleItem.style';

/** @namespace Component/ProductBundleItem/Component */
export class ProductBundleItem extends ProductCustomizableOption {
    static propTypes = {
        ...ProductCustomizableOption.propTypes,
        maxQuantity: PropTypes.number.isRequired,
        setDropdownItemQuantity: PropTypes.func.isRequired
    };

    renderMap = {
        [CHECKBOX]: this.renderCheckboxValues.bind(this),
        [MULTI]: this.renderCheckboxValues.bind(this),
        [RADIO]: this.renderDropdownValues.bind(this),
        [SELECT]: this.renderDropdownValues.bind(this)
    };

    renderHeading(mainTitle, titleBold, quantity) {
        return (
            <>
                <span
                  block="ProductBundleItem"
                  elem="Heading"
                >
                    { `${ quantity } x ${ mainTitle } ` }
                </span>
                <strong>
                    { titleBold }
                </strong>
            </>
        );
    }

    renderOptionCheckboxValue = (item) => {
        const {
            currencyCode,
            getSelectedCheckboxValue,
            renderOptionLabel
        } = this.props;

        if (!item.product) {
            return null;
        }

        const {
            id,
            label,
            price_type,
            quantity,
            is_default,
            finalOptionPrice,
            price
        } = item;

        const priceLabel = renderOptionLabel(price_type, finalOptionPrice, price, currencyCode);

        return (
            <div key={ id }>
                <Field
                  type="checkbox"
                  label={ this.renderHeading(label, priceLabel, quantity) }
                  id={ `option-${ id }` }
                  name={ `option-${ id }` }
                  value={ id }
                  checked={ is_default }
                  onChange={ getSelectedCheckboxValue }
                />
            </div>
        );
    };

    renderQtyInput = (item) => {
        const {
            selectedDropdownValue,
            setDropdownItemQuantity,
            maxQuantity
        } = this.props;
        const { id, quantity, can_change_quantity } = item;

        if (id !== selectedDropdownValue || !can_change_quantity) {
            return null;
        }

        return (
            <Field
              key={ id }
              id="item_qty"
              name="item_qty"
              type="number"
              value={ quantity }
              max={ maxQuantity }
              min={ 1 }
              mix={ { block: 'ProductBundleItem', elem: 'Qty' } }
              onChange={ setDropdownItemQuantity }
            />
        );
    };

    renderOptionDropdownValues(values) {
        const {
            option: { options },
            getDropdownOptions,
            selectedDropdownValue,
            setDropdownValue
        } = this.props;
        const dropdownOptions = getDropdownOptions(values);

        return (
            <div block="ProductBundleItem" elem="DropdownWrapper">
                <Field
                  id="bundle-options-dropdown"
                  name="bundle-options-dropdown"
                  type="select"
                  mix={ { block: 'ProductBundleItem', elem: 'Select' } }
                  placeholder={ __('Choose Option') }
                  selectOptions={ dropdownOptions }
                  value={ selectedDropdownValue }
                  onChange={ setDropdownValue }
                />
                { options.map(this.renderQtyInput) }
            </div>
        );
    }

    renderCheckboxValues() {
        const { option: { required, options } } = this.props;

        return (
            <>
                { options.map(this.renderOptionCheckboxValue) }
                { this.renderRequired(required) }
            </>
        );
    }

    renderDropdownValues() {
        const { option: { required, options } } = this.props;

        return (
            <>
                { this.renderOptionDropdownValues(options) }
                { this.renderRequired(required) }
            </>
        );
    }

    render() {
        const { optionType } = this.props;
        const render = this.renderMap[optionType];

        if (!render) {
            return null;
        }

        const { option: { title } } = this.props;

        return (
            <div block="ProductBundleItem" elem="Wrapper">
                <div block="ProductBundleItem" elem="Title">
                    { title }
                </div>
                { render() }
            </div>
        );
    }
}

export default ProductBundleItem;
