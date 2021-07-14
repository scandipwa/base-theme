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

import GroupedProductsItem from 'Component/GroupedProductsItem';
import { ProductType } from 'Type/ProductList';
import { GROUPED } from 'Util/Product';

/**
 * Product description
 * @class GroupedProductList
 * @namespace Component/GroupedProductList/Component
 */
export class GroupedProductList extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        clearGroupedProductQuantity: PropTypes.func.isRequired,
        setGroupedProductQuantity: PropTypes.func.isRequired
    };

    componentWillUnmount() {
        const { clearGroupedProductQuantity } = this.props;
        clearGroupedProductQuantity();
    }

    renderProductList(items) {
        const {
            groupedProductQuantity,
            setGroupedProductQuantity
        } = this.props;

        return (
            <ul>
                { items.map(({ product, product: { id } = {}, qty }) => (
                    <GroupedProductsItem
                      key={ id }
                      product={ product }
                      defaultQuantity={ qty }
                      groupedProductQuantity={ groupedProductQuantity }
                      setGroupedProductQuantity={ setGroupedProductQuantity }
                    />
                )) }
            </ul>
        );
    }

    render() {
        const {
            product: { items, type_id }
        } = this.props;

        if (type_id !== GROUPED) {
            return null;
        }
        if (!items) {
            return null;
        }

        return this.renderProductList(items);
    }
}

export default GroupedProductList;
