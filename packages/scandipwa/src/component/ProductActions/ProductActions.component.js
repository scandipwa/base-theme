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
import { createRef, PureComponent } from 'react';

import AddToCart from 'Component/AddToCart';
import Field from 'Component/Field';
import GroupedProductList from 'Component/GroupedProductList';
import Html from 'Component/Html';
import ProductBundleItems from 'Component/ProductBundleItems';
import { OUT_OF_STOCK } from 'Component/ProductCard/ProductCard.config';
import ProductCompareButton from 'Component/ProductCompareButton';
import ProductConfigurableAttributes from 'Component/ProductConfigurableAttributes';
import ProductCustomizableOptions from 'Component/ProductCustomizableOptions';
import ProductDownloadableLinks from 'Component/ProductDownloadableLinks';
import ProductDownloadableSamples from 'Component/ProductDownloadableSamples';
import ProductPrice from 'Component/ProductPrice';
import ProductReviewRating from 'Component/ProductReviewRating';
import ProductWishlistButton from 'Component/ProductWishlistButton';
import TextPlaceholder from 'Component/TextPlaceholder';
import TierPrices from 'Component/TierPrices';
import { DeviceType } from 'Type/Device';
import { PriceType, ProductType } from 'Type/ProductList';
import { isCrawler, isSSR } from 'Util/Browser';
import {
    BUNDLE,
    CONFIGURABLE,
    DOWNLOADABLE,
    GROUPED,
    showNewReviewPopup
} from 'Util/Product';

import './ProductActions.style';

/**
 * Product actions
 * @class ProductActions
 * @namespace Component/ProductActions/Component
 */
export class ProductActions extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        productOrVariant: ProductType.isRequired,
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
        filterConfigurableOptions: PropTypes.func.isRequired,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        clearGroupedProductQuantity: PropTypes.func.isRequired,
        setGroupedProductQuantity: PropTypes.func.isRequired,
        setLinkedDownloadables: PropTypes.func.isRequired,
        setLinkedDownloadablesPrice: PropTypes.func.isRequired,
        onProductValidationError: PropTypes.func.isRequired,
        getSelectedCustomizableOptions: PropTypes.func.isRequired,
        productOptionsData: PropTypes.object.isRequired,
        setBundlePrice: PropTypes.func.isRequired,
        productPrice: PriceType,
        productName: PropTypes.string,
        offerCount: PropTypes.number.isRequired,
        offerType: PropTypes.string.isRequired,
        stockMeta: PropTypes.string.isRequired,
        metaLink: PropTypes.string.isRequired,
        device: DeviceType.isRequired,
        isWishlistEnabled: PropTypes.bool.isRequired,
        displayProductStockStatus: PropTypes.bool.isRequired,
        setRefs: PropTypes.func.isRequired,
        areReviewsEnabled: PropTypes.bool.isRequired
    };

    static defaultProps = {
        configurableVariantIndex: 0,
        productPrice: {},
        productName: ''
    };

    configurableOptionsRef = createRef();

    groupedProductsRef = createRef();

    componentDidMount() {
        const { setRefs } = this.props;
        setRefs({
            configurableOptionsRef: this.configurableOptionsRef,
            groupedProductsRef: this.groupedProductsRef
        });
    }

    componentDidUpdate(prevProps) {
        const { product: { id: prevId } } = prevProps;
        const { product: { id }, minQuantity, setQuantity } = this.props;

        if (id !== prevId) {
            setQuantity(minQuantity);
        }
    }

    renderStock(stockStatus) {
        const { displayProductStockStatus } = this.props;

        if (!displayProductStockStatus) {
            return null;
        }

        const stockStatusLabel = stockStatus === OUT_OF_STOCK ? __('Out of stock') : __('In stock');

        return <span block="ProductActions" elem="Stock">{ stockStatusLabel }</span>;
    }

    renderReviewButton() {
        const { areReviewsEnabled } = this.props;

        if (!areReviewsEnabled) {
            return null;
        }

        return (
            <button
              block="ProductActions"
              elem="Review"
              onClick={ showNewReviewPopup }
            >
                { __('Write a review') }
            </button>
        );
    }

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
                                { __('SKU: %s', sku) }
                            </span>
                            { this.renderStock(stock_status) }
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
            product: { configurable_options, type_id, variants },
            filterConfigurableOptions
        } = this.props;

        if (type_id !== CONFIGURABLE) {
            return null;
        }

        return (
            <div
              ref={ this.configurableOptionsRef }
              block="ProductActions"
              elem="AttributesWrapper"
            >
                <ProductConfigurableAttributes
                    // eslint-disable-next-line no-magic-numbers
                  numberOfPlaceholders={ [2, 4] }
                  mix={ { block: 'ProductActions', elem: 'Attributes' } }
                  isReady={ areDetailsLoaded }
                  getLink={ getLink }
                  parameters={ parameters }
                  variants={ variants }
                  updateConfigurableVariant={ updateConfigurableVariant }
                  configurable_options={ filterConfigurableOptions(configurable_options) }
                  isContentExpanded
                />
            </div>
        );
    }

    renderBundleItems() {
        const {
            product: { items, type_id, price_range },
            maxQuantity,
            getSelectedCustomizableOptions,
            productOptionsData,
            setBundlePrice
        } = this.props;

        if (type_id !== BUNDLE) {
            return null;
        }

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'bundle_items' } }
            >
                <ProductBundleItems
                  items={ items }
                  getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
                  maxQuantity={ maxQuantity }
                  productOptionsData={ productOptionsData }
                  setBundlePrice={ setBundlePrice }
                  price_range={ price_range }
                  type_id={ type_id }
                />
            </section>
        );
    }

    renderShortDescriptionContent() {
        const { product: { short_description } } = this.props;
        const { html } = short_description || {};

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

        if (!html && id) {
            return null;
        }

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

    renderName() {
        const { product: { name } } = this.props;

        return (
            <h1 block="ProductActions" elem="Title" itemProp="name">
                <TextPlaceholder content={ name } length="medium" />
            </h1>
        );
    }

    renderBrand() {
        const {
            product: {
                attributes: { brand: { attribute_value: brand } = {} } = {}
            },
            showOnlyIfLoaded
        } = this.props;

        return showOnlyIfLoaded(
            brand,
            (
                <>
                    <meta itemProp="brand" content={ brand } />
                    <h4 block="ProductActions" elem="Brand" itemProp="brand">
                        <TextPlaceholder content={ brand } />
                    </h4>
                </>
            )
        );
    }

    renderCustomizableOptions() {
        const {
            product: {
                options,
                type_id = '',
                price_range = {}
            } = {},
            getSelectedCustomizableOptions,
            productOptionsData,
            device: { isMobile }
        } = this.props;

        if (isMobile) {
            return null;
        }

        return (
            <section
              block="ProductActions"
              elem="Section"
              mods={ { type: 'customizable_options' } }
            >
                <ProductCustomizableOptions
                  options={ options }
                  getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
                  productOptionsData={ productOptionsData }
                  price_range={ price_range }
                  type_id={ type_id }
                />
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

        if (type_id === GROUPED) {
            return null;
        }

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
            groupedProductQuantity,
            onProductValidationError,
            productOptionsData,
            product: {
                stock_status
            } = {}
        } = this.props;

        return (
            <AddToCart
              product={ product }
              configurableVariantIndex={ configurableVariantIndex }
              mix={ { block: 'ProductActions', elem: 'AddToCart' } }
              quantity={ quantity }
              groupedProductQuantity={ groupedProductQuantity }
              onProductValidationError={ onProductValidationError }
              productOptionsData={ productOptionsData }
              disabled={ stock_status === OUT_OF_STOCK }
              isWithIcon
            />
        );
    }

    renderOfferCount() {
        const { offerCount } = this.props;

        if (offerCount > 1) {
            return (
                <meta
                  itemProp="offerCount"
                  content={ offerCount }
                />
            );
        }

        return null;
    }

    renderSchema() {
        const {
            productName,
            stockMeta,
            metaLink
        } = this.props;

        return (
            <>
                { this.renderOfferCount() }
                <meta itemProp="availability" content={ stockMeta } />
                <meta itemProp="url" content={ metaLink } />
                <a
                  block="ProductActions"
                  elem="SchemaUrl"
                  itemProp="url"
                  href={ metaLink }
                >
                    { productName }
                </a>
            </>
        );
    }

    getConfigurablePriceBadge() {
        const {
            configurableVariantIndex,
            product: { type_id }
        } = this.props;

        if (
            type_id !== CONFIGURABLE
            || configurableVariantIndex > -1
        ) {
            return null;
        }

        return __('As Low as');
    }

    renderPriceWithSchema() {
        const {
            productPrice,
            offerCount,
            productOrVariant: {
                stock_status
            }
        } = this.props;

        if (stock_status === OUT_OF_STOCK) {
            return null;
        }

        const {
            minimum_price: {
                final_price: {
                    value: minFinalPrice = 0
                } = {}
            } = {},
            maximum_price: {
                final_price: {
                    value: maxFinalPrice = 0
                } = {}
            } = {}
        } = productPrice;

        return (
            <div
              block="ProductActions"
              elem="PriceWrapper"
            >
                { this.renderSchema() }
                <meta
                  itemProp="highPrice"
                  content={ (minFinalPrice === maxFinalPrice) ? minFinalPrice : maxFinalPrice }
                />
                <ProductPrice
                  isSchemaRequired
                  variantsCount={ offerCount }
                  price={ productPrice }
                  mix={ { block: 'ProductActions', elem: 'Price' } }
                  label={ this.getConfigurablePriceBadge() }
                />
            </div>
        );
    }

    renderPriceWithGlobalSchema() {
        const {
            offerType,
            product: {
                type_id
            }
        } = this.props;

        if (type_id === GROUPED) {
            return null;
        }

        return (
            <div
              block="ProductActions"
              elem="Schema"
              itemType={ offerType }
              itemProp="offers"
              itemScope
            >
                { this.renderPriceWithSchema() }
            </div>
        );
    }

    renderProductWishlistButton() {
        const {
            product,
            quantity,
            configurableVariantIndex,
            onProductValidationError,
            productOptionsData,
            groupedProductQuantity,
            isWishlistEnabled
        } = this.props;

        if (!isWishlistEnabled) {
            return null;
        }

        return (
            <ProductWishlistButton
              product={ product }
              quantity={ quantity }
              configurableVariantIndex={ configurableVariantIndex }
              onProductValidationError={ onProductValidationError }
              productOptionsData={ productOptionsData }
              groupedProductQuantity={ groupedProductQuantity }
            />
        );
    }

    renderProductCompareButton() {
        const {
            product: { id } = {}
        } = this.props;

        if (!id) {
            return null;
        }

        return (
            <ProductCompareButton productId={ id } />
        );
    }

    renderReviewSection() {
        return (
            <div
              block="ProductActions"
              elem="Reviews"
            >
                { this.renderReviews() }
                { this.renderReviewButton() }
            </div>
        );
    }

    renderReviews() {
        const {
            product: {
                review_summary: {
                    rating_summary,
                    review_count
                } = {}
            }
        } = this.props;

        if (!rating_summary) {
            return null;
        }

        return <ProductReviewRating summary={ rating_summary || 0 } count={ review_count } />;
    }

    renderGroupedItems() {
        const {
            product,
            product: {
                type_id
            },
            groupedProductQuantity,
            setGroupedProductQuantity,
            clearGroupedProductQuantity
        } = this.props;

        if (type_id !== GROUPED) {
            return null;
        }

        return (
            <div
              block="ProductActions"
              elem="GroupedItems"
              ref={ this.groupedProductsRef }
            >
                <GroupedProductList
                  product={ product }
                  clearGroupedProductQuantity={ clearGroupedProductQuantity }
                  groupedProductQuantity={ groupedProductQuantity }
                  setGroupedProductQuantity={ setGroupedProductQuantity }
                />
            </div>
        );
    }

    renderTierPrices() {
        const { productOrVariant } = this.props;

        return (
            <div block="ProductActions" elem="TierPrices">
                <TierPrices product={ productOrVariant } />
            </div>
        );
    }

    renderDownloadableProductSample() {
        const {
            product: {
                type_id,
                samples_title,
                downloadable_product_samples
            }
        } = this.props;

        if (type_id !== DOWNLOADABLE || !downloadable_product_samples) {
            return null;
        }

        return (
            <ProductDownloadableSamples
              title={ samples_title }
              samples={ downloadable_product_samples }
            />
        );
    }

    renderDownloadableProductLinks() {
        const {
            setLinkedDownloadables,
            setLinkedDownloadablesPrice,
            product: {
                type_id, downloadable_product_links, links_title, links_purchased_separately
            }
        } = this.props;

        if (type_id !== DOWNLOADABLE) {
            return null;
        }

        const isRequired = links_purchased_separately === 1;

        return (
            <ProductDownloadableLinks
              links={ downloadable_product_links }
              setLinkedDownloadables={ setLinkedDownloadables }
              setLinkedDownloadablesPrice={ setLinkedDownloadablesPrice }
              title={ links_title }
              isRequired={ isRequired }
            />
        );
    }

    renderAddToCartActionBlock() {
        return (
            <div
              block="ProductActions"
              elem="AddToCartWrapper"
              mods={ { isPrerendered: isSSR() || isCrawler() } }
            >
                { this.renderQuantityInput() }
                { this.renderAddToCart() }
                <div block="ProductActions" elem="ActionButtons">
                    { this.renderProductWishlistButton() }
                    { this.renderProductCompareButton() }
                </div>
            </div>
        );
    }

    renderAddToCartMobile() {
        return (
            <div
              block="ProductActions"
              elem="AddToCartFixed"
              mods={ { isPrerendered: isSSR() || isCrawler() } }
            >
                { this.renderQuantityInput() }
                { this.renderAddToCart() }
                { this.renderProductWishlistButton() }
            </div>
        );
    }

    renderDesktop() {
        return (
            <>
                { this.renderBrand() }
                { this.renderName() }
                { this.renderReviewSection() }
                { this.renderSkuAndStock() }
                { this.renderShortDescription() }
                { this.renderConfigurableAttributes() }
                { this.renderCustomizableOptions() }
                { this.renderBundleItems() }
                { this.renderGroupedItems() }
                { this.renderDownloadableProductSample() }
                { this.renderDownloadableProductLinks() }
                { this.renderTierPrices() }
                { this.renderPriceWithGlobalSchema() }
                { this.renderAddToCartActionBlock() }
            </>
        );
    }

    renderMobile() {
        const { product: { type_id } } = this.props;
        const isWithoutPriceTotal = type_id === GROUPED;

        return (
            <>
                { this.renderTierPrices() }
                <div block="ProductActions" elem="ActionsWrapper" mods={ { isWithoutPriceTotal } }>
                    { this.renderPriceWithGlobalSchema() }
                    { this.renderSkuAndStock() }
                </div>
                <div block="ProductActions" elem="ActionsWrapper">
                    { this.renderReviewSection() }
                    { this.renderProductCompareButton() }
                </div>
                { this.renderBrand() }
                { this.renderShortDescription() }
                { this.renderConfigurableAttributes() }
                { this.renderCustomizableOptions() }
                { this.renderBundleItems() }
                { this.renderGroupedItems() }
                { this.renderDownloadableProductSample() }
                { this.renderDownloadableProductLinks() }
                { this.renderAddToCartMobile() }
            </>
        );
    }

    render() {
        const { device: { isMobile } = {} } = this.props;

        return (
            <article block="ProductActions">
                { isMobile ? this.renderMobile() : this.renderDesktop() }
            </article>
        );
    }
}

export default ProductActions;
