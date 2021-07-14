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
import { withRouter } from 'react-router-dom';

import ProductListInfoDispatcher from 'Store/ProductListInfo/ProductListInfo.dispatcher';
import { HistoryType } from 'Type/Common';
import { DeviceType } from 'Type/Device';
import { FilterInputType, PagesType } from 'Type/ProductList';
import { LocationType } from 'Type/Router';
import { getQueryParam, setQueryParams } from 'Util/Url';

import ProductList from './ProductList.component';

/** @namespace Component/ProductList/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device
});

/** @namespace Component/ProductList/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    requestProductListInfo: (options) => ProductListInfoDispatcher.handleData(dispatch, options)
});

/** @namespace Component/ProductList/Container */
export class ProductListContainer extends PureComponent {
    containerFunctions = {
        loadPrevPage: this.loadPage.bind(this, false),
        loadPage: this.loadPage.bind(this),
        updatePage: this.updatePage.bind(this)
    };

    static propTypes = {
        history: HistoryType.isRequired,
        location: LocationType.isRequired,
        pages: PagesType.isRequired,
        pageSize: PropTypes.number,
        isLoading: PropTypes.bool.isRequired,
        isPageLoading: PropTypes.bool,
        totalItems: PropTypes.number.isRequired,
        requestProductList: PropTypes.func.isRequired,
        requestProductListInfo: PropTypes.func.isRequired,
        selectedFilters: PropTypes.objectOf(PropTypes.shape),
        isPreventRequest: PropTypes.bool,
        isInfiniteLoaderEnabled: PropTypes.bool,
        isPaginationEnabled: PropTypes.bool,
        filter: FilterInputType,
        search: PropTypes.string,
        sort: PropTypes.objectOf(PropTypes.string),
        noAttributes: PropTypes.bool,
        noVariants: PropTypes.bool,
        isWidget: PropTypes.bool,
        device: DeviceType.isRequired
    };

    static defaultProps = {
        pageSize: 24,
        filter: {},
        search: '',
        selectedFilters: {},
        sort: undefined,
        isPreventRequest: false,
        isPaginationEnabled: true,
        isInfiniteLoaderEnabled: true,
        isPageLoading: false,
        noAttributes: false,
        noVariants: false,
        isWidget: false
    };

    state = {
        pagesCount: 1
    };

    componentDidMount() {
        const { pages, isPreventRequest } = this.props;
        const { pagesCount } = this.state;
        const pagesLength = Object.keys(pages).length;

        if (pagesCount !== pagesLength) {
            this.setState({ pagesCount: pagesLength });
        }

        // Is true when category is changed. This check prevents making new requests when navigating back to PLP from PDP
        if (!isPreventRequest) {
            this.requestPage(this._getPageFromUrl());
        }
    }

    componentDidUpdate(prevProps) {
        const { sort, search, filter } = this.props;
        const { sort: prevSort, search: prevSearch, filter: prevFilter } = prevProps;

        const { pages } = this.props;
        const { pagesCount } = this.state;
        const pagesLength = Object.keys(pages).length;

        if (pagesCount !== pagesLength) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ pagesCount: pagesLength });
        }

        if (search !== prevSearch
            || JSON.stringify(sort) !== JSON.stringify(prevSort)
            || JSON.stringify(filter) !== JSON.stringify(prevFilter)
        ) {
            this.requestPage(this._getPageFromUrl());
        }
    }

    isEmptyFilter() {
        const { filter } = this.props;

        const validFilters = Object.entries(filter).filter(([key, value]) => {
            switch (key) {
            case 'priceRange':
                return value.min > 0 || value.max > 0;
            case 'customFilters':
                return Object.keys(value).length > 0;
            case 'categoryIds':
            default:
                return true;
            }
        });

        /**
         * If there is more then one valid filter, filters are not empty.
         */
        return validFilters.length > 0;
    }

    requestPage = (currentPage = 1, isNext = false) => {
        const {
            sort,
            search,
            filter,
            pageSize,
            requestProductList,
            requestProductListInfo,
            noAttributes,
            noVariants,
            isWidget
        } = this.props;

        /**
         * In case the wrong category was passed down to the product list,
         * prevent it from being requested.
         */
        if (filter.categoryIds === -1) {
            return;
        }

        /**
         * Do not request page if there are no filters
         */
        if (!search && !this.isEmptyFilter()) {
            return;
        }

        // TODO: product list requests filters alongside the page
        // TODO: sometimes product list is requested more then once
        // TODO: the product list should not request itself, when coming from PDP

        const options = {
            isNext,
            noAttributes,
            noVariants,
            args: {
                sort,
                filter,
                search,
                pageSize,
                currentPage
            }
        };

        const infoOptions = {
            args: {
                filter,
                search
            }
        };

        requestProductList(options);

        if (!isWidget) {
            requestProductListInfo(infoOptions);
        }
    };

    containerProps = () => ({
        currentPage: this._getPageFromUrl(),
        isShowLoading: this._isShowLoading(),
        isVisible: this._isVisible(),
        requestPage: this.requestPage,
        // disable this property to enable infinite scroll on desktop
        isInfiniteLoaderEnabled: this._getIsInfiniteLoaderEnabled()
    });

    _getIsInfiniteLoaderEnabled() { // disable infinite scroll on mobile
        const { isInfiniteLoaderEnabled, device } = this.props;

        // allow scroll and mobile
        if (device.isMobile) {
            return isInfiniteLoaderEnabled;
        }

        return false;
    }

    _getPageFromUrl() {
        const { location } = this.props;

        return +(getQueryParam('page', location) || 1);
    }

    _getPagesBounds() {
        const { pages, totalItems, pageSize } = this.props;
        const keys = Object.keys(pages);

        return {
            maxPage: Math.max(...keys),
            minPage: Math.min(...keys),
            totalPages: Math.ceil(totalItems / pageSize),
            loadedPagesCount: keys.length
        };
    }

    _isShowLoading() {
        const { isLoading } = this.props;
        const { minPage } = this._getPagesBounds();

        return minPage > 1 && !isLoading;
    }

    _isVisible() {
        const { maxPage, totalPages } = this._getPagesBounds();

        return maxPage < totalPages;
    }

    loadPage(next = true) {
        const { pagesCount } = this.state;
        const { isPageLoading } = this.props;

        const {
            minPage,
            maxPage,
            totalPages,
            loadedPagesCount
        } = this._getPagesBounds();

        const isUpdatable = totalPages > 0 && pagesCount === loadedPagesCount;
        const shouldUpdateList = next ? maxPage < totalPages : minPage > 1;

        if (isUpdatable && shouldUpdateList && !isPageLoading) {
            this.setState({ pagesCount: pagesCount + 1 });
            this.requestPage(next ? maxPage + 1 : minPage - 1, true);
        }
    }

    updatePage(pageNumber) {
        const { location, history } = this.props;

        setQueryParams({
            page: pageNumber === 1 ? '' : pageNumber
        }, location, history);
    }

    render() {
        return (
            <ProductList
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProductListContainer));
