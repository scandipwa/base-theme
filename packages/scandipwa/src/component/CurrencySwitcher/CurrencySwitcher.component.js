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
import { getCurrency } from 'Util/Currency';

import './CurrencySwitcher.style';

/** @namespace Component/CurrencySwitcher/Component */
export class CurrencySwitcher extends PureComponent {
    static propTypes = {
        currencyData: PropTypes.shape({
            available_currencies_data: PropTypes.arrayOf(
                PropTypes.objectOf(
                    PropTypes.string
                )
            ),
            current_currency_code: PropTypes.string
        }).isRequired,
        handleCurrencySelect: PropTypes.func.isRequired
    };

    getCurrencyValue() {
        const {
            currencyData: {
                available_currencies_data: availableCurrencies,
                current_currency_code: currentCurrencyCode
            } = {}
        } = this.props;

        // check whether user’s selected currency is among available currencies for current store,
        // otherwise use default currency for current store.
        const currency = getCurrency();

        return availableCurrencies.some((e) => e.id === currency) ? currency : currentCurrencyCode;
    }

    render() {
        const {
            handleCurrencySelect,
            currencyData: {
                available_currencies_data: availableCurrencies
            } = {}
        } = this.props;

        if (availableCurrencies && availableCurrencies.length > 1) {
            return (
                <div block="CurrencySwitcher">
                    <Field
                      id="CurrencySwitcherList"
                      name="CurrencySwitcherList"
                      type="select"
                      selectOptions={ availableCurrencies }
                      value={ this.getCurrencyValue() }
                      onChange={ handleCurrencySelect }
                    />
                    <span />
                </div>
            );
        }

        return null;
    }
}

export default CurrencySwitcher;
