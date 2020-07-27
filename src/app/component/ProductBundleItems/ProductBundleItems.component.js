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

class ProductBundleItems extends ProductCustomizableOptions {
    static propTypes = {
        ...ProductCustomizableOptions.propTypes,
        items: PropTypes.array,
        maxQuantity: PropTypes.number.isRequired,
        updateQuantity: PropTypes.func.isRequired
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
            productOptionsData
        } = this.props;

        return items.map((item, key) => (
            <ProductBundleItem
              option={ item }
              /* eslint-disable-next-line react/no-array-index-key */
              key={ key }
              setSelectedCheckboxValues={ setSelectedCheckboxValues }
              setSelectedDropdownValue={ setSelectedDropdownValue }
              maxQuantity={ maxQuantity }
              updateQuantity={ updateQuantity }
              productOptionsData={ productOptionsData }
            />
        ));
    }
}

export default ProductBundleItems;
