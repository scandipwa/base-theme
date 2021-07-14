/* eslint-disable react/no-unused-state */
/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-ProductReviewListtheme
 */

import PropTypes from 'prop-types';
import { lazy, PureComponent, Suspense } from 'react';

import ContentWrapper from 'Component/ContentWrapper';
import Loader from 'Component/Loader/Loader.component';
import ProductActions from 'Component/ProductActions';
import ProductCompareButton from 'Component/ProductCompareButton';
import ProductCustomizableOptions from 'Component/ProductCustomizableOptions';
import ProductLinks from 'Component/ProductLinks';
import ProductTabs from 'Component/ProductTabs';
import NoMatchHandler from 'Route/NoMatchHandler';
import {
    PRODUCT_ATTRIBUTES,
    PRODUCT_INFORMATION,
    PRODUCT_REVIEWS
} from 'Route/ProductPage/ProductPage.config';
import { RELATED, UPSELL } from 'Store/LinkedProducts/LinkedProducts.reducer';
import { DeviceType } from 'Type/Device';
import { ProductType } from 'Type/ProductList';

import './ProductPage.style';

export const ProductGallery = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "product-gallery" */
    'Component/ProductGallery'
));
export const ProductInformation = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "product-info" */
    'Component/ProductInformation'
));
export const ProductReviews = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "product-reviews" */
    'Component/ProductReviews'
));
export const ProductAttributes = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "product-attributes" */
    'Component/ProductAttributes'
));

/** @namespace Route/ProductPage/Component */
export class ProductPage extends PureComponent {
    static propTypes = {
        configurableVariantIndex: PropTypes.number.isRequired,
        productOrVariant: ProductType.isRequired,
        getLink: PropTypes.func.isRequired,
        parameters: PropTypes.objectOf(PropTypes.string).isRequired,
        updateConfigurableVariant: PropTypes.func.isRequired,
        dataSource: ProductType.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired,
        getSelectedCustomizableOptions: PropTypes.func.isRequired,
        handleChangeProductTab: PropTypes.func.isRequired,
        setLinkedDownloadables: PropTypes.func.isRequired,
        setLinkedDownloadablesPrice: PropTypes.func.isRequired,
        productOptionsData: PropTypes.object.isRequired,
        setBundlePrice: PropTypes.func.isRequired,
        selectedLinkPrice: PropTypes.number.isRequired,
        selectedBundlePrice: PropTypes.number.isRequired,
        device: DeviceType.isRequired,
        isInformationTabEmpty: PropTypes.bool.isRequired,
        isAttributesTabEmpty: PropTypes.bool.isRequired,
        selectedBundlePriceExclTax: PropTypes.number.isRequired,
        selectedInitialBundlePrice: PropTypes.number.isRequired,
        ProductTabsDefaultValue: PropTypes.number.isRequired
    };

    tabMap = {
        [PRODUCT_INFORMATION]: {
            name: __('About'),
            shouldTabRender: () => {
                const { isInformationTabEmpty } = this.props;
                return !isInformationTabEmpty;
            },
            render: (key) => this.renderProductInformationTab(key)
        },
        [PRODUCT_ATTRIBUTES]: {
            name: __('Details'),
            shouldTabRender: () => {
                const { isAttributesTabEmpty } = this.props;
                return !isAttributesTabEmpty;
            },
            render: (key) => this.renderProductAttributesTab(key)
        },
        [PRODUCT_REVIEWS]: {
            name: __('Reviews'),
            // Return true since we always show 'Add review' button
            shouldTabRender: () => true,
            render: (key) => this.renderProductReviewsTab(key)
        }
    };

    renderProductCompareButton() {
        const {
            dataSource: { id } = {},
            device: { isMobile } = {}
        } = this.props;

        if (!isMobile) {
            return null;
        }

        return (
            <div block="ProductPage" elem="ProductCompareButtonWrapper">
                <ProductCompareButton
                  productId={ id }
                  mix={ {
                      block: 'ProductCompareButton',
                      mods: { isGrey: true }
                  } }
                />
            </div>
        );
    }

    renderProductPageContent() {
        const {
            configurableVariantIndex,
            parameters,
            getLink,
            dataSource,
            updateConfigurableVariant,
            productOrVariant,
            areDetailsLoaded,
            getSelectedCustomizableOptions,
            productOptionsData,
            handleChangeProductTab,
            setBundlePrice,
            selectedBundlePrice,
            selectedInitialBundlePrice,
            selectedBundlePriceExclTax,
            setLinkedDownloadables,
            setLinkedDownloadablesPrice,
            selectedLinkPrice
        } = this.props;

        return (
            <>
                <Suspense fallback={ <Loader /> }>
                    <ProductGallery
                      product={ productOrVariant }
                      areDetailsLoaded={ areDetailsLoaded }
                    />
                </Suspense>
                { this.renderProductCompareButton() }
                <ProductActions
                  getLink={ getLink }
                  updateConfigurableVariant={ updateConfigurableVariant }
                  product={ dataSource }
                  productOrVariant={ productOrVariant }
                  parameters={ parameters }
                  areDetailsLoaded={ areDetailsLoaded }
                  configurableVariantIndex={ configurableVariantIndex }
                  getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
                  productOptionsData={ productOptionsData }
                  setProductTab={ handleChangeProductTab }
                  setBundlePrice={ setBundlePrice }
                  selectedBundlePrice={ selectedBundlePrice }
                  selectedInitialBundlePrice={ selectedInitialBundlePrice }
                  selectedBundlePriceExclTax={ selectedBundlePriceExclTax }
                  setLinkedDownloadables={ setLinkedDownloadables }
                  setLinkedDownloadablesPrice={ setLinkedDownloadablesPrice }
                  selectedLinkPrice={ selectedLinkPrice }
                />
            </>
        );
    }

    renderCustomizableOptions() {
        const {
            dataSource: { options },
            getSelectedCustomizableOptions,
            productOptionsData,
            device
        } = this.props;

        if (!device.isMobile) {
            return null;
        }

        return (
            <ProductCustomizableOptions
              options={ options || [] }
              getSelectedCustomizableOptions={ getSelectedCustomizableOptions }
              productOptionsData={ productOptionsData }
            />
        );
    }

    renderProductInformationTab(key) {
        const {
            dataSource,
            parameters,
            areDetailsLoaded
        } = this.props;

        return (
            <Suspense fallback={ <Loader /> }>
                <ProductInformation
                  product={ { ...dataSource, parameters } }
                  areDetailsLoaded={ areDetailsLoaded }
                  key={ key }
                />
            </Suspense>
        );
    }

    renderProductAttributesTab(key) {
        const {
            dataSource,
            parameters,
            areDetailsLoaded
        } = this.props;

        return (
            <Suspense fallback={ <Loader /> }>
                <ProductAttributes
                  product={ { ...dataSource, parameters } }
                  areDetailsLoaded={ areDetailsLoaded }
                  key={ key }
                />
            </Suspense>
        );
    }

    renderProductReviewsTab(key) {
        const {
            dataSource,
            areDetailsLoaded
        } = this.props;

        return (
            <Suspense fallback={ <Loader /> }>
                <ProductReviews
                  product={ dataSource }
                  areDetailsLoaded={ areDetailsLoaded }
                  key={ key }
                />
            </Suspense>
        );
    }

    shouldTabsRender() {
        return Object.values(this.tabMap).filter(({ shouldTabRender }) => shouldTabRender());
    }

    renderProductTabs() {
        const { ProductTabsDefaultValue } = this.props;

        return (
            <ProductTabs tabs={ this.shouldTabsRender() } defaultTab={ ProductTabsDefaultValue } />
        );
    }

    renderAdditionalSections() {
        const {
            areDetailsLoaded
        } = this.props;

        return (
            <>
                { this.renderCustomizableOptions() }
                { this.renderProductTabs() }
                <ProductLinks
                  linkType={ RELATED }
                  title={ __('Recommended for you') }
                  areDetailsLoaded={ areDetailsLoaded }
                />
                <ProductLinks
                  linkType={ UPSELL }
                  title={ __('You might also like') }
                  areDetailsLoaded={ areDetailsLoaded }
                />
            </>
        );
    }

    render() {
        return (
            <NoMatchHandler>
                <main
                  block="ProductPage"
                  aria-label="Product page"
                  itemScope
                  itemType="http://schema.org/Product"
                >
                    <ContentWrapper
                      wrapperMix={ { block: 'ProductPage', elem: 'Wrapper' } }
                      label={ __('Main product details') }
                    >
                        { this.renderProductPageContent() }
                    </ContentWrapper>
                    { this.renderAdditionalSections() }
                </main>
            </NoMatchHandler>
        );
    }
}

export default ProductPage;
