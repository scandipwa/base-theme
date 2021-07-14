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
import Image from 'Component/Image';
import Link from 'Component/Link';
import Loader from 'Component/Loader';
import ProductReviewRating from 'Component/ProductReviewRating';
import ProductWishlistButton from 'Component/ProductWishlistButton/ProductWishlistButton.container';
import { ProductType } from 'Type/ProductList';

import {
    PRODUCT_ADD_TO_CART_DEFAULT_QUANTITY,
    PRODUCT_ADD_TO_CART_DEFAULT_VARIANT_INDEX
} from './ProductCompareItem.config';

import './ProductCompareItem.style';

/** @namespace Component/ProductCompareItem/Component */
export class ProductCompareItem extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        product: ProductType.isRequired,
        removeComparedProduct: PropTypes.func.isRequired,
        getGroupedProductQuantity: PropTypes.func.isRequired,
        getProductOptionsData: PropTypes.func.isRequired,
        imgUrl: PropTypes.string.isRequired,
        overrideAddToCartBtnBehavior: PropTypes.bool.isRequired,
        linkTo: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({})
        ]),
        overriddenAddToCartBtnHandler: PropTypes.func.isRequired
    };

    static defaultProps = {
        linkTo: {}
    };

    renderProductImage() {
        const {
            product: {
                id,
                name
            },
            imgUrl,
            linkTo
        } = this.props;

        return (
            <figure block="ProductCompareItem" elem="Figure">
                <Link block="ProductCompareItem" elem="ImageLink" to={ linkTo }>
                    <Image
                      ratio="custom"
                      src={ imgUrl }
                      alt={ name }
                      isPlaceholder={ !id }
                    />
                </Link>
            </figure>
        );
    }

    renderTitle() {
        const { product: { name }, linkTo } = this.props;

        return (
            <Link
              block="ProductCompareItem"
              elem="Title"
              to={ linkTo }
            >
                { name }
            </Link>
        );
    }

    renderRating() {
        const { product: { rating_summary, review_count } } = this.props;

        if (review_count < 1) {
            return null;
        }

        return <ProductReviewRating summary={ rating_summary } count={ review_count } />;
    }

    renderWishlistButton() {
        const { product } = this.props;

        return (
            <ProductWishlistButton
              product={ product }
              mix={ { block: 'ProductCard', elem: 'WishListButton' } }
            />
        );
    }

    renderAddToCartBtnEnabled() {
        const {
            product,
            getGroupedProductQuantity,
            getProductOptionsData
        } = this.props;

        return (
            <AddToCart
              product={ product }
              quantity={ PRODUCT_ADD_TO_CART_DEFAULT_QUANTITY }
              configurableVariantIndex={ PRODUCT_ADD_TO_CART_DEFAULT_VARIANT_INDEX }
              groupedProductQuantity={ getGroupedProductQuantity() }
              productOptionsData={ getProductOptionsData() }
              mix={ { block: 'ProductCompareItem', elem: 'AddToCartBtn' } }
            />
        );
    }

    renderAddToCartBtnDisabled() {
        const { linkTo, overriddenAddToCartBtnHandler } = this.props;

        return (
            <Link
              to={ linkTo }
              onClick={ overriddenAddToCartBtnHandler }
              block="ProductCompareItem"
              elem="AddToCartBtnWrapper"
            >
                <AddToCart
                  product={ {} }
                  groupedProductQuantity={ {} }
                  productOptionsData={ {} }
                  disableHandler
                  mix={ { block: 'ProductCompareItem', elem: 'AddToCartBtn' } }
                />
            </Link>
        );
    }

    renderAddToCartBtn() {
        const { overrideAddToCartBtnBehavior } = this.props;

        if (!overrideAddToCartBtnBehavior) {
            return this.renderAddToCartBtnEnabled();
        }

        return this.renderAddToCartBtnDisabled();
    }

    renderProductDetails() {
        return (
            <div>
                { this.renderRating() }
                { this.renderTitle() }
            </div>
        );
    }

    renderProductRemoveBtn() {
        const { removeComparedProduct } = this.props;

        return (
            <button
              block="ProductCompareItem"
              elem="CloseBtn"
              onClick={ removeComparedProduct }
              aria-label={ __('Remove') }
            />
        );
    }

    renderLoader() {
        const { isLoading } = this.props;

        return <Loader isLoading={ isLoading } />;
    }

    render() {
        return (
            <div block="ProductCompareItem">
                <div block="ProductCompareItem" elem="Details">
                    { this.renderProductImage() }
                    { this.renderProductDetails() }
                    { this.renderProductRemoveBtn() }
                    { this.renderLoader() }
                </div>
                <div block="ProductCompareItem" elem="Actions">
                    { this.renderAddToCartBtn() }
                    { this.renderWishlistButton() }
                </div>
            </div>
        );
    }
}

export default ProductCompareItem;
