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
import { Component, createRef } from 'react';

import AddToCart from 'Component/AddToCart';
import Image from 'Component/Image';
import Link from 'Component/Link';
import Loader from 'Component/Loader';
import ProductAttributeValue from 'Component/ProductAttributeValue';
import ProductCompareButton from 'Component/ProductCompareButton';
import ProductPrice from 'Component/ProductPrice';
import ProductReviewRating from 'Component/ProductReviewRating';
import ProductWishlistButton from 'Component/ProductWishlistButton';
import TextPlaceholder from 'Component/TextPlaceholder';
import TierPrices from 'Component/TierPrices';
import { GRID_LAYOUT, LIST_LAYOUT } from 'Route/CategoryPage/CategoryPage.config';
import { DeviceType } from 'Type/Device';
import { ProductType } from 'Type/ProductList';
import { formatPrice, roundPrice } from 'Util/Price';
import { BUNDLE, CONFIGURABLE, GROUPED } from 'Util/Product';

import {
    OPTION_TYPE_COLOR,
    OPTION_TYPE_IMAGE,
    OUT_OF_STOCK,
    validOptionTypes
} from './ProductCard.config';

import './ProductCard.style';
/**
 * Product card
 * @class ProductCard
 * @namespace Component/ProductCard/Component
 */
export class ProductCard extends Component {
    static propTypes = {
        linkTo: PropTypes.shape({}),
        product: ProductType.isRequired,
        device: DeviceType.isRequired,
        productOrVariant: ProductType.isRequired,
        thumbnail: PropTypes.string,
        availableVisualOptions: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
            type: PropTypes.string
        })).isRequired,
        getAttribute: PropTypes.func.isRequired,
        registerSharedElement: PropTypes.func.isRequired,
        children: PropTypes.element,
        isLoading: PropTypes.bool,
        mix: PropTypes.shape({}),
        renderContent: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        isConfigurableProductOutOfStock: PropTypes.func.isRequired,
        isBundleProductOutOfStock: PropTypes.func.isRequired,
        hideWishlistButton: PropTypes.bool,
        isWishlistEnabled: PropTypes.bool.isRequired,
        hideCompareButton: PropTypes.bool,
        siblingsHaveBrands: PropTypes.bool,
        setSiblingsHaveBrands: PropTypes.func,
        siblingsHavePriceBadge: PropTypes.bool,
        setSiblingsHavePriceBadge: PropTypes.func,
        siblingsHaveTierPrice: PropTypes.bool,
        setSiblingsHaveTierPrice: PropTypes.func,
        siblingsHaveConfigurableOptions: PropTypes.bool,
        setSiblingsHaveConfigurableOptions: PropTypes.func,
        layout: PropTypes.string,
        isPreview: PropTypes.bool.isRequired
    };

    static defaultProps = {
        thumbnail: '',
        linkTo: {},
        children: null,
        isLoading: false,
        mix: {},
        renderContent: false,
        hideWishlistButton: false,
        hideCompareButton: false,
        siblingsHaveBrands: false,
        setSiblingsHaveBrands: () => null,
        siblingsHavePriceBadge: false,
        setSiblingsHavePriceBadge: () => null,
        siblingsHaveTierPrice: false,
        setSiblingsHaveTierPrice: () => null,
        siblingsHaveConfigurableOptions: false,
        setSiblingsHaveConfigurableOptions: () => null,
        layout: GRID_LAYOUT
    };

    contentObject = {
        renderCardLinkWrapper: this.renderCardLinkWrapper.bind(this),
        pictureBlock: {
            picture: this.renderPicture.bind(this)
        },
        content: {
            review: this.renderReviews.bind(this),
            productPrice: this.renderProductPrice.bind(this),
            confOptions: this.renderVisualConfigurableOptions.bind(this),
            tierPrice: this.renderTierPrice.bind(this),
            mainDetails: this.renderMainDetails.bind(this),
            additionalProductDetails: this.renderAdditionalProductDetails.bind(this)
        }
    };

    productTypeRenderMap = {
        [GROUPED]: __('Starting from'),
        [CONFIGURABLE]: __('As Low as')
    };

    imageRef = createRef();

    shouldComponentUpdate(nextProps) {
        const { product, device, productOrVariant } = this.props;
        const {
            product: nextProduct,
            device: nextDevice,
            productOrVariant: nextProductOrVariant
        } = nextProps;

        return product !== nextProduct || device !== nextDevice || productOrVariant !== nextProductOrVariant;
    }

    registerSharedElement = () => {
        const { registerSharedElement } = this.props;
        registerSharedElement(this.imageRef);
    };

    renderProductTypePriceBadge() {
        const {
            product: { type_id },
            siblingsHavePriceBadge,
            setSiblingsHavePriceBadge
        } = this.props;

        const label = this.productTypeRenderMap[type_id];
        if (!label) {
            return null;
        }

        if (!siblingsHavePriceBadge) {
            setSiblingsHavePriceBadge();
        }

        return (
            <p
              mix={ {
                  block: 'ProductCard',
                  elem: 'PriceBadge'
              } }
            >
                { label }
            </p>
        );
    }

    renderBundlePriceBadge(bounds) {
        const {
            product: { type_id, price_view }
        } = this.props;

        if (type_id !== BUNDLE) {
            return null;
        }

        // eslint-disable-next-line
        let bundleBadgeLabel;

        if (bounds === 'bottom') {
            bundleBadgeLabel = 'From';

            if (price_view !== 'PRICE_RANGE') {
                bundleBadgeLabel = 'As low as';
            }
        }

        if (bounds === 'top') {
            bundleBadgeLabel = 'To';
        }

        return (
            <p
              mix={ {
                  block: 'ProductCard',
                  elem: 'PriceBadge'
              } }
            >
                { __(bundleBadgeLabel) }
            </p>
        );
    }

    renderOldMaxBundlePrice() {
        const {
            product: { price_range }
        } = this.props;

        const oldMaxBundlePrice = `${ price_range.maximum_price.regular_price.value }`;
        const finalMaxBundlePrice = `${ price_range.maximum_price.final_price.value }`;

        if (finalMaxBundlePrice === oldMaxBundlePrice) {
            return null;
        }

        return (
            <del
              block="ProductPrice"
              elem="HighPrice"
              aria-label={ __('Old product price') }
            >
                { roundPrice(`${ oldMaxBundlePrice }`) }
            </del>
        );
    }

    renderMaxBundlePrice() {
        const {
            product: { price_range }
        } = this.props;

        const oldMaxBundlePrice = `${ price_range.maximum_price.regular_price.value }`;
        const finalMaxBundlePrice = `${ price_range.maximum_price.final_price.value }`;

        return (
            <p
              aria-label={ __(`'Maximal product price: ${ finalMaxBundlePrice }'`) }
                // eslint-disable-next-line react/forbid-component-props
              className="ProductPrice"
              mods={ { hasDiscount: finalMaxBundlePrice !== oldMaxBundlePrice } }
              block="ProductCard"
              elem="Price"
            >
                <ins>
                   <span>
                        { formatPrice(`${ finalMaxBundlePrice }`) }
                   </span>
                </ins>
                { this.renderOldMaxBundlePrice() }
            </p>
        );
    }

    renderEmptyProductPrice() {
        return (
            <div
              block="ProductCard"
              elem="PriceWrapper"
              mods={ { isEmpty: true } }
            />
        );
    }

    renderProductPrice() {
        const {
            product: {
                price_range,
                type_id,
                price_view,
                dynamic_price
            },
            isConfigurableProductOutOfStock,
            isBundleProductOutOfStock
        } = this.props;

        if (!price_range) {
            return <TextPlaceholder />;
        }

        switch (type_id) {
        case CONFIGURABLE:
            if (isConfigurableProductOutOfStock()) {
                return this.renderEmptyProductPrice();
            }
            break;
        case BUNDLE:
            if (isBundleProductOutOfStock()) {
                return this.renderEmptyProductPrice();
            }
            break;
        default:
            break;
        }

        if (type_id === BUNDLE) {
            if (price_view === 'PRICE_RANGE' && dynamic_price) {
                return (
                    <div block="ProductCard" elem="PriceWrapper">
                        { this.renderBundlePriceBadge('bottom') }
                        <ProductPrice
                          price={ price_range }
                          mix={ { block: 'ProductCard', elem: 'Price' } }
                        />
                        { this.renderBundlePriceBadge('top') }
                        { this.renderMaxBundlePrice() }
                    </div>
                );
            }

            if (price_view === 'AS_LOW_AS') {
                return (
                    <div block="ProductCard" elem="PriceWrapper">
                        { this.renderBundlePriceBadge('bottom') }
                        <ProductPrice
                          price={ price_range }
                          mix={ { block: 'ProductCard', elem: 'Price' } }
                        />
                    </div>
                );
            }
        }

        return (
            <div block="ProductCard" elem="PriceWrapper">
                { this.renderTierPrice() }
                { this.renderProductTypePriceBadge() }
                <ProductPrice
                  price={ price_range }
                  mix={ { block: 'ProductCard', elem: 'Price' } }
                />
            </div>
        );
    }

    renderTierPrice() {
        const {
            productOrVariant,
            siblingsHaveTierPrice,
            setSiblingsHaveTierPrice
        } = this.props;
        const { price_tiers } = productOrVariant;

        if (!price_tiers || !price_tiers.length) {
            return null;
        }

        if (!siblingsHaveTierPrice) {
            setSiblingsHaveTierPrice();
        }

        return (
            <TierPrices
              product={ productOrVariant }
              isLowestPrice
            />
        );
    }

    renderImageVisualOption(label, value, i) {
        return (
            <img
              key={ i }
              block="ProductCard"
              elem="Image"
              src={ `/media/attribute/swatch/swatch_thumb/110x90${value}` }
              alt={ label }
            />
        );
    }

    renderVisualOption = ({ label, value, type }, i) => {
        if (type === OPTION_TYPE_IMAGE) {
            return this.renderImageVisualOption(label, value, i);
        }

        const isColor = type === OPTION_TYPE_COLOR;

        return (
            <span
              block="ProductCard"
              elem={ isColor ? 'Color' : 'String' }
              key={ i }
              style={ isColor ? { backgroundColor: value } : {} }
              aria-label={ isColor ? label : '' }
              title={ isColor ? '' : label }
            >
                { isColor ? '' : value }
            </span>
        );
    };

    renderVisualConfigurableOptions() {
        const {
            siblingsHaveConfigurableOptions,
            setSiblingsHaveConfigurableOptions,
            availableVisualOptions,
            device,
            isPreview
        } = this.props;

        if (isPreview) {
            return <TextPlaceholder />;
        }

        if (device.isMobile || !availableVisualOptions.length) {
            return <div block="ProductCard" elem="ConfigurableOptions" />;
        }

        if (!validOptionTypes.includes(availableVisualOptions[0].type)) {
            return <div block="ProductCard" elem="ConfigurableOptions" />;
        }

        if (!siblingsHaveConfigurableOptions) {
            setSiblingsHaveConfigurableOptions();
        }

        return (
            <div block="ProductCard" elem="ConfigurableOptions">
                { availableVisualOptions.map(this.renderVisualOption) }
            </div>
        );
    }

    renderPicture(mix = {}) {
        const { product: { id, name }, thumbnail } = this.props;

        this.sharedComponent = (
            <Image
              imageRef={ this.imageRef }
              src={ thumbnail }
              alt={ name }
              ratio="custom"
              mix={ { block: 'ProductCard', elem: 'Picture', mix } }
              isPlaceholder={ !id }
            />
        );

        return (
            <>
                { this.sharedComponent }
                <img
                  style={ { display: 'none' } }
                  alt={ name }
                  src={ thumbnail }
                />
            </>
        );
    }

    renderReviews() {
        const {
            product: {
                review_summary: {
                    rating_summary
                } = {}
            },
            layout
        } = this.props;

        if (!rating_summary) {
            return null;
        }

        return (
            <div
              block="ProductCard"
              elem="Reviews"
              mods={ { layout } }
            >
                <ProductReviewRating summary={ rating_summary || 0 } />
            </div>
        );
    }

    renderProductCompareButton() {
        const {
            product: { id },
            hideCompareButton
        } = this.props;

        if (hideCompareButton) {
            return null;
        }

        return (
            <ProductCompareButton
              productId={ id }
              mix={ {
                  block: 'ProductCompareButton',
                  mods: { isGrey: true }
              } }
            />
        );
    }

    renderProductCardWishlistButton() {
        const { product, hideWishlistButton, isWishlistEnabled } = this.props;

        if (hideWishlistButton || !isWishlistEnabled) {
            return null;
        }

        return (
            <ProductWishlistButton
              product={ product }
              mix={ { block: 'ProductCard', elem: 'WishListButton' } }
              groupedProductQuantity={ {} }
            />
        );
    }

    renderProductActions() {
        return (
            <div block="ProductCard" elem="ProductActions">
                { this.renderProductCardWishlistButton() }
                { this.renderProductCompareButton() }
            </div>
        );
    }

    renderBrandValue() {
        const {
            getAttribute,
            siblingsHaveBrands,
            setSiblingsHaveBrands
        } = this.props;
        const {
            product_list_content: {
                attribute_to_display
            } = {}
        } = window.contentConfiguration;
        const brand = getAttribute(attribute_to_display || 'brand');

        if (!brand) {
            return null;
        }

        if (!siblingsHaveBrands) {
            setSiblingsHaveBrands();
        }

        return (
            <ProductAttributeValue
              attribute={ brand }
              isFormattedAsText
              mix={ {
                  block: 'ProductCard',
                  elem: 'BrandAttributeValue'
              } }
            />
        );
    }

    renderAdditionalProductDetails() {
        return (
            <div block="ProductCard" elem="Brand">
                { this.renderBrandValue() }
            </div>
        );
    }

    renderMainDetails() {
        const { layout } = this.props;

        if (layout === GRID_LAYOUT) {
            return this.renderProductName();
        }

        return this.renderCardLinkWrapper(
            this.renderProductName()
        );
    }

    renderProductName() {
        const { product: { name } } = this.props;

        return (
            <p
              block="ProductCard"
              elem="Name"
              mods={ { isLoaded: !!name } }
            >
                <TextPlaceholder content={ name } length="medium" />
            </p>
        );
    }

    renderCardLinkWrapper(children, mix = {}) {
        const { linkTo, product: { url } } = this.props;

        if (!url) {
            return (
                <div
                  block="ProductCard"
                  elem="Link"
                >
                    { children }
                </div>
            );
        }

        return (
            <Link
              block="ProductCard"
              elem="Link"
              to={ linkTo }
              onClick={ this.registerSharedElement }
              mix={ mix }
            >
                { children }
            </Link>
        );
    }

    renderAddToCart() {
        const {
            product,
            product: {
                type_id,
                stock_status
            }
        } = this.props;
        const configurableVariantIndex = -1;
        const quantity = 1;
        const groupedProductQuantity = {};
        const productOptionsData = {};

        if (type_id !== 'simple') {
            return this.renderCardLinkWrapper(
                <button block="Button">{ __('Add To Cart') }</button>
            );
        }

        return (
            <AddToCart
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
              mix={ { block: 'ProductActions', elem: 'AddToCart' } }
              quantity={ quantity }
              groupedProductQuantity={ groupedProductQuantity }
              productOptionsData={ productOptionsData }
              disabled={ stock_status === OUT_OF_STOCK }
            />
        );
    }

    renderCardContent() {
        const { renderContent } = this.props;

        if (renderContent) {
            return renderContent(this.contentObject);
        }

        return (
            this.renderCardLinkWrapper((
                <>
                    <div block="ProductCard" elem="FigureReview">
                        <figure block="ProductCard" elem="Figure">
                            { this.renderPicture() }
                        </figure>
                        { this.renderReviews() }
                    </div>
                    <div block="ProductCard" elem="Content">
                        { this.renderAdditionalProductDetails() }
                        { this.renderMainDetails() }
                        { this.renderProductPrice() }
                        { this.renderVisualConfigurableOptions() }
                    </div>
                </>
            ))
        );
    }

    renderCardListContent() {
        const { children, layout, renderContent } = this.props;

        if (renderContent) {
            return renderContent(this.contentObject);
        }

        return (
            <div block="ProductCard" elem="Link">
                { this.renderCardLinkWrapper(
                    <div block="ProductCard" elem="FigureReview">
                        <figure block="ProductCard" elem="Figure">
                            { this.renderPicture() }
                        </figure>
                    </div>
                ) }
                <div block="ProductCard" elem="Content" mods={ { layout } }>
                    <div block="ProductCard" elem="MainInfo">
                        { this.renderAdditionalProductDetails() }
                        { this.renderMainDetails() }
                        { this.renderReviews() }
                    </div>
                    <div block="ProductCard" elem="AttributeWrapper">
                        { this.renderProductPrice() }
                        { this.renderVisualConfigurableOptions() }
                    </div>
                    <div block="ProductCard" elem="ActionWrapper">
                        { this.renderAddToCart() }
                        { this.renderProductActions() }
                    </div>
                    <div block="ProductCard" elem="AdditionalContent">
                        { children }
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const {
            children,
            mix,
            isLoading,
            siblingsHaveBrands,
            siblingsHavePriceBadge,
            siblingsHaveTierPrice,
            siblingsHaveConfigurableOptions,
            layout
        } = this.props;

        const mods = {
            siblingsHaveBrands,
            siblingsHavePriceBadge,
            siblingsHaveTierPrice,
            siblingsHaveConfigurableOptions
        };

        if (layout === LIST_LAYOUT) {
            return (
                <li
                  block="ProductCard"
                  mods={ mods }
                  mix={ mix }
                >
                    <Loader isLoading={ isLoading } />
                    { this.renderCardListContent() }
                </li>
            );
        }

        return (
            <li
              block="ProductCard"
              mods={ mods }
              mix={ mix }
            >
                <Loader isLoading={ isLoading } />
                { this.renderCardContent() }
                { this.renderProductActions() }
                <div block="ProductCard" elem="AdditionalContent">
                    { children }
                </div>
            </li>
        );
    }
}

export default ProductCard;
