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

import Field from 'Component/Field/Field.container';
import { shippingMethodType } from 'Type/Checkout';
import { formatPrice } from 'Util/Price';

import { DELIVERY_METHOD_UNAVAILABLE_MESSAGE } from './CheckoutDeliveryOption.config';

import './CheckoutDeliveryOption.style';

/** @namespace Component/CheckoutDeliveryOption/Component */
export class CheckoutDeliveryOption extends PureComponent {
    static propTypes = {
        option: shippingMethodType.isRequired,
        currency: PropTypes.string.isRequired,
        isSelected: PropTypes.bool,
        optionPrice: PropTypes.number,
        onOptionClick: PropTypes.func.isRequired
    };

    static defaultProps = {
        isSelected: false,
        optionPrice: 0
    };

    getOptionPrice() {
        const {
            currency,
            optionPrice
        } = this.props;

        return formatPrice(optionPrice, currency);
    }

    renderPrice() {
        const {
            option: {
                available
            } = {}
        } = this.props;

        if (!available) {
            return null;
        }

        return (
            <strong>
                { ` - ${ this.getOptionPrice() }` }
            </strong>
        );
    }

    renderRate() {
        const {
            option: {
                method_title,
                available
            } = {}
        } = this.props;

        if (!available) {
            return null;
        }

        return (
            <span>
                { __('Rate: ') }
                <strong>{ method_title }</strong>
            </span>
        );
    }

    renderAvailabilityMessage() {
        const {
            option: {
                available
            } = {}
        } = this.props;

        if (available) {
            return null;
        }

        return (
            <div
              block="CheckoutDeliveryOption"
              elem="Message"
            >
                { DELIVERY_METHOD_UNAVAILABLE_MESSAGE }
            </div>
        );
    }

    renderRow() {
        const {
            option: {
                carrier_title
            } = {}
        } = this.props;

        return (
            <div block="CheckoutDeliveryOption" elem="Row">
                <span>
                    { __('Carrier method: ') }
                    <strong>{ carrier_title }</strong>
                </span>
                <br />
                { this.renderRate() }
                { this.renderPrice() }
                { this.renderAvailabilityMessage() }
            </div>
        );
    }

    render() {
        const {
            option: {
                carrier_title,
                available
            } = {},
            onOptionClick,
            isSelected
        } = this.props;

        // disable checkbox in order to skip direct clicks on checkbox and handle clicks on entire button instead
        return (
            <li block="CheckoutDeliveryOption">
                <button
                  block="CheckoutDeliveryOption"
                  mods={ { isDisabled: !available } }
                  elem="Button"
                  type="button"
                  onClick={ onOptionClick }
                  disabled={ !available }
                >
                    <Field
                      type="checkbox"
                      id={ `option-${ carrier_title }` }
                      name={ `option-${ carrier_title }` }
                      checked={ isSelected }
                      disabled
                    />
                    { this.renderRow() }
                </button>
            </li>
        );
    }
}

export default CheckoutDeliveryOption;
