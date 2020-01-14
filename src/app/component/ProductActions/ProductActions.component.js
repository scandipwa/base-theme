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

/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-array-index-key */
// Disabled due placeholder needs

import { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ProductConfigurableAttributes from 'Component/ProductConfigurableAttributes';
import ProductWishlistButton from 'Component/ProductWishlistButton';
import ProductReviewRating from 'Component/ProductReviewRating';
import GroupedProductList from 'Component/GroupedProductsList';
import TextPlaceholder from 'Component/TextPlaceholder';
import ProductPrice from 'Component/ProductPrice';
import { ProductType } from 'Type/ProductList';
import AddToCart from 'Component/AddToCart';
import { GROUPED } from 'Util/Product';
import { isSignedIn } from 'Util/Auth';
import Field from 'Component/Field';
import isMobile from 'Util/Mobile';
import Html from 'Component/Html';
import Link from 'Component/Link';

import './ProductActions.style';

/**
 * Product actions
 * @class ProductActions
 */
export default class ProductActions extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        minQuantity: PropTypes.number.isRequired,
        maxQuantity: PropTypes.number.isRequired,
        configurableVariantIndex: PropTypes.number,
        showOnlyIfLoaded: PropTypes.func.isRequired,
        quantity: PropTypes.number.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired,
        getLink: PropTypes.func.isRequired,
        setQuantity: PropTypes.func.isRequired,
        updateConfigurableVariant: PropTypes.func.isRequired,
        parameters: PropTypes.objectOf(PropTypes.string).isRequired,
        getIsConfigurableAttributeAvailable: PropTypes.func.isRequired,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        clearGroupedProductQuantity: PropTypes.func.isRequired,
        setGroupedProductQuantity: PropTypes.func.isRequired
    };

    static defaultProps = {
        configurableVariantIndex: 0
    };

    renderSkuAndStock() {
        const {
            product,
            product: { variants },
            configurableVariantIndex,
            showOnlyIfLoaded
        } = this.props;

        const productOrVariant = variants && variants[configurableVariantIndex] !== undefined
            ? variants[configurableVariantIndex]
            : product;

        const { sku, stock_status } = productOrVariant;

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'sku' } }
              aria-label="Product SKU and availability"
            >
                { showOnlyIfLoaded(
                    sku,
                    (
                        <>
                            <span block="ProductActions" elem="Sku" itemProp="sku">
                                { `SKU: ${ sku }` }
                            </span>
                            <span block="ProductActions" elem="Stock">
                                { (stock_status === 'OUT_OF_STOCK') ? __('Out of stock') : __('In stock') }
                            </span>
                        </>
                    ),
                    <TextPlaceholder />
                ) }
            </section>
        );
    }

    renderConfigurableAttributes() {
        const {
            getLink,
            updateConfigurableVariant,
            parameters,
            areDetailsLoaded,
            product: { configurable_options, type_id },
            getIsConfigurableAttributeAvailable
        } = this.props;

        if (type_id !== 'configurable') return null;

        return (
            <ProductConfigurableAttributes
                // eslint-disable-next-line no-magic-numbers
              numberOfPlaceholders={ [2, 4] }
              mix={ { block: 'ProductActions', elem: 'Attributes' } }
              isReady={ areDetailsLoaded }
              getLink={ getLink }
              parameters={ parameters }
              updateConfigurableVariant={ updateConfigurableVariant }
              configurable_options={ configurable_options }
              getIsConfigurableAttributeAvailable={ getIsConfigurableAttributeAvailable }
              isContentExpanded
            />
        );
    }

    renderShortDescriptionContent() {
        const { product: { short_description, id } } = this.props;
        const { html } = short_description || {};

        if (!html && id) return null;

        const htmlWithItemProp = `<div itemProp="description">${ html }</div>`;

        return (
            <div block="ProductActions" elem="ShortDescription">
                { html ? <Html content={ htmlWithItemProp } /> : <p><TextPlaceholder length="long" /></p> }
            </div>
        );
    }

    renderShortDescription() {
        const { product: { short_description, id } } = this.props;
        const { html } = short_description || {};

        if (!html && id && isMobile.any()) return null;

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'short' } }
              aria-label="Product short description"
            >
                { this.renderShortDescriptionContent() }
            </section>
        );
    }

    renderNameAndBrand() {
        const {
            product:
                {
                    name,
                    attributes: { brand: { attribute_value: brand } = {} } = {}
                },
            showOnlyIfLoaded
        } = this.props;

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'name' } }
            >
                { showOnlyIfLoaded(
                    brand,
                    (
                        <h4 block="ProductActions" elem="Brand" itemProp="brand">
                            <TextPlaceholder content={ brand } />
                        </h4>
                    )
                ) }
                <p block="ProductActions" elem="Title" itemProp="name">
                    <TextPlaceholder content={ name } length="medium" />
                </p>
            </section>
        );
    }

    renderQuantityInput() {
        const {
            quantity,
            maxQuantity,
            minQuantity,
            setQuantity,
            product: { type_id }
        } = this.props;

        if (type_id === GROUPED) return null;

        return (
            <Field
              id="item_qty"
              name="item_qty"
              type="number"
              value={ quantity }
              max={ maxQuantity }
              min={ minQuantity }
              mix={ { block: 'ProductActions', elem: 'Qty' } }
              onChange={ setQuantity }
            />
        );
    }

    renderAddToCart() {
        const {
            configurableVariantIndex,
            product,
            quantity,
            groupedProductQuantity
        } = this.props;

        return (
            <AddToCart
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
              mix={ { block: 'ProductActions', elem: 'AddToCart' } }
              quantity={ quantity }
              groupedProductQuantity={ groupedProductQuantity }
            />
        );
    }

    renderPrice() {
        const { product: { price, variants, type_id }, configurableVariantIndex } = this.props;

        if (type_id === GROUPED) return null;

        // Product in props is updated before ConfigurableVariantIndex in props, when page is opened by clicking CartItem
        // As a result, we have new product, but old configurableVariantIndex, which may be out of range for variants
        const productOrVariantPrice = variants && variants[configurableVariantIndex] !== undefined
            ? variants[configurableVariantIndex].price
            : price;

        return (
            <ProductPrice
              price={ productOrVariantPrice }
              mix={ { block: 'ProductActions', elem: 'Price' } }
            />
        );
    }

    renderGoToWishlist() {
        if (!isSignedIn()) return null;

        return (
            <Link
              to="/my-account/my-wishlist"
              mix={ { block: 'Button', mods: { isHollow: true } } }
            >
                { __('Go To Wishlist') }
            </Link>
        );
    }

    renderProductWishlistButton() {
        const {
            product,
            quantity,
            configurableVariantIndex
        } = this.props;

        return (
            <ProductWishlistButton
              product={ product }
              quantity={ quantity }
              configurableVariantIndex={ configurableVariantIndex }
            />
        );
    }

    renderAdditionalButtons() {
        return (
            <div block="ProductActions" elem="AdditionalButtons">
                { this.renderProductWishlistButton() }
                { this.renderGoToWishlist() }
            </div>
        );
    }

    renderReviews() {
        const { product: { review_summary: { rating_summary, review_count } = {} } } = this.props;

        if (!rating_summary) return null;

        const ONE_FIFTH_OF_A_HUNDRED = 20;
        const rating = parseFloat(rating_summary / ONE_FIFTH_OF_A_HUNDRED).toFixed(2);

        return (
            <div block="ProductActions" elem="Reviews">
                <ProductReviewRating summary={ rating_summary || 0 } />
                <p block="ProductActions" elem="ReviewLabel">
                    { rating }
                    <span>{ __('%s reviews', review_count) }</span>
                </p>
            </div>
        );
    }

    renderGroupedItems() {
        const {
            product,
            groupedProductQuantity,
            setGroupedProductQuantity,
            clearGroupedProductQuantity
        } = this.props;

        return (
            <div block="ProductActions" elem="GroupedItems">
                <GroupedProductList
                  product={ product }
                  clearGroupedProductQuantity={ clearGroupedProductQuantity }
                  groupedProductQuantity={ groupedProductQuantity }
                  setGroupedProductQuantity={ setGroupedProductQuantity }
                />
            </div>
        );
    }

    render() {
        return (
            <article block="ProductActions">
                { this.renderPrice() }
                <div block="ProductActions" elem="AddToCartWrapper">
                    { this.renderQuantityInput() }
                    { this.renderAddToCart() }
                </div>
                { this.renderReviews() }
                { this.renderAdditionalButtons() }
                { this.renderNameAndBrand() }
                { this.renderSkuAndStock() }
                { this.renderConfigurableAttributes() }
                { this.renderShortDescription() }
                { this.renderGroupedItems() }
            </article>
        );
    }
}
