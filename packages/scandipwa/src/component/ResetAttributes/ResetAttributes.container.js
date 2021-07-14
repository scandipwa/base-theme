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
import { connect } from 'react-redux';

import { getPriceFilterLabel } from 'Util/Category';

import ResetAttributes from './ResetAttributes.component';

/** @namespace Component/ResetAttributes/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    currency_code: state.ConfigReducer.currencyData.current_currency_code
});

/** @namespace Component/ResetAttributes/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

/** @namespace Component/ResetAttributes/Container */
export class ResetAttributesContainer extends PureComponent {
    static propTypes = {
        availableFilters: PropTypes.objectOf(PropTypes.shape({
            attribute_label: PropTypes.any,
            attribute_type: PropTypes.string.isRequired,
            attribute_code: PropTypes.any,
            attribute_values: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
            attribute_options: PropTypes.objectOf(PropTypes.shape({
                label: PropTypes.string.isRequired,
                value_string: PropTypes.string.isRequired
            }))
        }).isRequired).isRequired,
        customFiltersValues: PropTypes.any.isRequired,
        currency_code: PropTypes.string.isRequired
    };

    containerProps = () => ({
        filtersData: this.filterResetItems()
    });

    containerFunctions = () => ({
        resetFilters: this.resetFilters
    });

    getFilterOptionsForPrice = (options) => options.map((option) => {
        const { currency_code } = this.props;

        const [from, to] = option.split('_');
        const label = getPriceFilterLabel(from, to, currency_code);

        return { value_string: option, label };
    });

    getFilterOptionsDefault = (values, options) => options.filter((option) => values.includes(option.value_string));

    getResetData = (attrCode, attrValue) => {
        const { availableFilters } = this.props;
        const filterData = availableFilters[attrCode];

        if (!filterData) {
            return {};
        }

        const { attribute_label, attribute_options, attribute_code } = filterData;

        const func = attribute_code === 'price' ? this.getFilterOptionsForPrice : this.getFilterOptionsDefault;

        return {
            [attribute_label]: func(attrValue, Object.values(attribute_options)).map(
                (option) => ({ ...option, attribute_code, attribute_label })
            )
        };
    };

    filterResetItems() {
        const { customFiltersValues } = this.props;

        return Object.entries(customFiltersValues).reduce(
            (prev, [attrCode, attrValues]) => (
                {
                    ...prev,
                    ...this.getResetData(attrCode, attrValues)
                }
            ), {}
        );
    }

    render() {
        return (
            <ResetAttributes
              { ...this.props }
              { ...this.containerProps() }
              { ...this.containerFunctions() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetAttributesContainer);
