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

import { MixType } from 'Type/Common';
import { formatPrice, roundPrice } from 'Util/Price';

/** @namespace Component/CartItemPrice/Component */
export class CartItemPrice extends PureComponent {
    static propTypes = {
        price: PropTypes.number.isRequired,
        subPrice: PropTypes.number.isRequired,
        currency_code: PropTypes.string.isRequired,
        mix: MixType.isRequired
    };

    renderPrice() {
        const { price, currency_code } = this.props;
        const value = roundPrice(price);

        return (
            <span aria-label={ __('Current product price') }>
                <data value={ value }>{ formatPrice(price, currency_code) }</data>
            </span>
        );
    }

    renderSubPrice() {
        const { subPrice, currency_code } = this.props;

        if (!subPrice) {
            return null;
        }

        return (
            <span
              aria-label={ __('Current product price excl. tax') }
              block="ProductPrice"
              elem="SubPrice"
            >
                { __('Excl. tax: %s', formatPrice(subPrice, currency_code)) }
            </span>
        );
    }

    render() {
        const { mix } = this.props;

        return (
            <p block="ProductPrice" aria-label={ __('Product Price') } mix={ mix }>
                { this.renderPrice() }
                { this.renderSubPrice() }
            </p>
        );
    }
}

export default CartItemPrice;
