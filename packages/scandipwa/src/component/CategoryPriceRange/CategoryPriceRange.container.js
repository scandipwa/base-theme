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
import { withRouter } from 'react-router';

import { HistoryType } from 'Type/Common';
import { LocationType } from 'Type/Router';
import { getQueryParam, setQueryParams } from 'Util/Url';

import CategoryPriceRange from './CategoryPriceRange.component';

/** @namespace Component/CategoryPriceRange/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    minPriceValue: state.ProductListInfoReducer.minPrice,
    maxPriceValue: state.ProductListInfoReducer.maxPrice
});

/** @namespace Component/CategoryPriceRange/Container */
export class CategoryPriceRangeContainer extends PureComponent {
    static propTypes = {
        minPriceValue: PropTypes.number.isRequired,
        maxPriceValue: PropTypes.number.isRequired,
        priceValue: PropTypes.shape({
            min: PropTypes.number,
            max: PropTypes.number
        }).isRequired,
        updatePriceRange: PropTypes.func.isRequired,
        history: HistoryType.isRequired,
        location: LocationType.isRequired
    };

    config = {
        defaultPriceRange: { min: 0, max: 300 }
    };

    static propTypes = {
        // TODO: implement prop-types
    };

    containerFunctions = {
        updatePriceRange: this.updatePriceRange.bind(this)
    };

    containerProps = () => ({
        priceValue: this._getPriceRangeValue()
    });

    _getPriceRangeValue() {
        const { minPriceValue, maxPriceValue } = this.props;
        const { defaultPriceRange: { min: defaultMin, max: defaultMax } } = this.config;
        const { min, max } = this._getPriceRangeFromUrl();

        return { min: min || minPriceValue || defaultMin, max: max || maxPriceValue || defaultMax };
    }

    _getPriceRangeFromUrl() {
        const { location } = this.props;
        const min = +getQueryParam('priceMin', location);
        const max = +getQueryParam('priceMax', location);

        return { min, max };
    }

    updatePriceRange(priceRange) {
        const { location, history } = this.props;

        setQueryParams({
            priceMax: priceRange.max,
            priceMin: priceRange.min,
            page: ''
        }, location, history);
    }

    render() {
        return (
            <CategoryPriceRange
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

/** @namespace Component/CategoryPriceRange/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CategoryPriceRangeContainer)
);
