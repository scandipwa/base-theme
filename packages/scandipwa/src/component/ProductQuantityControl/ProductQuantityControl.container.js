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
import { connect } from 'react-redux';

import { DEFAULT_MAX_PRODUCTS } from 'Component/ProductActions/ProductActions.config';
import { updateProductQuantity } from 'Store/Product/Product.action';
import { ProductType } from 'Type/ProductList';

import ProductQuantityControl from './ProductQuantityControl.component';

export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device,
    quantity: state.ProductReducer.quantity
});

export const mapDispatchToProps = (dispatch) => ({
    setQuantity: (quantity) => dispatch(updateProductQuantity(quantity))
});

export class ProductQuantityControlContainer extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        configurableVariantIndex: PropTypes.number
    };

    static defaultProps = {
        configurableVariantIndex: 0
    };

    static getMinQuantity(props) {
        const {
            product: { stock_item: { min_sale_qty } = {}, variants } = {},
            configurableVariantIndex
        } = props;

        if (!min_sale_qty) {
            return 1;
        }
        if (!configurableVariantIndex && !variants) {
            return min_sale_qty;
        }

        const { stock_item: { min_sale_qty: minVariantQty } = {} } = variants[configurableVariantIndex] || {};

        return minVariantQty || min_sale_qty;
    }

    static getMaxQuantity(props) {
        const {
            product: {
                stock_item: {
                    max_sale_qty
                } = {},
                variants
            } = {},
            configurableVariantIndex
        } = props;

        if (!max_sale_qty) {
            return DEFAULT_MAX_PRODUCTS;
        }

        if (configurableVariantIndex === -1 || !Object.keys(variants).length) {
            return max_sale_qty;
        }

        const {
            stock_item: {
                max_sale_qty: maxVariantQty
            } = {}
        } = variants[configurableVariantIndex] || {};

        return maxVariantQty || max_sale_qty;
    }

    containerProps = () => ({
        minQuantity: ProductQuantityControlContainer.getMinQuantity(this.props),
        maxQuantity: ProductQuantityControlContainer.getMaxQuantity(this.props)
    });

    render() {
        return (
            <ProductQuantityControl
              { ...this.props }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductQuantityControlContainer);
