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

import ExpandableContent from 'Component/ExpandableContent';
import ExpandableContentShowMore from 'Component/ExpandableContentShowMore';
import ProductAttributeValue from 'Component/ProductAttributeValue/ProductAttributeValue.component';
// eslint-disable-next-line max-len
import ProductConfigurableAttributes from 'Component/ProductConfigurableAttributes/ProductConfigurableAttributes.component';
import { CategoryFragment } from 'Type/Category';
import { getPriceFilterLabel } from 'Util/Category';
import { sortBySortOrder } from 'Util/Product';

/** @namespace Component/CategoryConfigurableAttributes/Component */
export class CategoryConfigurableAttributes extends ProductConfigurableAttributes {
    static propTypes = {
        ...ProductConfigurableAttributes.propTypes,
        currency_code: PropTypes.string.isRequired,
        show_product_count: PropTypes.bool.isRequired,
        childrenCategories: PropTypes.arrayOf(PropTypes.shape(CategoryFragment)).isRequired,
        getSubCategories: PropTypes.func.isRequired
    };

    renderSubCategories(option) {
        const { getSubCategories } = this.props;

        const optionWithSubcategories = getSubCategories(option);
        const { attribute_values = [] } = optionWithSubcategories;

        if (!attribute_values.length) {
            return null;
        }

        return this.renderDropdownOrSwatch(optionWithSubcategories);
    }

    renderPriceSwatch(option) {
        const { currency_code } = this.props;
        const { attribute_options, ...priceOption } = option;

        if (attribute_options) {
            // do not render price filter if it includes "*_*" aggregation
            if (attribute_options['*_*']) {
                return null;
            }

            priceOption.attribute_options = Object.entries(attribute_options).reduce((acc, [key, option]) => {
                const { label: oldLabel } = option;
                const [from, to] = oldLabel.split('~');
                const label = getPriceFilterLabel(from, to, currency_code);
                acc[key] = { ...option, label };

                return acc;
            }, {});
        }

        return this.renderDropdownOrSwatch(priceOption);
    }

    renderDropdownOrSwatch(option) {
        const {
            isContentExpanded,
            getSubHeading
        } = this.props;

        const {
            attribute_label,
            attribute_code,
            attribute_options
        } = option;

        const [{ swatch_data }] = attribute_options ? Object.values(attribute_options) : [{}];
        const isSwatch = !!swatch_data;

        return (
            <ExpandableContent
              key={ attribute_code }
              heading={ attribute_label }
              subHeading={ getSubHeading(option) }
              mix={ {
                  block: 'ProductConfigurableAttributes',
                  elem: 'Expandable'
              } }
              isContentExpanded={ isContentExpanded }
            >
                { isSwatch ? this.renderSwatch(option) : this.renderDropdown(option) }
            </ExpandableContent>
        );
    }

    renderConfigurableAttributeValue(attribute) {
        const {
            getIsConfigurableAttributeAvailable,
            handleOptionClick,
            getLink,
            isSelected,
            show_product_count
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
              isProductCountVisible={ show_product_count }
            />
        );
    }

    renderConfigurableOption = (option) => {
        const { attribute_code } = option;

        switch (attribute_code) {
        case 'price':
            return this.renderPriceSwatch(option);
        case 'category_id':
            return this.renderSubCategories(option);
        default:
            return this.renderDropdownOrSwatch(option);
        }
    };

    renderConfigurableAttributes() {
        const { configurable_options } = this.props;

        return sortBySortOrder(Object.values(configurable_options), 'attribute_position')
            .map(this.renderConfigurableOption);
    }

    renderDropdown(option) {
        const { attribute_values } = option;

        return (
            <div
              block="ProductConfigurableAttributes"
              elem="DropDownList"
            >
                <ExpandableContentShowMore>
                    { attribute_values.map((attribute_value) => (
                        this.renderConfigurableAttributeValue({ ...option, attribute_value })
                    )) }
                </ExpandableContentShowMore>
            </div>
        );
    }
}

export default CategoryConfigurableAttributes;
