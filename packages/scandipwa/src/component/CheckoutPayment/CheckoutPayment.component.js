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
import { paymentMethodType } from 'Type/Checkout';

import './CheckoutPayment.style';

/** @namespace Component/CheckoutPayment/Component */
export class CheckoutPayment extends PureComponent {
    static propTypes = {
        method: paymentMethodType.isRequired,
        onClick: PropTypes.func.isRequired,
        isSelected: PropTypes.bool
    };

    static defaultProps = {
        isSelected: false
    };

    onClick = () => {
        const {
            onClick,
            method
        } = this.props;

        onClick(method);
    };

    render() {
        const {
            isSelected,
            method: { title }
        } = this.props;

        // disable checkbox in order to skip direct clicks on checkbox and handle clicks on entire button instead
        return (
            <li block="CheckoutPayment">
                <button
                  block="CheckoutPayment"
                  mods={ { isSelected } }
                  elem="Button"
                  type="button"
                  onClick={ this.onClick }
                >
                    <Field
                      type="checkbox"
                      id={ `option-${ title }` }
                      name={ `option-${ title }` }
                      checked={ isSelected }
                      disabled
                    />
                    { title }
                </button>
            </li>
        );
    }
}

export default CheckoutPayment;
