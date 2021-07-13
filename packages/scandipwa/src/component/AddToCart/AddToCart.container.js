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

import { IN_STOCK } from 'Component/ProductCard/ProductCard.config';
import { GRID_LAYOUT } from 'Route/CategoryPage/CategoryPage.config';
import { showNotification } from 'Store/Notification/Notification.action';
import { MixType } from 'Type/Common';
import { LayoutType } from 'Type/Layout';
import { ProductType } from 'Type/ProductList';
import { isSignedIn } from 'Util/Auth';
import {
    BUNDLE,
    CONFIGURABLE,
    DOWNLOADABLE,
    GROUPED
} from 'Util/Product';

import AddToCart from './AddToCart.component';

export const CartDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Cart/Cart.dispatcher'
);

export const WishlistDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Wishlist/Wishlist.dispatcher'
);

/** @namespace Component/AddToCart/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    wishlistItems: state.WishlistReducer.productsInWishlist
});

/** @namespace Component/AddToCart/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    addProduct: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.addProductToCart(dispatch, options)
    ),
    removeFromWishlist: (options) => WishlistDispatcher.then(
        ({ default: dispatcher }) => dispatcher.removeItemFromWishlist(dispatch, options)
    ),
    showNotification: (type, message) => dispatch(showNotification(type, message))
});

/* @namespace Component/AddToCart/Container */
export class AddToCartContainer extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        product: ProductType.isRequired,
        quantity: PropTypes.number,
        configurableVariantIndex: PropTypes.number,
        groupedProductQuantity: PropTypes.objectOf(PropTypes.number).isRequired,
        showNotification: PropTypes.func.isRequired,
        setQuantityToDefault: PropTypes.func,
        addProduct: PropTypes.func.isRequired,
        removeFromWishlist: PropTypes.func.isRequired,
        wishlistItems: PropTypes.objectOf(ProductType).isRequired,
        onProductValidationError: PropTypes.func,
        productOptionsData: PropTypes.object.isRequired,
        disableHandler: PropTypes.bool,
        mix: MixType,
        disabled: PropTypes.bool,
        layout: LayoutType
    };

    static defaultProps = {
        quantity: 1,
        configurableVariantIndex: 0,
        setQuantityToDefault: () => {},
        onProductValidationError: () => {},
        isLoading: false,
        disableHandler: false,
        mix: {},
        disabled: false,
        layout: GRID_LAYOUT
    };

    state = { isLoading: false };

    validationMap = {
        [CONFIGURABLE]: this.validateConfigurableProduct.bind(this),
        [GROUPED]: this.validateGroupedProduct.bind(this),
        [BUNDLE]: this.validateBundleProduct.bind(this),
        [DOWNLOADABLE]: this.validateDownloadableProduct.bind(this)
    };

    addToCartHandlerMap = {
        [CONFIGURABLE]: this.addConfigurableProductToCart.bind(this),
        [GROUPED]: this.addGroupedProductToCart.bind(this)
    };

    containerFunctions = {
        buttonClick: this.buttonClick.bind(this)
    };

    containerProps() {
        const {
            product,
            mix,
            disabled,
            layout
        } = this.props;
        const { isLoading } = this.state;

        return {
            isLoading,
            product,
            mix,
            disabled,
            layout
        };
    }

    validateConfigurableProduct() {
        const {
            configurableVariantIndex,
            showNotification,
            product: {
                variants = []
            }
        } = this.props;

        if (configurableVariantIndex < 0 || !variants[configurableVariantIndex]) {
            showNotification('info', __('Please, select product options!'));

            return false;
        }

        const { stock_status: configurableStock } = variants[configurableVariantIndex];

        if (configurableStock !== IN_STOCK) {
            showNotification('info', __('Sorry! The selected product option is out of stock!'));

            return false;
        }

        return true;
    }

    validateGroupedProduct() {
        const {
            groupedProductQuantity,
            showNotification,
            product: {
                items = []
            }
        } = this.props;

        const isAllItemsAvailable = items.some(({ product: { id } }) => groupedProductQuantity[id]);

        if (!isAllItemsAvailable) {
            showNotification('info', __('Please specify the quantity of product(s)!'));

            return false;
        }

        return true;
    }

    validateDownloadableProduct() {
        const {
            product: { links_purchased_separately },
            productOptionsData: { downloadableLinks = [] },
            showNotification
        } = this.props;

        if (links_purchased_separately && downloadableLinks.length === 0) {
            showNotification('info', __('Please, select product links!'));

            return false;
        }

        return true;
    }

    validateBundleProduct() {
        const {
            productOptionsData,
            showNotification
        } = this.props;

        const validateBundleOptions = this.validateCustomizableOptions(productOptionsData, true);

        if (!validateBundleOptions) {
            showNotification('info', __('Please, select required options!'));

            return false;
        }

        return true;
    }

    validateSimpleProduct() {
        const {
            productOptionsData,
            showNotification
        } = this.props;

        const validateCustomizableOptions = this.validateCustomizableOptions(productOptionsData);

        if (!validateCustomizableOptions) {
            showNotification('info', __('Please, select required options!'));

            return false;
        }

        return true;
    }

    validateCustomizableOptions(productOptionsData, isBundle = false) {
        const {
            requiredOptions = {}
        } = productOptionsData || {};

        if (requiredOptions.length) {
            const {
                productOptions,
                productOptionsMulti,
                requiredOptions
            } = productOptionsData;

            return this.validateProductOptions(
                [...productOptions || [], ...productOptionsMulti || []],
                requiredOptions,
                isBundle
            );
        }

        return true;
    }

    validateProductOptions(items, requiredOptions, isBundle = false) {
        // Make sure EVERY required option is FOUND in selected items
        return requiredOptions.every((requiredOption) => (
            items.find((item) => {
                const { id, option_id } = item;
                const matchWith = isBundle ? id : option_id;

                return requiredOption === matchWith;
            })
        ));
    }

    validateAddToCart() {
        const {
            product: { type_id }
        } = this.props;

        const validationRule = this.validationMap[type_id];

        if (validationRule) {
            return validationRule();
        }

        return this.validateSimpleProduct();
    }

    addGroupedProductToCart() {
        const {
            product,
            product: { items },
            groupedProductQuantity,
            addProduct
        } = this.props;

        Promise.all(items.map((item) => {
            const { product: groupedProductItem } = item;

            const newProduct = {
                ...groupedProductItem,
                parent: product
            };

            const quantity = groupedProductQuantity[groupedProductItem.id];

            if (!quantity) {
                return Promise.resolve();
            }

            return addProduct({
                product: newProduct,
                quantity
            });
        })).then(
            /** @namespace Component/AddToCart/Container/addGroupedProductToCartPromiseAllThen */
            () => this.afterAddToCart(),
            /** @namespace Component/AddToCart/Container/addGroupedProductToCartPromiseAllCatch */
            () => this.resetLoading()
        );
    }

    addConfigurableProductToCart() {
        const {
            product,
            quantity,
            addProduct,
            configurableVariantIndex,
            productOptionsData
        } = this.props;

        addProduct({
            product: {
                ...product,
                configurableVariantIndex
            },
            quantity,
            productOptionsData
        }).then(
            /** @namespace Component/AddToCart/Container/addConfigurableProductToCartAddProductThen */
            () => this.afterAddToCart(),
            /** @namespace Component/AddToCart/Container/addConfigurableProductToCartAddProductCatch */
            () => this.resetLoading()
        );
    }

    addSimpleProductToCart() {
        const {
            product,
            quantity,
            addProduct,
            productOptionsData
        } = this.props;

        addProduct({
            product,
            quantity,
            productOptionsData
        }).then(
            /** @namespace Component/AddToCart/Container/addSimpleProductToCartAddProductThen */
            () => this.afterAddToCart(),
            /** @namespace Component/AddToCart/Container/addSimpleProductToCartAddProductCatch */
            () => this.resetLoading()
        );
    }

    addProductToCart() {
        const {
            product: { type_id }
        } = this.props;

        const addToCartHandler = this.addToCartHandlerMap[type_id];

        if (addToCartHandler) {
            addToCartHandler();

            return;
        }

        this.addSimpleProductToCart();
    }

    buttonClick(e) {
        const {
            product: { type_id } = {},
            onProductValidationError,
            disableHandler
        } = this.props;

        if (disableHandler) {
            return;
        }

        if (!this.validateAddToCart()) {
            onProductValidationError(type_id);

            return;
        }

        e.preventDefault();

        this.setState({ isLoading: true }, () => this.addProductToCart());
    }

    resetLoading() {
        this.setState({ isLoading: false });
    }

    removeProductFromWishlist() {
        const {
            wishlistItems,
            removeFromWishlist,
            configurableVariantIndex,
            product: { type_id, variants = {} } = {}
        } = this.props;

        if (type_id !== CONFIGURABLE) {
            return;
        }

        const { sku } = variants[configurableVariantIndex];

        const wishlistItemKey = Object.keys(wishlistItems)
            .find((key) => {
                const { wishlist: { sku: wSku } } = wishlistItems[key];

                return wSku === sku;
            });

        if (!isSignedIn() || wishlistItemKey === undefined) {
            return;
        }

        const { wishlist: { id: item_id } } = wishlistItems[wishlistItemKey];
        removeFromWishlist({ item_id, sku, noMessage: true });
    }

    afterAddToCart() {
        const {
            showNotification,
            setQuantityToDefault
        } = this.props;

        showNotification('success', __('Product added to cart!'));
        setQuantityToDefault();

        this.removeProductFromWishlist();
        this.setState({ isLoading: false });
    }

    render() {
        return (
            <AddToCart
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddToCartContainer);
