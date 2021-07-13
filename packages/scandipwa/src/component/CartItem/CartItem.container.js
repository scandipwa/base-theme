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
import SwipeToDelete from 'Component/SwipeToDelete';
import { showNotification } from 'Store/Notification/Notification.action';
import { DeviceType } from 'Type/Device';
import { CartItemType } from 'Type/MiniCart';
import { itemIsOutOfStock } from 'Util/Cart';
import { CONFIGURABLE } from 'Util/Product';
import { makeCancelable } from 'Util/Promise';
import { objectToUri } from 'Util/Url';

import CartItem from './CartItem.component';

export const CartDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Cart/Cart.dispatcher'
);

/** @namespace Component/CartItem/Container/mapStateToProps */
// eslint-disable-next-line no-unused-vars
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device
});

/** @namespace Component/CartItem/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    addProduct: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.addProductToCart(dispatch, options)
    ),
    changeItemQty: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.changeItemQty(dispatch, options)
    ),
    removeProduct: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.removeProductFromCart(dispatch, options)
    ),
    updateCrossSellProducts: (items) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateCrossSellProducts(items, dispatch)
    ),
    showNotification: (type, title, error) => dispatch(showNotification(type, title, error))
});

/** @namespace Component/CartItem/Container */
export class CartItemContainer extends PureComponent {
    static propTypes = {
        item: CartItemType.isRequired,
        currency_code: PropTypes.string.isRequired,
        changeItemQty: PropTypes.func.isRequired,
        removeProduct: PropTypes.func.isRequired,
        updateCrossSellProducts: PropTypes.func.isRequired,
        updateCrossSellsOnRemove: PropTypes.bool,
        device: DeviceType.isRequired,
        isCartOverlay: PropTypes.bool
    };

    static defaultProps = {
        updateCrossSellsOnRemove: false,
        isCartOverlay: false
    };

    state = { isLoading: false };

    handlers = [];

    setStateNotLoading = this.setStateNotLoading.bind(this);

    containerFunctions = {
        handleChangeQuantity: this.handleChangeQuantity.bind(this),
        handleRemoveItem: this.handleRemoveItem.bind(this),
        getCurrentProduct: this.getCurrentProduct.bind(this),
        getProductVariant: this.getProductVariant.bind(this)
    };

    componentWillUnmount() {
        if (this.handlers.length) {
            [].forEach.call(this.handlers, (cancelablePromise) => cancelablePromise.cancel());
        }
    }

    productIsInStock() {
        const { item } = this.props;

        return !itemIsOutOfStock(item);
    }

    /**
     * @returns {Product}
     */
    getCurrentProduct() {
        const { item: { product } } = this.props;
        const variantIndex = this._getVariantIndex();

        return variantIndex < 0
            ? product
            : product.variants[variantIndex];
    }

    getMinQuantity() {
        const { stock_item: { min_sale_qty } = {} } = this.getCurrentProduct() || {};

        return min_sale_qty || 1;
    }

    getMaxQuantity() {
        const { stock_item: { max_sale_qty } = {} } = this.getCurrentProduct() || {};

        return max_sale_qty || DEFAULT_MAX_PRODUCTS;
    }

    setStateNotLoading() {
        this.setState({ isLoading: false });
    }

    containerProps = () => ({
        linkTo: this._getProductLinkTo(),
        thumbnail: this._getProductThumbnail(),
        minSaleQuantity: this.getMinQuantity(),
        maxSaleQuantity: this.getMaxQuantity(),
        isProductInStock: this.productIsInStock(),
        optionsLabels: this.getConfigurableOptionsLabels(),
        isMobileLayout: this.getIsMobileLayout()
    });

    /**
     * Handle item quantity change. Check that value is <1
     * @param {Number} value new quantity
     * @return {void}
     */
    handleChangeQuantity(quantity) {
        this.setState({ isLoading: true }, () => {
            const { changeItemQty, item: { item_id, sku } } = this.props;
            this.hideLoaderAfterPromise(changeItemQty({ item_id, quantity, sku }));
        });
    }

    /**
     * @return {void}
     */
    handleRemoveItem(e) {
        if (e) {
            e.preventDefault();
        }

        this.setState({ isLoading: true }, () => {
            this.hideLoaderAfterPromise(this.removeProductAndUpdateCrossSell());
        });
    }

    getIsMobileLayout() {
        // "isMobileLayout" check is required to render mobile content in some additional cases
        // where screen width exceeds 810px (e.g. CartOverlay)
        const { device, isCartOverlay } = this.props;

        return device.isMobile || isCartOverlay;
    }

    async removeProductAndUpdateCrossSell() {
        const {
            removeProduct,
            updateCrossSellProducts,
            updateCrossSellsOnRemove,
            item: { item_id }
        } = this.props;

        const result = await removeProduct(item_id);

        if (result && updateCrossSellsOnRemove) {
            await updateCrossSellProducts(result.items);
        }

        return result;
    }

    /**
     * @param {Promise}
     * @returns {cancelablePromise}
     */
    registerCancelablePromise(promise) {
        const cancelablePromise = makeCancelable(promise);
        this.handlers.push(cancelablePromise);

        return cancelablePromise;
    }

    /**
     * @param {Promise} promise
     * @returns {void}
     */
    hideLoaderAfterPromise(promise) {
        this.registerCancelablePromise(promise)
            .promise.then(this.setStateNotLoading, this.setStateNotLoading);
    }

    getProductVariant() {
        const {
            item: {
                product: {
                    variants = []
                }
            }
        } = this.props;

        return variants[this._getVariantIndex()];
    }

    /**
     * @returns {Int}
     */
    _getVariantIndex() {
        const {
            item: {
                sku: itemSku,
                product: { variants = [] } = {}
            }
        } = this.props;

        return variants.findIndex(({ sku }) => sku === itemSku || itemSku.includes(sku));
    }

    /**
     * Get link to product page
     * @param url_key Url to product
     * @return {{pathname: String, state Object}} Pathname and product state
     */
    _getProductLinkTo() {
        const {
            item: {
                product,
                product: {
                    type_id,
                    configurable_options,
                    parent,
                    url
                } = {}
            } = {}
        } = this.props;

        if (type_id !== CONFIGURABLE) {
            return {
                pathname: url,
                state: { product }
            };
        }

        const variant = this.getProductVariant();
        if (!variant) {
            return {};
        }
        const { attributes } = variant;

        const parameters = Object.entries(attributes).reduce(
            (parameters, [code, { attribute_value }]) => {
                if (Object.keys(configurable_options).includes(code)) {
                    return { ...parameters, [code]: attribute_value };
                }

                return parameters;
            }, {}
        );

        const stateProduct = parent || product;

        return {
            pathname: url,
            state: { product: stateProduct },
            search: objectToUri(parameters)
        };
    }

    _getProductThumbnail() {
        const product = this.getCurrentProduct();
        const { thumbnail: { url: thumbnail } = {} } = product;

        return thumbnail || '';
    }

    getConfigurationOptionLabel = ([key, attribute]) => {
        const {
            item: {
                product: {
                    configurable_options = {}
                }
            }
        } = this.props;

        const { attribute_code, attribute_value } = attribute;

        if (!Object.keys(configurable_options).includes(key) || attribute_value === null) {
            return null;
        }

        const {
            [attribute_code]: { // configurable option attribute
                attribute_options: {
                    [attribute_value]: { // attribute option value label
                        label
                    }
                }
            }
        } = configurable_options;

        return label;
    };

    getConfigurableOptionsLabels() {
        const {
            item: {
                product: {
                    configurable_options,
                    variants
                }
            }
        } = this.props;

        if (!variants || !configurable_options) {
            return [];
        }

        const { attributes = [] } = this.getCurrentProduct() || {};

        return Object.entries(attributes).map(this.getConfigurationOptionLabel).filter((label) => label);
    }

    renderRightSideContent = () => {
        const { handleRemoveItem } = this.containerFunctions;

        return (
            <button
              block="CartItem"
              elem="SwipeToDeleteRightSide"
              onClick={ handleRemoveItem }
              aria-label={ __('Remove') }
            >
                { __('Delete') }
            </button>
        );
    };

    render() {
        const { isLoading } = this.state;

        return (
            <SwipeToDelete
              renderRightSideContent={ this.renderRightSideContent }
              onAheadOfDragItemRemoveThreshold={ this.containerFunctions.handleRemoveItem }
              isLoading={ isLoading }
            >
                <CartItem
                  { ...this.props }
                  { ...this.state }
                  { ...this.containerFunctions }
                  { ...this.containerProps() }
                />
            </SwipeToDelete>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CartItemContainer);
