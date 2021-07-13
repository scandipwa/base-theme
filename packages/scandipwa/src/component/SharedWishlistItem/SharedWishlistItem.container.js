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

import { connect } from 'react-redux';

import { WishlistItemContainer } from 'Component/WishlistItem/WishlistItem.container';
import { showNotification } from 'Store/Notification/Notification.action';

import SharedWishlistItem from './SharedWishlistItem.component';

export const CartDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Cart/Cart.dispatcher'
);

/** @namespace Component/SharedWishlistItem/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showNotification: (type, message) => dispatch(showNotification(type, message)),
    addProductToCart: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.addProductToCart(dispatch, options)
    )
});

/** @namespace Component/SharedWishlistItem/Container/sharedWishlistItemContainer */
export class SharedWishlistItemContainer extends WishlistItemContainer {
    state = {
        quantity: 1
    };

    _getConfigurableVariantIndex() {
        const { product: { wishlist: { sku }, variants } } = this.props;

        return +this.getConfigurableVariantIndex(sku, variants);
    }

    containerProps = () => {
        const { isLoading } = this.state;

        return {
            changeQuantity: this.changeQuantity,
            changeDescription: this.changeDescription,
            configurableVariantIndex: this._getConfigurableVariantIndex(),
            parameters: this.getAttributes(),
            isLoading
        };
    };

    changeQuantity = (quantity) => {
        this.setState({ quantity });
    };

    render() {
        return (
            <SharedWishlistItem
              { ...this.props }
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

/** @namespace Component/SharedWishlistItem/Container/mapStateToProps */
// eslint-disable-next-line no-unused-vars
export const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SharedWishlistItemContainer);
