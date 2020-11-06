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

import Link from 'Component/Link';

import './CheckoutSuccess.style';

/** @namespace Component/CheckoutSuccess/Component */
export class CheckoutSuccess extends PureComponent {
    static propTypes = {
        order_number: PropTypes.string.isRequired
    };

    renderButtons() {
        return (
            <div block="CheckoutSuccess" elem="ButtonWrapper">
                <Link
                  block="Button"
                  mix={ { block: 'CheckoutSuccess', elem: 'ContinueButton' } }
                  to="/"
                >
                    { __('Continue shopping') }
                </Link>
            </div>
        );
    }

    render() {
        const { order_number } = this.props;

        return (
            <div block="CheckoutSuccess">
                <h3>{ __('Your order # is: %s', order_number) }</h3>
                <p>{ __('We`ll email you an order confirmation with details and tracking info.') }</p>
                { this.renderButtons() }
            </div>
        );
    }
}

export default CheckoutSuccess;
