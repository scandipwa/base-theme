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

import AddToCart from 'Component/AddToCart';
import ProductCompareButton from 'Component/ProductCompareButton';
import ProductQuantityControl from 'Component/ProductQuantityControl/ProductQuantityControl.component';
import ProductWishlistButton from 'Component/ProductWishlistButton';
import { DeviceType } from 'Type/Device';
import { ProductType } from 'Type/ProductList';
import { GROUPED } from 'Util/Product';

import './ProductAddToCart.style.scss';

export class ProductAddToCard extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        device: DeviceType.isRequired,
        quantity: PropTypes.number.isRequired,
        configurableVariantIndex: PropTypes.number,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        onProductValidationError: PropTypes.func.isRequired,
        productOptionsData: PropTypes.object.isRequired
    };

    static defaultProps = {
        configurableVariantIndex: 0
    };

    renderProductWishlistButton() {
        const {
            product,
            quantity,
            configurableVariantIndex,
            onProductValidationError
        } = this.props;

        return (
            <ProductWishlistButton
              product={ product }
              quantity={ quantity }
              configurableVariantIndex={ configurableVariantIndex }
              onProductValidationError={ onProductValidationError }
            />
        );
    }

    renderQuantityInput() {
        const {
            product: { type_id },
            product,
            configurableVariantIndex
        } = this.props;

        if (type_id === GROUPED) {
            return null;
        }

        return (
            <ProductQuantityControl
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
            />
        );
    }

    renderAddToCart() {
        const {
            configurableVariantIndex,
            product,
            quantity,
            groupedProductQuantity,
            onProductValidationError,
            productOptionsData
        } = this.props;

        return (
            <AddToCart
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
              mix={ { block: 'ProductAddToCard', elem: 'AddToCart' } }
              quantity={ quantity }
              groupedProductQuantity={ groupedProductQuantity }
              onProductValidationError={ onProductValidationError }
              productOptionsData={ productOptionsData }
            />
        );
    }

    renderProductCompareButton() {
        const {
            product: { id } = {},
            device: { isMobile } = {}
        } = this.props;

        if (!id || isMobile) {
            return null;
        }

        return (
            <ProductCompareButton productId={ id } />
        );
    }

    render() {
        return (
            <div
              block="ProductAddToCard"
              elem="AddToCartWrapper"
              mix={ { block: 'FixedElement', elem: 'Bottom' } }
            >
                { this.renderQuantityInput() }
                { this.renderAddToCart() }
                { this.renderProductCompareButton() }
                { this.renderProductWishlistButton() }
            </div>
        );
    }
}

export default ProductAddToCard;
