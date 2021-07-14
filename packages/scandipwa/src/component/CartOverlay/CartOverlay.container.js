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

import { CART_EDITING, CART_OVERLAY } from 'Component/Header/Header.config';
import { CUSTOMER_ACCOUNT_OVERLAY_KEY } from 'Component/MyAccountOverlay/MyAccountOverlay.config';
import { CHECKOUT_URL } from 'Route/Checkout/Checkout.config';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { showNotification } from 'Store/Notification/Notification.action';
import { hideActiveOverlay, toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import { TotalsType } from 'Type/MiniCart';
import { isSignedIn } from 'Util/Auth';
import {
    getCartShippingPrice,
    getCartShippingSubPrice,
    getCartTotalSubPrice,
    hasOutOfStockProductsInCartItems
} from 'Util/Cart';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import CartOverlay from './CartOverlay.component';

export const CartDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Cart/Cart.dispatcher'
);

/** @namespace Component/CartOverlay/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    totals: state.CartReducer.cartTotals,
    device: state.ConfigReducer.device,
    guest_checkout: state.ConfigReducer.guest_checkout,
    currencyCode: state.CartReducer.cartTotals.quote_currency_code,
    activeOverlay: state.OverlayReducer.activeOverlay,
    cartTotalSubPrice: getCartTotalSubPrice(state),
    cartShippingPrice: getCartShippingPrice(state),
    cartShippingSubPrice: getCartShippingSubPrice(state),
    cartDisplaySettings: state.ConfigReducer.cartDisplayConfig
});

/** @namespace Component/CartOverlay/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    setNavigationState: (stateName) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, stateName)),
    changeHeaderState: (state) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    updateTotals: (options) => CartDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateTotals(dispatch, options)
    ),
    showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
    showNotification: (type, message) => dispatch(showNotification(type, message)),
    hideActiveOverlay: () => dispatch(hideActiveOverlay())
});

/** @namespace Component/CartOverlay/Container */
export class CartOverlayContainer extends PureComponent {
    static propTypes = {
        totals: TotalsType.isRequired,
        guest_checkout: PropTypes.bool,
        changeHeaderState: PropTypes.func.isRequired,
        showOverlay: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
        setNavigationState: PropTypes.func.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired
    };

    static defaultProps = {
        guest_checkout: true
    };

    state = { isEditing: false };

    containerFunctions = {
        changeHeaderState: this.changeHeaderState.bind(this),
        handleCheckoutClick: this.handleCheckoutClick.bind(this)
    };

    containerProps = () => {
        const { totals } = this.props;

        return {
            hasOutOfStockProductsInCart: hasOutOfStockProductsInCartItems(totals.items)
        };
    };

    handleCheckoutClick(e) {
        const {
            guest_checkout,
            showOverlay,
            showNotification,
            setNavigationState,
            hideActiveOverlay,
            totals
        } = this.props;

        // to prevent outside-click handler trigger
        e.nativeEvent.stopImmediatePropagation();

        const hasOutOfStockProductsInCart = hasOutOfStockProductsInCartItems(totals.items);

        if (hasOutOfStockProductsInCart) {
            showNotification('error', __('Cannot proceed to checkout. Remove out of stock products first.'));
            return;
        }

        // Guest checkout enabled or user is signed in => proceed to the checkout
        if (guest_checkout || isSignedIn()) {
            hideActiveOverlay();
            history.push({ pathname: appendWithStoreCode(CHECKOUT_URL) });
            window.scrollTo({ top: 0 });
            return;
        }

        // there is no mobile, as cart overlay is not visible here
        showOverlay(CUSTOMER_ACCOUNT_OVERLAY_KEY);
        showNotification('info', __('Please sign-in to complete checkout!'));
        setNavigationState({ name: CUSTOMER_ACCOUNT_OVERLAY_KEY, title: 'Sign in' });
    }

    changeHeaderState() {
        const {
            changeHeaderState,
            totals: { count = 0 }
        } = this.props;
        const title = __('%s Items', count || 0);

        changeHeaderState({
            name: CART_OVERLAY,
            title,
            onEditClick: () => {
                this.setState({ isEditing: true });
                changeHeaderState({
                    name: CART_EDITING,
                    title,
                    onOkClick: () => this.setState({ isEditing: false }),
                    onCancelClick: () => this.setState({ isEditing: false })
                });
            },
            onCloseClick: () => this.setState({ isEditing: false })
        });
    }

    render() {
        return (
            <CartOverlay
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CartOverlayContainer);
