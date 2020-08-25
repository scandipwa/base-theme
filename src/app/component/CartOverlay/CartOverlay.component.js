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

import './CartOverlay.style';

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import CartItem from 'Component/CartItem';
import CmsBlock from 'Component/CmsBlock';
import { CART_OVERLAY } from 'Component/Header/Header.config';
import Link from 'Component/Link';
import Overlay from 'Component/Overlay';
import { TotalsType } from 'Type/MiniCart';
import isMobile from 'Util/Mobile';
import { formatCurrency } from 'Util/Price';

export class CartOverlay extends PureComponent {
    static propTypes = {
        totals: TotalsType.isRequired,
        changeHeaderState: PropTypes.func.isRequired,
        isEditing: PropTypes.bool.isRequired,
        handleCheckoutClick: PropTypes.func.isRequired,
        currencyCode: PropTypes.string.isRequired,
        showOverlay: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { showOverlay } = this.props;

        if (!isMobile.any()) {
            showOverlay(CART_OVERLAY);
        }
    }

    renderPriceLine(price) {
        const { currencyCode } = this.props;
        return `${parseFloat(price).toFixed(2)}${formatCurrency(currencyCode)}`;
    }

    renderCartItems() {
        const { totals: { items, quote_currency_code } } = this.props;

        if (!items || items.length < 1) {
            return this.renderNoCartItems();
        }

        return (
            <ul block="CartOverlay" elem="Items" aria-label="List of items in cart">
                { items.map((item) => (
                    <CartItem
                      key={ item.item_id }
                      item={ item }
                      currency_code={ quote_currency_code }
                      isEditing
                    />
                )) }
            </ul>
        );
    }

    renderNoCartItems() {
        return (
            <p block="CartOverlay" elem="Empty">
                { __('There are no products in cart.') }
            </p>
        );
    }

    renderTotals() {
        const { totals: { subtotal_incl_tax = 0 } } = this.props;

        return (
            <dl
              block="CartOverlay"
              elem="Total"
            >
                <dt>{ __('Order total:') }</dt>
                <dd>{ this.renderPriceLine(subtotal_incl_tax) }</dd>
            </dl>
        );
    }

    renderTax() {
        const { totals: { tax_amount = 0 } } = this.props;

        return (
            <dl
              block="CartOverlay"
              elem="Tax"
            >
                <dt>{ __('Tax total:') }</dt>
                <dd>{ this.renderPriceLine(tax_amount || 0) }</dd>
            </dl>
        );
    }

    renderDiscount() {
        const { totals: { coupon_code, discount_amount = 0 } } = this.props;

        if (!coupon_code) {
            return null;
        }

        return (
            <dl
              block="CartOverlay"
              elem="Discount"
            >
                <dt>
                    { __('Coupon ') }
                    <strong block="CartOverlay" elem="DiscountCoupon">{ coupon_code.toUpperCase() }</strong>
                </dt>
                <dd>{ `-${this.renderPriceLine(Math.abs(discount_amount))}` }</dd>
            </dl>
        );
    }

    renderActions() {
        const { totals: { items }, handleCheckoutClick } = this.props;

        const options = !items || items.length < 1
            ? {
                onClick: (e) => e.preventDefault(),
                disabled: true
            }
            : {};

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

    render() {
        const { changeHeaderState } = this.props;

        return (
            <Overlay
              id={ CART_OVERLAY }
              onVisible={ changeHeaderState }
              mix={ { block: 'CartOverlay' } }
            >
                { this.renderPromo() }
                { this.renderCartItems() }
                { this.renderDiscount() }
                { this.renderTax() }
                { this.renderTotals() }
                { this.renderActions() }
            </Overlay>
        );
    }
}

export default CartOverlay;
