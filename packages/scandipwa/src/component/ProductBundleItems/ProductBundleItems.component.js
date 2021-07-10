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
import React from 'react';

import ProductBundleItem from 'Component/ProductBundleItem';
import ProductCustomizableOptions from 'Component/ProductCustomizableOptions/ProductCustomizableOptions.component';

/** @namespace Component/ProductBundleItems/Component */
export class ProductBundleItems extends ProductCustomizableOptions {
    static propTypes = {
        ...ProductCustomizableOptions.propTypes,
        items: PropTypes.array,
        maxQuantity: PropTypes.number.isRequired,
        updateQuantity: PropTypes.func.isRequired,
        sku: PropTypes.string.isRequired
    };

    static defaultProps = {
        items: []
    };

    renderContent() {
        const {
            items,
            setSelectedCheckboxValues,
            setSelectedDropdownValue,
            maxQuantity,
            updateQuantity,
            productOptionsData,
            price_range,
            sku,
            type_id,
            price_range: { minimum_price: { regular_price: { currency } } }
        } = this.props;

        return items.map((item, key) => (
            <ProductBundleItem
              option={ item }
              price_range={ price_range }
              /* eslint-disable-next-line react/no-array-index-key */
              key={ key }
              setSelectedCheckboxValues={ setSelectedCheckboxValues }
              setSelectedDropdownValue={ setSelectedDropdownValue }
              maxQuantity={ maxQuantity }
              updateQuantity={ updateQuantity }
              productOptionsData={ productOptionsData }
              sku={ sku }
              currencyCode={ currency }
              type_id={ type_id }
            />
        ));
    }
}

export default ProductBundleItems;
