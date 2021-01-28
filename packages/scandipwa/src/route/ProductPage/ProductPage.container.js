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
import { withRouter } from 'react-router';

import { CATEGORY, PDP } from 'Component/Header/Header.config';
import { DEFAULT_STATE_NAME } from 'Component/NavigationAbstract/NavigationAbstract.config';
import { MENU_TAB } from 'Component/NavigationTabs/NavigationTabs.config';
import { LOADING_TIME } from 'Route/CategoryPage/CategoryPage.config';
import { changeNavigationState, goToPreviousNavigationState } from 'Store/Navigation/Navigation.action';
import { BOTTOM_NAVIGATION_TYPE, TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { setBigOfflineNotice } from 'Store/Offline/Offline.action';
import { updateProductQuantity } from 'Store/Product/Product.action';
import { updateRecentlyViewedProducts } from 'Store/RecentlyViewedProducts/RecentlyViewedProducts.action';
import { HistoryType, LocationType, MatchType } from 'Type/Common';
import { DeviceType } from 'Type/Device';
import { ProductType } from 'Type/ProductList';
import { getVariantIndex } from 'Util/Product';
import { debounce } from 'Util/Request';
import {
    convertQueryStringToKeyValuePairs,
    objectToUri,
    removeQueryParamWithoutHistory,
    updateQueryParamWithoutHistory
} from 'Util/Url';

import ProductPage from './ProductPage.component';

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Breadcrumbs/Breadcrumbs.dispatcher'
);

export const MetaDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Meta/Meta.dispatcher'
);

export const ProductDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Product/Product.dispatcher'
);

/** @namespace Route/ProductPage/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isOffline: state.OfflineReducer.isOffline,
    product: state.ProductReducer.product,
    navigation: state.NavigationReducer[TOP_NAVIGATION_TYPE],
    metaTitle: state.MetaReducer.title,
    device: state.ConfigReducer.device,
    quantity: state.ProductReducer.quantity
});

/** @namespace Route/ProductPage/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    changeHeaderState: (state) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    changeNavigationState: (state) => dispatch(changeNavigationState(BOTTOM_NAVIGATION_TYPE, state)),
    requestProduct: (options) => {
        // TODO: check linked products, there might be issues :'(
        ProductDispatcher.then(
            ({ default: dispatcher }) => dispatcher.handleData(dispatch, options)
        );
    },
    setBigOfflineNotice: (isBig) => dispatch(setBigOfflineNotice(isBig)),
    updateBreadcrumbs: (breadcrumbs) => BreadcrumbsDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateWithProduct(breadcrumbs, dispatch)
    ),
    updateMetaFromProduct: (product) => MetaDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateWithProduct(product, dispatch)
    ),
    goToPreviousNavigationState: (state) => dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE, state)),
    updateRecentlyViewedProducts: (products) => dispatch(updateRecentlyViewedProducts(products)),
    setQuantity: (quantity) => dispatch(updateProductQuantity(quantity))
});

/** @namespace Route/ProductPage/Container */
export class ProductPageContainer extends PureComponent {
    state = {
        configurableVariantIndex: -1,
        parameters: {},
        productOptionsData: {},
        selectedBundlePrice: 0,
        currentProductSKU: '',
        isBottomSheetOpen: false,
        selectedBundlePriceExclTax: 0
    };

    containerFunctions = {
        updateConfigurableVariant: this.updateConfigurableVariant.bind(this),
        getLink: this.getLink.bind(this),
        getSelectedCustomizableOptions: this.getSelectedCustomizableOptions.bind(this),
        setBundlePrice: this.setBundlePrice.bind(this),
        setBottomSheetOpen: this.setBottomSheetOpen.bind(this),
        isProductInformationTabEmpty: this.isProductInformationTabEmpty.bind(this),
        isProductAttributesTabEmpty: this.isProductAttributesTabEmpty.bind(this)
    };

    static propTypes = {
        location: LocationType,
        changeHeaderState: PropTypes.func.isRequired,
        setBigOfflineNotice: PropTypes.func.isRequired,
        changeNavigationState: PropTypes.func.isRequired,
        updateMetaFromProduct: PropTypes.func.isRequired,
        updateBreadcrumbs: PropTypes.func.isRequired,
        requestProduct: PropTypes.func.isRequired,
        isOffline: PropTypes.bool.isRequired,
        productSKU: PropTypes.string,
        product: ProductType.isRequired,
        history: HistoryType.isRequired,
        match: MatchType.isRequired,
        device: DeviceType.isRequired,
        goToPreviousNavigationState: PropTypes.func.isRequired,
        navigation: PropTypes.shape(PropTypes.shape).isRequired,
        metaTitle: PropTypes.string,
        updateRecentlyViewedProducts: PropTypes.func.isRequired,
        quantity: PropTypes.number,
        setQuantity: PropTypes.func.isRequired
    };

    static defaultProps = {
        location: { state: {} },
        productSKU: '',
        metaTitle: undefined,
        quantity: 1
    };

    static getDerivedStateFromProps(props, state) {
        const {
            product: {
                sku,
                variants,
                configurable_options
            },
            location: { search }
        } = props;

        const { currentProductSKU: prevSKU } = state;

        const currentProductSKU = prevSKU === sku ? '' : prevSKU;

        /**
         * If the product we expect to load is loaded -
         * reset expected SKU
         */
        if (!configurable_options && !variants) {
            return {
                currentProductSKU
            };
        }

        const parameters = Object.entries(convertQueryStringToKeyValuePairs(search))
            .reduce((acc, [key, value]) => {
                if (key in configurable_options) {
                    return { ...acc, [key]: value };
                }

                return acc;
            }, {});

        if (Object.keys(parameters).length !== Object.keys(configurable_options).length) {
            return {
                parameters,
                currentProductSKU
            };
        }

        const configurableVariantIndex = getVariantIndex(variants, parameters);

        return {
            parameters,
            currentProductSKU,
            configurableVariantIndex
        };
    }

    componentDidMount() {
        /**
         * Always make sure the navigation switches into the MENU tab
         * */
        this.updateNavigationState();

        /**
         * Ensure transition PDP => homepage => PDP always having proper meta
         */
        this.updateMeta();

        /**
         * Make sure to update header state, the data-source will
         * define the correct information to use for update
         * (it can be a product, history state product or an empty object).
         */
        this.updateHeaderState();
        this.updateBreadcrumbs();

        this.scrollTopIfPreviousPageWasPLP();
        this.freezeScrollOnMobile();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            isOffline,
            productSKU,
            product: {
                sku,
                options,
                items
            },
            history: {
                action
            },
            device
        } = this.props;

        const { isBottomSheetOpen: prevIsBottomSheetOpen } = prevState;
        const { isBottomSheetOpen } = this.state;

        const {
            productSKU: prevProductSKU,
            product: {
                sku: prevSku,
                options: prevOptions,
                items: prevItems
            }
        } = prevProps;

        const { sku: stateSKU } = history?.state?.state?.product || {};

        if (isOffline) {
            debounce(this.setOfflineNoticeSize, LOADING_TIME)();
        }

        /**
         * We should also update product based data if, the URL
         * rewrite SKU has changed to matching the product history SKU
         * one. At this point there could be sufficient data for
         * some updates (i.e. header state).
         */
        if (
            productSKU !== prevProductSKU
            && stateSKU === productSKU
        ) {
            this.updateHeaderState();
            this.updateNavigationState();
        }

        /**
         * If the currently loaded category ID does not match the ID of
         * category ID from URL rewrite, request category.
         */
        if (productSKU !== sku) {
            this.requestProduct();
        }

        /**
         * If product ID was changed => it is loaded => we need to
         * update product specific information, i.e. breadcrumbs.
         */
        if (sku !== prevSku || isBottomSheetOpen !== prevIsBottomSheetOpen) {
            this.updateBreadcrumbs();
            this.updateHeaderState();
            this.updateMeta();
            this.resetProductQuantity();
        }

        if (device.isMobile) {
            if (action === 'PUSH' && sku !== prevSku) {
                this.closeBottomSheetOpen();
            }
        }

        /**
         * LEGACY: needed to make sure required items are
         * selected in the bundle product.
         */
        if (JSON.stringify(options) !== JSON.stringify(prevOptions)) {
            this.getRequiredProductOptions(options);
        }

        /**
         * LEGACY needed to make sure required options are
         * selected in the customizable options product.
         */
        if (JSON.stringify(items) !== JSON.stringify(prevItems)) {
            this.getRequiredProductOptions(items);
        }

        this._addToRecentlyViewedProducts();

        this.freezeScrollOnMobile();
    }

    componentWillUnmount() {
        this.unFreezeScroll();
    }

    isProductInformationTabEmpty() {
        const dataSource = this.getDataSource();

        return !dataSource?.description?.html.length;
    }

    isProductAttributesTabEmpty() {
        const dataSource = this.getDataSource();

        return Object.keys(dataSource?.attributes || {}).length === 0;
    }

    _addToRecentlyViewedProducts() {
        const {
            product,
            product: { sku },
            updateRecentlyViewedProducts
        } = this.props;

        // necessary for skipping not loaded products
        if (!sku) {
            return;
        }

        updateRecentlyViewedProducts(product);
    }

    scrollTopIfPreviousPageWasPLP() {
        const {
            navigation: {
                navigationStateHistory,
                navigationStateHistory: { length }
            }
        } = this.props;

        const minNavStackLength = 2;

        // When first load is PDP
        if (length <= minNavStackLength) {
            return;
        }

        // Minus two, one so array keys match length, one for previous item.
        const prevPageId = length - 2;
        const { name: prevName } = navigationStateHistory[prevPageId];

        // One before prev page
        const beforePrevPageId = prevPageId - 1;
        const { name: beforePrevName } = navigationStateHistory[beforePrevPageId];

        /**
         * For some reason on desktop going from PLP to PDP
         * in navigation stack is added default name between
         */
        if (CATEGORY === prevName || (beforePrevName === CATEGORY && prevName === DEFAULT_STATE_NAME)) {
            window.scrollTo(0, 0);
        }
    }

    setOfflineNoticeSize = () => {
        const { setBigOfflineNotice, productSKU } = this.props;
        const { sku } = this.getDataSource();

        /**
         * If there is any information about the product, in example,
         * we know it's URL-rewrite SKU is matching the product SKU -
         * show the small offline notice, else - show larger one.
         */
        if (sku !== productSKU) {
            setBigOfflineNotice(true);
        } else {
            setBigOfflineNotice(false);
        }
    };

    getLink(key, value) {
        const { location: { search, pathname } } = this.props;
        const obj = {
            ...convertQueryStringToKeyValuePairs(search)
        };

        if (key) {
            obj[key] = value;
        }

        const query = objectToUri(obj);

        return `${pathname}${query}`;
    }

    getRequiredProductOptions(options) {
        const { productOptionsData } = this.state;

        if (!options) {
            return [];
        }

        const requiredOptions = options.reduce((acc, { option_id, required }) => {
            if (required) {
                acc.push(option_id);
            }

            return acc;
        }, []);

        return this.setState({
            productOptionsData:
                { ...productOptionsData, requiredOptions }
        });
    }

    setBundlePrice(prices) {
        const { price = 0, priceExclTax = 0 } = prices;
        this.setState({
            selectedBundlePrice: price,
            selectedBundlePriceExclTax: priceExclTax
        });
    }

    getSelectedCustomizableOptions(values, updateArray = false) {
        const { productOptionsData } = this.state;

        if (updateArray) {
            this.setState({
                productOptionsData:
                    { ...productOptionsData, productOptionsMulti: values }
            });
        } else {
            this.setState({
                productOptionsData:
                    { ...productOptionsData, productOptions: values }
            });
        }
    }

    getIsConfigurableParameterSelected(parameters, key, value) {
        return Object.hasOwnProperty.call(parameters, key) && parameters[key] === value;
    }

    getNewParameters(key, value) {
        const { parameters } = this.state;

        // If value is already selected, than we remove the key to achieve deselection
        if (this.getIsConfigurableParameterSelected(parameters, key, value)) {
            const { [key]: oldValue, ...newParameters } = parameters;

            return newParameters;
        }

        return {
            ...parameters,
            [key]: value.toString()
        };
    }

    containerProps = () => ({
        productOrVariant: this.getProductOrVariant(),
        dataSource: this.getDataSource(),
        areDetailsLoaded: this.getAreDetailsLoaded(),
        isInformationTabEmpty: this.isProductInformationTabEmpty(),
        isAttributesTabEmpty: this.isProductAttributesTabEmpty()
    });

    updateConfigurableVariant(key, value) {
        const parameters = this.getNewParameters(key, value);
        this.setState({ parameters });

        this.updateUrl(key, value, parameters);
        this.updateConfigurableVariantIndex(parameters);
    }

    updateUrl(key, value, parameters) {
        const { location, history } = this.props;

        const isParameterSelected = this.getIsConfigurableParameterSelected(parameters, key, value);

        if (isParameterSelected) {
            updateQueryParamWithoutHistory(key, value, history, location);
        } else {
            removeQueryParamWithoutHistory(key, history, location);
        }
    }

    updateConfigurableVariantIndex(parameters) {
        const { product: { variants, configurable_options } } = this.props;
        const { configurableVariantIndex } = this.state;

        const newIndex = Object.keys(parameters).length === Object.keys(configurable_options).length
            ? getVariantIndex(variants, parameters)
            // Not all parameters are selected yet, therefore variantIndex must be invalid
            : -1;

        if (configurableVariantIndex !== newIndex) {
            this.setState({ configurableVariantIndex: newIndex });
        }
    }

    getAreDetailsLoaded() {
        const { product } = this.props;
        const dataSource = this.getDataSource();
        return dataSource === product;
    }

    getProductOrVariant() {
        const dataSource = this.getDataSource();
        const { variants } = dataSource;
        const currentVariantIndex = this.getConfigurableVariantIndex(variants);
        const variant = variants && variants[currentVariantIndex];

        return variant || dataSource;
    }

    getConfigurableVariantIndex(variants) {
        const { configurableVariantIndex, parameters } = this.state;
        const hasParameters = !!Object.keys(parameters).length;

        if (configurableVariantIndex >= 0) {
            return configurableVariantIndex;
        }

        if (variants && hasParameters) {
            return getVariantIndex(variants, parameters);
        }

        return -1;
    }

    getDataSource() {
        const {
            productSKU,
            product
        } = this.props;

        const { sku } = product;
        const { product: stateProduct } = history?.state?.state || {};
        const { sku: stateSKU } = stateProduct || {};

        /**
         * If URL rewrite requested matches loaded product SKU
         * assume it is a data-source.
         */
        if (productSKU === sku) {
            return product;
        }

        /**
         * If URL rewrite requested matches product SKU from
         * history state - it is a data-source.
         */
        if (productSKU === stateSKU) {
            return stateProduct;
        }

        /**
         * Else there is no place to get a up-to-date
         * information about the product from.
         */
        return {};
    }

    getProductRequestFilter() {
        const { productSKU } = this.props;
        return { productSKU };
    }

    requestProduct() {
        const { requestProduct, productSKU } = this.props;
        const { currentProductSKU } = this.state;

        /**
         * If URL rewrite was not passed - do not request the product.
         */
        if (!productSKU) {
            return;
        }

        /**
         * Skip loading the same product SKU the second time
         */
        if (currentProductSKU === productSKU) {
            return;
        }

        this.setState({ currentProductSKU: productSKU });

        const options = {
            isSingleProduct: true,
            args: { filter: this.getProductRequestFilter() }
        };

        requestProduct(options);
    }

    updateNavigationState() {
        const { changeNavigationState, device } = this.props;

        if (device.isMobile) {
            changeNavigationState({ name: MENU_TAB, isHidden: true });
        } else {
            changeNavigationState({ name: MENU_TAB });
        }
    }

    updateMeta() {
        const { updateMetaFromProduct } = this.props;
        updateMetaFromProduct(this.getDataSource());
    }

    updateHeaderState() {
        const { name = '' } = this.getDataSource();
        const { changeHeaderState, device } = this.props;
        const { isBottomSheetOpen } = this.state;

        const title = device.isMobile ? '' : name;

        const onBackClick = (device.isMobile && isBottomSheetOpen)
            ? () => this.setBottomSheetOpen(false)
            : () => history.back();

        changeHeaderState({
            name: PDP,
            title,
            onBackClick
        });
    }

    updateBreadcrumbs() {
        const { updateBreadcrumbs } = this.props;
        updateBreadcrumbs(this.getDataSource());
    }

    setBottomSheetOpen(open) {
        this.setState({
            isBottomSheetOpen: open
        });
    }

    closeBottomSheetOpen() {
        const { isBottomSheetOpen } = this.state;
        if (isBottomSheetOpen) {
            this.setBottomSheetOpen(false);
        }
    }

    freezeScrollOnMobile() {
        const { device } = this.props;
        if (device.isMobile) {
            document.body.classList.add('overscrollDisabled');
        } else {
            this.unFreezeScroll();
        }
    }

    unFreezeScroll() {
        if (document.body.classList.contains('overscrollDisabled')) {
            document.body.classList.remove('overscrollDisabled');
        }
    }

    resetProductQuantity() {
        const { setQuantity, quantity } = this.props;
        if (quantity !== 1) {
            setQuantity(1);
        }
    }

    render() {
        return (
            <ProductPage
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ProductPageContainer)
);
