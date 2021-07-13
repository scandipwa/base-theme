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

import Field from 'Component/Field';
import Loader from 'Component/Loader';

import './CartCoupon.style';

/** @namespace Component/CartCoupon/Component */
export class CartCoupon extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        couponCode: PropTypes.string,
        handleApplyCouponToCart: PropTypes.func.isRequired,
        handleRemoveCouponFromCart: PropTypes.func.isRequired,
        mix: PropTypes.object,
        title: PropTypes.string
    };

    static defaultProps = {
        couponCode: '',
        mix: {},
        title: ''
    };

    state = {
        enteredCouponCode: ''
    };

    handleCouponCodeChange = (enteredCouponCode) => {
        this.setState({
            enteredCouponCode
        });
    };

    handleApplyCoupon = () => {
        const { handleApplyCouponToCart } = this.props;
        const { enteredCouponCode } = this.state;

        handleApplyCouponToCart(enteredCouponCode);
    };

    handleRemoveCoupon = () => {
        const { handleRemoveCouponFromCart } = this.props;

        handleRemoveCouponFromCart();

        // We need to reset input field. If we do it in applyCouponCode,
        // then it will disappear if code is incorrect. We want to avoid it
        this.setState({
            enteredCouponCode: ''
        });
    };

    handleFormSubmit = (e) => {
        const { couponCode } = this.props;
        e.preventDefault();

        if (couponCode) {
            this.handleRemoveCoupon();

            return;
        }

        this.handleApplyCoupon();
    };

    renderApplyCoupon() {
        const { enteredCouponCode } = this.state;

        return (
            <>
                <Field
                  type="text"
                  id="couponCode"
                  name="couponCode"
                  value={ enteredCouponCode }
                  placeholder={ __('Your discount code') }
                  onChange={ this.handleCouponCodeChange }
                  mix={ { block: 'CartCoupon', elem: 'Input' } }
                  aria-label={ __('Your discount code') }
                />
                <button
                  block="CartCoupon"
                  elem="Button"
                  type="button"
                  mods={ { isHollow: true } }
                  disabled={ !enteredCouponCode }
                  onClick={ this.handleApplyCoupon }
                >
                    { __('Submit') }
                </button>
            </>
        );
    }

    renderRemoveCoupon() {
        const { couponCode } = this.props;

        return (
            <>
                <p block="CartCoupon" elem="Message">
                    { __('Applied coupon code: ') }
                    <strong>{ couponCode.toUpperCase() }</strong>
                </p>
                <button
                  block="CartCoupon"
                  elem="Button"
                  type="button"
                  mix={ { block: 'Button' } }
                  onClick={ this.handleRemoveCoupon }
                >
                    { __('Remove Coupon') }
                </button>
            </>
        );
    }

    renderTitle() {
        const { title } = this.props;

        if (!title) {
            return null;
        }

        return (
            <h3 block="CartCoupon" elem="Title">
                { title }
            </h3>
        );
    }

    render() {
        const { isLoading, couponCode, mix } = this.props;

        return (
            <form block="CartCoupon" onSubmit={ this.handleFormSubmit } mix={ mix }>
                <Loader isLoading={ isLoading } />
                { this.renderTitle() }
                { (couponCode
                    ? this.renderRemoveCoupon()
                    : this.renderApplyCoupon()
                ) }
            </form>
        );
    }
}

export default CartCoupon;
