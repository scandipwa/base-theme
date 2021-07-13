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

import { FILTER } from 'Component/Header/Header.config';
import { changeNavigationState, goToPreviousNavigationState } from 'Store/Navigation/Navigation.action';
import { BOTTOM_NAVIGATION_TYPE, TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { hideActiveOverlay } from 'Store/Overlay/Overlay.action';
import { HistoryType, LocationType } from 'Type/Common';
import { getQueryParam, setQueryParams } from 'Util/Url';

import CategoryFilterOverlay from './CategoryFilterOverlay.component';

/** @namespace Component/CategoryFilterOverlay/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isInfoLoading: state.ProductListInfoReducer.isLoading,
    isProductsLoading: state.ProductListReducer.isLoading,
    totalPages: state.ProductListReducer.totalPages
});

/** @namespace Component/CategoryFilterOverlay/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    hideActiveOverlay: () => dispatch(hideActiveOverlay()),
    goToPreviousHeaderState: () => dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
    goToPreviousNavigationState: () => dispatch(goToPreviousNavigationState(BOTTOM_NAVIGATION_TYPE)),
    changeHeaderState: (state) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    changeNavigationState: (state) => dispatch(changeNavigationState(BOTTOM_NAVIGATION_TYPE, state))
});

/** @namespace Component/CategoryFilterOverlay/Container */
export class CategoryFilterOverlayContainer extends PureComponent {
    static propTypes = {
        history: HistoryType.isRequired,
        location: LocationType.isRequired,
        customFiltersValues: PropTypes.objectOf(PropTypes.array).isRequired,
        hideActiveOverlay: PropTypes.func.isRequired,
        goToPreviousHeaderState: PropTypes.func.isRequired,
        goToPreviousNavigationState: PropTypes.func.isRequired,
        changeHeaderState: PropTypes.func.isRequired,
        changeNavigationState: PropTypes.func.isRequired,
        availableFilters: PropTypes.objectOf(PropTypes.shape).isRequired,
        isInfoLoading: PropTypes.bool.isRequired
    };

    containerFunctions = {
        onSeeResultsClick: this.onSeeResultsClick.bind(this),
        toggleCustomFilter: this.toggleCustomFilter.bind(this),
        getFilterUrl: this.getCustomFilterUrl.bind(this),
        onVisible: this.onVisible.bind(this),
        onHide: this.onHide.bind(this)
    };

    updateFilter(filterName, filterArray) {
        const { location, history } = this.props;

        setQueryParams({
            customFilters: this.getFilterUrl(filterName, filterArray, false),
            page: ''
        }, location, history);
    }

    toggleCustomFilter(requestVar, value) {
        this.updateFilter(requestVar, this._getNewFilterArray(requestVar, value));
    }

    getFilterUrl(filterName, filterArray, isFull = true) {
        const { location: { pathname } } = this.props;
        const selectedFilters = this._getNewSelectedFiltersString(filterName, filterArray);
        const customFilters = isFull ? `${pathname}?customFilters=` : '';
        const formattedFilters = this._formatSelectedFiltersString(selectedFilters);

        return `${ customFilters }${ formattedFilters }`;
    }

    getCustomFilterUrl(filterKey, value) {
        return this.getFilterUrl(filterKey, this._getNewFilterArray(filterKey, value));
    }

    _getSelectedFiltersFromUrl() {
        const { location } = this.props;
        const selectedFiltersString = (getQueryParam('customFilters', location) || '').split(';');

        return selectedFiltersString.reduce((acc, filter) => {
            if (!filter) {
                return acc;
            }
            const [key, value] = filter.split(':');

            return { ...acc, [key]: value.split(',') };
        }, {});
    }

    _getNewSelectedFiltersString(filterName, filterArray) {
        const prevCustomFilters = this._getSelectedFiltersFromUrl();
        const customFilers = {
            ...prevCustomFilters,
            [filterName]: filterArray
        };

        return Object.entries(customFilers)
            .reduce((accumulator, [filterKey, filterValue]) => {
                if (filterValue.length) {
                    const filterValues = filterValue.sort().join(',');

                    accumulator.push(`${filterKey}:${filterValues}`);
                }

                return accumulator;
            }, [])
            .sort()
            .join(';');
    }

    _formatSelectedFiltersString(string) {
        const hasTrailingSemicolon = string[string.length - 1] === ';';
        const hasLeadingSemicolon = string[0] === ';';

        if (hasLeadingSemicolon) {
            return this._formatSelectedFiltersString(string.slice(0, -1));
        }

        if (hasTrailingSemicolon) {
            return string.slice(1);
        }

        return string;
    }

    onSeeResultsClick() {
        const {
            hideActiveOverlay,
            goToPreviousHeaderState,
            goToPreviousNavigationState
        } = this.props;

        hideActiveOverlay();
        goToPreviousHeaderState();
        goToPreviousNavigationState();
    }

    onVisible() {
        const {
            hideActiveOverlay,
            changeHeaderState,
            changeNavigationState,
            goToPreviousNavigationState,
            location: { pathname, search }
        } = this.props;

        changeHeaderState({
            name: FILTER,
            title: __('Filters'),
            onCloseClick: () => {
                hideActiveOverlay();
                goToPreviousNavigationState();
            }
        });

        changeNavigationState({
            name: FILTER,
            isHidden: true
        });

        window.addEventListener('popstate', this.historyBackHook);

        history.pushState(
            { overlayOpen: true },
            '',
            pathname + search
        );
    }

    historyBackHook = () => {
        const {
            goToPreviousNavigationState,
            customFiltersValues,
            hideActiveOverlay,
            goToPreviousHeaderState
        } = this.props;

        goToPreviousNavigationState();

        // close filter only if no applied filters left
        if (Object.keys(customFiltersValues).length === 0) {
            hideActiveOverlay();
            goToPreviousHeaderState();
        }
    };

    onHide() {
        window.removeEventListener('popstate', this.historyBackHook);
    }

    getAreFiltersEmpty() {
        const { isInfoLoading, availableFilters } = this.props;

        return !isInfoLoading && (
            !availableFilters
            || !Object.keys(availableFilters).length
        );
    }

    containerProps = () => ({
        areFiltersEmpty: this.getAreFiltersEmpty(),
        isContentFiltered: this.isContentFiltered()
    });

    isContentFiltered() {
        const { customFilters, priceMin, priceMax } = this.urlStringToObject();

        return !!(customFilters || priceMin || priceMax);
    }

    urlStringToObject() {
        const { location: { search } } = this.props;

        return search.substr(1).split('&').reduce((acc, part) => {
            const [key, value] = part.split('=');

            return { ...acc, [key]: value };
        }, {});
    }

    /**
     * Returns filter array with new parameters
     *
     * @param {String} filterKey key of option
     * @param {String} value
     * @returns {Object[]}
     * @memberof CategoryShoppingOptions
     */
    _getNewFilterArray(filterKey, value) {
        const { customFiltersValues, customFiltersValues: { price } } = this.props;
        const newFilterArray = customFiltersValues[filterKey] !== undefined
            ? Array.from(customFiltersValues[filterKey])
            : [];

        const filterValueIndex = newFilterArray.indexOf(value);

        if (filterKey === 'price') {
            // for price filter, choose one only
            // if price is already selected, remove
            // if price is not selected, select
            // if price is already selected and new other price is selected, replace
            return price && price.includes(value)
                ? []
                : [value];
        }

        if (filterValueIndex === -1) {
            newFilterArray.push(value);
        } else {
            newFilterArray.splice(filterValueIndex, 1);
        }

        return newFilterArray;
    }

    render() {
        return (
            <CategoryFilterOverlay
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CategoryFilterOverlayContainer)
);
