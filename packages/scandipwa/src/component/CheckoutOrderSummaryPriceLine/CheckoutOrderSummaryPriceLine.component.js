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

import { ChildrenType } from 'Type/Common';
import { formatPrice } from 'Util/Price';

/** @namespace Component/CheckoutOrderSummaryPriceLine/Component */
export class CheckoutOrderSummaryPriceLine extends PureComponent {
    static propTypes = {
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        currency: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        mods: PropTypes.object,
        subPrice: PropTypes.node,
        children: ChildrenType
    };

    static defaultProps = {
        mods: {},
        subPrice: null,
        children: []
    };

    renderPrice() {
        const { price, currency } = this.props;

        return formatPrice(price, currency);
    }

    renderSubPrice() {
        const { subPrice, currency } = this.props;

        if (!subPrice) {
            return null;
        }

        return (
            <span>
                { __('Excl. tax: %s', formatPrice(subPrice, currency)) }
            </span>
        );
    }

    render() {
        const {
            price,
            title,
            mods,
            children
        } = this.props;

        if (!price) {
            return null;
        }

        return (
            <li block="CheckoutOrderSummary" elem="SummaryItem" mods={ mods }>
                <p block="CheckoutOrderSummary" elem="Text">
                    { title }
                </p>
                <strong block="CheckoutOrderSummary" elem="Text">
                    { this.renderPrice() }
                    { this.renderSubPrice() }
                </strong>
                { children }
            </li>
        );
    }
}

export default CheckoutOrderSummaryPriceLine;
