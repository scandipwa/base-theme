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
import CheckoutOrderSummaryPriceLine from 'Component/CheckoutOrderSummaryPriceLine';
import ExpandableContent from 'Component/ExpandableContent';
import { BILLING_STEP } from 'Route/Checkout/Checkout.config';
import { ChildrenType } from 'Type/Common';
import { TotalsType } from 'Type/MiniCart';
import { getItemsCountLabel } from 'Util/Cart';

import './CheckoutOrderSummary.style';

/**
 * Checkout Order Summary component
 * @namespace Component/CheckoutOrderSummary/Component
 */
export class CheckoutOrderSummary extends PureComponent {
    static propTypes = {
        totals: TotalsType,
        checkoutStep: PropTypes.string,
        renderCmsBlock: PropTypes.func,
        isExpandable: PropTypes.bool,
        cartDisplayConfig: PropTypes.object.isRequired,
        cartShippingPrice: PropTypes.number,
        cartShippingSubPrice: PropTypes.number,
        cartSubtotal: PropTypes.number,
        cartSubtotalSubPrice: PropTypes.number,
        cartTotalSubPrice: PropTypes.number,
        showItems: PropTypes.bool,
        children: ChildrenType
    };

    static defaultProps = {
        totals: {},
        renderCmsBlock: () => {},
        isExpandable: false,
        cartShippingPrice: 0,
        cartShippingSubPrice: null,
        cartTotalSubPrice: null,
        cartSubtotal: null,
        cartSubtotalSubPrice: null,
        showItems: true,
        children: [],
        checkoutStep: null
    };

    renderPriceLine(price, title, mods) {
        if (!price) {
            return null;
        }

        const { totals: { quote_currency_code } } = this.props;

        return (
            <CheckoutOrderSummaryPriceLine
              price={ price }
              currency={ quote_currency_code }
              title={ title }
              mods={ mods }
            />
        );
    }

    renderItem = (item) => {
        const {
            totals: {
                quote_currency_code
            }
        } = this.props;

        const { item_id } = item;

        return (
            <CartItem
              key={ item_id }
              item={ item }
              currency_code={ quote_currency_code }
            />
        );
    };

    renderDiscount() {
        const {
            totals: {
                applied_rule_ids,
                discount_amount,
                coupon_code
            }
        } = this.props;

        if (!applied_rule_ids) {
            return null;
        }

        if (!coupon_code) {
            return this.renderPriceLine(
                -Math.abs(discount_amount),
                __('Discount')
            );
        }

        return this.renderPriceLine(
            -Math.abs(discount_amount),
            __('Coupon code discount')
        );
    }

    renderItems() {
        const { showItems, totals: { items_qty, items = [] } } = this.props;

        if (!showItems) {
            return null;
        }

        return (
            <>
            <div block="CheckoutOrderSummary" elem="ItemsInCart">
                { getItemsCountLabel(items_qty) }
            </div>
            <div block="CheckoutOrderSummary" elem="OrderItems">
                <div block="CheckoutOrderSummary" elem="CartItemList">
                    { items.map(this.renderItem) }
                </div>
            </div>
            </>
        );
    }

    renderHeading() {
        return (
            <div
              block="CheckoutOrderSummary"
              elem="Header"
              mix={ { block: 'CheckoutPage', elem: 'Heading', mods: { hasDivider: true } } }
            >
                <h2>{ __('Summary') }</h2>
            </div>
        );
    }

    renderSubTotal() {
        const {
            totals: { quote_currency_code },
            cartSubtotal,
            cartSubtotalSubPrice
        } = this.props;

        const title = __('Subtotal');

        if (cartSubtotal) {
            return (
                <CheckoutOrderSummaryPriceLine
                  price={ cartSubtotal }
                  currency={ quote_currency_code }
                  title={ title }
                  subPrice={ cartSubtotalSubPrice }
                />
            );
        }

        return this.renderPriceLine(cartSubtotal, title);
    }

    getShippingLabel() {
        const { checkoutStep } = this.props;

        if (checkoutStep === BILLING_STEP) {
            return __('Shipping');
        }

        return __('Estimated Shipping');
    }

    renderShipping() {
        const {
            totals: {
                quote_currency_code
            },
            cartShippingPrice,
            cartShippingSubPrice
        } = this.props;
        const title = this.getShippingLabel();
        const mods = { divider: true };

        if (!cartShippingSubPrice) {
            return this.renderPriceLine(cartShippingPrice, title, mods);
        }

        return (
            <CheckoutOrderSummaryPriceLine
              price={ cartShippingPrice }
              currency={ quote_currency_code }
              title={ title }
              mods={ mods }
              subPrice={ cartShippingSubPrice }
            />
        );
    }

    renderOrderTotal() {
        const {
            totals: {
                grand_total,
                quote_currency_code
            },
            cartTotalSubPrice
        } = this.props;
        const title = __('Order total');

        if (cartTotalSubPrice) {
            return (
                <CheckoutOrderSummaryPriceLine
                  price={ grand_total }
                  currency={ quote_currency_code }
                  title={ title }
                  subPrice={ cartTotalSubPrice }
                  mods={ { isTotal: true } }
                />
            );
        }

        return this.renderPriceLine(grand_total, title, { isTotal: true });
    }

    renderTaxFullSummary() {
        const {
            totals: {
                applied_taxes = []
            },
            cartDisplayConfig: {
                display_full_tax_summary
            } = {}
        } = this.props;

        if (!display_full_tax_summary || !applied_taxes.length) {
            return null;
        }

        return applied_taxes
            .map(({ rates }) => rates)
            .reduce((rates, rate) => rates.concat(rate), [])
            .map(({ percent, title }, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div block="CheckoutOrderSummary" elem="AppendedContent" key={ i }>
                    { `${title} (${percent}%)` }
                </div>
            ));
    }

    renderTax() {
        const {
            totals: {
                tax_amount = 0,
                quote_currency_code
            },
            cartDisplayConfig: {
                display_full_tax_summary,
                display_zero_tax_subtotal
            } = {}
        } = this.props;

        if (!quote_currency_code || (!tax_amount && !display_zero_tax_subtotal)) {
            return null;
        }

        return (
            <CheckoutOrderSummaryPriceLine
              price={ tax_amount.toFixed(2) } // since we display tax even if value is 0
              currency={ quote_currency_code }
              title={ __('Tax') }
              mods={ { withAppendedContent: display_full_tax_summary } }
            >
                { this.renderTaxFullSummary() }
            </CheckoutOrderSummaryPriceLine>
        );
    }

    renderTotals() {
        const { children, totals: { items = [] } } = this.props;

        return (
            <div block="CheckoutOrderSummary" elem="OrderTotals">
                <ul>
                    { this.renderSubTotal() }
                    { this.renderTax() }
                    { this.renderDiscount() }
                    { this.renderShipping() }
                    <div block="CheckoutOrderSummary" elem="ButtonWrapper" mods={ { isEmpty: items.length < 1 } }>
                        { this.renderOrderTotal() }
                        { children }
                    </div>
                </ul>
            </div>
        );
    }

    renderCmsBlock() {
        const { renderCmsBlock } = this.props;

        const content = renderCmsBlock();

        if (!content) {
            return null;
        }

        return (
            <div
              block="CheckoutOrderSummary"
              elem="CmsBlock"
            >
                { content }
            </div>
        );
    }

    renderExpandableContent() {
        return (
            <ExpandableContent
              heading={ __('Summary') }
              mix={ { block: 'CheckoutOrderSummary', elem: 'ExpandableContent' } }
            >
                { this.renderItems() }
                { this.renderCmsBlock() }
                { this.renderTotals() }
            </ExpandableContent>
        );
    }

    renderContent() {
        const { isExpandable } = this.props;

        if (isExpandable) {
            return this.renderExpandableContent();
        }

        return (
            <>
                { this.renderHeading() }
                { this.renderItems() }
                { this.renderTotals() }
            </>
        );
    }

    render() {
        return (
            <article block="CheckoutOrderSummary" aria-label="Order Summary">
                { this.renderContent() }
            </article>
        );
    }
}

export default CheckoutOrderSummary;
