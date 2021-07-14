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

import CartItem from 'Component/CartItem';
import CmsBlock from 'Component/CmsBlock';
import { CART_OVERLAY } from 'Component/Header/Header.config';
import Link from 'Component/Link';
import Overlay from 'Component/Overlay';
import { OVERLAY_PLACEHOLDER } from 'Component/PopupSuspense/PopupSuspense.config';
import { DeviceType } from 'Type/Device';
import { TotalsType } from 'Type/MiniCart';
import { formatPrice } from 'Util/Price';

import './CartOverlay.style';

/** @namespace Component/CartOverlay/Component */
export class CartOverlay extends PureComponent {
    static propTypes = {
        totals: TotalsType.isRequired,
        device: DeviceType.isRequired,
        changeHeaderState: PropTypes.func.isRequired,
        isEditing: PropTypes.bool.isRequired,
        handleCheckoutClick: PropTypes.func.isRequired,
        currencyCode: PropTypes.string.isRequired,
        showOverlay: PropTypes.func.isRequired,
        activeOverlay: PropTypes.string.isRequired,
        hasOutOfStockProductsInCart: PropTypes.bool,
        cartTotalSubPrice: PropTypes.number,
        cartShippingPrice: PropTypes.number,
        cartShippingSubPrice: PropTypes.number,
        cartDisplaySettings: PropTypes.object.isRequired
    };

    static defaultProps = {
        hasOutOfStockProductsInCart: false,
        cartTotalSubPrice: null,
        cartShippingPrice: 0,
        cartShippingSubPrice: null
    };

    componentDidMount() {
        const { showOverlay, device, activeOverlay } = this.props;

        if (!device.isMobile && activeOverlay === OVERLAY_PLACEHOLDER) {
            showOverlay(CART_OVERLAY);
        }
    }

    renderPriceLine(price) {
        const { currencyCode } = this.props;

        return formatPrice(price, currencyCode);
    }

    renderCartItems() {
        const { totals: { items = [], quote_currency_code } } = this.props;

        if (items.length < 1) {
            return this.renderNoCartItems();
        }

        return (
            <div block="CartOverlay" elem="Items" aria-label="List of items in cart">
                { items.map((item) => (
                    <CartItem
                      key={ item.item_id }
                      item={ item }
                      currency_code={ quote_currency_code }
                      isCartOverlay
                    />
                )) }
            </div>
        );
    }

    renderNoCartItems() {
        return (
            <p block="CartOverlay" elem="Empty">
                { __('You have no items in your shopping cart.') }
            </p>
        );
    }

    renderOrderTotalExlTax() {
        const { cartTotalSubPrice } = this.props;

        if (!cartTotalSubPrice) {
            return null;
        }

        return (
            <span>
                { __('Excl. tax: %s', this.renderPriceLine(cartTotalSubPrice)) }
            </span>
        );
    }

    renderTotals() {
        const { totals: { grand_total = 0 } } = this.props;

        return (
            <dl
              block="CartOverlay"
              elem="Total"
            >
                <dt>{ __('Order total:') }</dt>
                <dd>
                    { this.renderPriceLine(grand_total) }
                    { this.renderOrderTotalExlTax() }
                </dd>
            </dl>
        );
    }

    renderTax() {
        const {
            totals: {
                tax_amount = 0
            } = {},
            cartDisplaySettings: {
                display_zero_tax_subtotal
            } = {}
        } = this.props;

        if (!tax_amount && !display_zero_tax_subtotal) {
            return null;
        }

        return (
            <dl
              block="CartOverlay"
              elem="Tax"
            >
                <dt>{ __('Tax total:') }</dt>
                <dd>{ this.renderPriceLine(tax_amount) }</dd>
            </dl>
        );
    }

    renderCouponCode = (code) => (
        <strong block="CartOverlay" elem="DiscountCoupon">{ code }</strong>
    );

    renderDiscount() {
        const {
            totals: {
                applied_rule_ids,
                discount_amount,
                coupon_code
            }
        } = this.props;

        if (!applied_rule_ids || !discount_amount) {
            return null;
        }

        const label = coupon_code ? __('Coupon code discount: ') : __('Discount: ');

        return (
            <dl
              block="CartOverlay"
              elem="Discount"
            >
                <dt>{ label }</dt>
                <dd>{ `-${this.renderPriceLine(Math.abs(discount_amount))}` }</dd>
            </dl>
        );
    }

    renderSecureCheckoutButton() {
        const { handleCheckoutClick, hasOutOfStockProductsInCart } = this.props;

        const options = hasOutOfStockProductsInCart
            ? {
                onClick: (e) => e.preventDefault(),
                disabled: true
            }
            : {};

        return (
            <button
              block="CartOverlay"
              elem="CheckoutButton"
              mix={ { block: 'Button' } }
              onClick={ handleCheckoutClick }
              { ...options }
            >
                <span />
                { __('Secure checkout') }
            </button>
        );
    }

    renderActions() {
        return (
            <div block="CartOverlay" elem="Actions">
                <Link
                  block="CartOverlay"
                  elem="CartButton"
                  mix={ { block: 'Button', mods: { isHollow: true } } }
                  to="/cart"
                >
                    { __('View cart') }
                </Link>
                { this.renderSecureCheckoutButton() }
            </div>
        );
    }

    renderCartAdditional() {
        const { totals: { items = [] } } = this.props;

        if (items.length < 1) {
            return null;
        }

        return (
            <div block="CartOverlay" elem="Additional">
                { this.renderDiscount() }
                { this.renderTax() }
                { this.renderTotals() }
                { this.renderOutOfStockProductsWarning() }
                { this.renderActions() }
            </div>
        );
    }

    renderPromo() {
        const { minicart_content: { minicart_cms } = {} } = window.contentConfiguration;

        if (minicart_cms) {
            return <CmsBlock identifier={ minicart_cms } />;
        }

        return (
            <p
              block="CartOverlay"
              elem="Promo"
            >
                { __('Free shipping on order 49$ and more.') }
            </p>
        );
    }

    renderOutOfStockProductsWarning() {
        const { hasOutOfStockProductsInCart } = this.props;

        if (!hasOutOfStockProductsInCart) {
            return null;
        }

        return (
            <div block="CartOverlay" elem="OutOfStockProductsWarning">
                { __('Please, remove out of stock products from cart') }
            </div>
        );
    }

    render() {
        const { changeHeaderState } = this.props;

        return (
            <Overlay
              id={ CART_OVERLAY }
              onVisible={ changeHeaderState }
              mix={ { block: 'CartOverlay' } }
            >
                { this.renderPromo() }
                <div block="CartOverlay" elem="ContentWrapper">
                    { this.renderCartItems() }
                    { this.renderCartAdditional() }
                </div>
            </Overlay>
        );
    }
}

export default CartOverlay;
