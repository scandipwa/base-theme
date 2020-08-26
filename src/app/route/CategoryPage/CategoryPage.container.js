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

import { CATEGORY } from 'Component/Header/Header.config';
import { MENU_TAB } from 'Component/NavigationTabs/NavigationTabs.config';
import { updateCurrentCategory } from 'Store/Category/Category.action';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { BOTTOM_NAVIGATION_TYPE, TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { setBigOfflineNotice } from 'Store/Offline/Offline.action';
import { toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import {
    updateInfoLoadStatus
} from 'Store/ProductListInfo/ProductListInfo.action';
import { CategoryTreeType } from 'Type/Category';
import { HistoryType, LocationType, MatchType } from 'Type/Common';
import { debounce } from 'Util/Request';
import {
    appendWithStoreCode,
    getQueryParam,
    setQueryParams
} from 'Util/Url';

import CategoryPage from './CategoryPage.component';
import { LOADING_TIME } from './CategoryPage.config';

export const ProductListInfoDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/ProductListInfo/ProductListInfo.dispatcher'
);

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Breadcrumbs/Breadcrumbs.dispatcher'
);

export const CategoryDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Category/Category.dispatcher'
);

export const MetaDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Meta/Meta.dispatcher'
);

export const NoMatchDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/NoMatch/NoMatch.dispatcher'
);

export const mapStateToProps = (state) => ({
    category: state.CategoryReducer.category,
    isOffline: state.OfflineReducer.isOffline,
    filters: state.ProductListInfoReducer.filters,
    sortFields: state.ProductListInfoReducer.sortFields,
    currentArgs: state.ProductListReducer.currentArgs,
    selectedInfoFilter: state.ProductListInfoReducer.selectedFilter,
    isInfoLoading: state.ProductListInfoReducer.isLoading,
    totalPages: state.ProductListReducer.totalPages
});

export const mapDispatchToProps = (dispatch) => ({
    toggleOverlayByKey: (key) => dispatch(toggleOverlayByKey(key)),
    changeHeaderState: (state) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    changeNavigationState: (state) => dispatch(changeNavigationState(BOTTOM_NAVIGATION_TYPE, state)),
    requestCategory: (options) => CategoryDispatcher.then(
        ({ default: dispatcher }) => dispatcher.handleData(dispatch, options)
    ),
    updateBreadcrumbs: (breadcrumbs) => ((Object.keys(breadcrumbs).length)
        ? BreadcrumbsDispatcher.then(
            ({ default: dispatcher }) => dispatcher.updateWithCategory(breadcrumbs, dispatch)
        )
        : BreadcrumbsDispatcher.then(
            ({ default: dispatcher }) => dispatcher.update([], dispatch)
        )
    ),
    requestProductListInfo: (options) => ProductListInfoDispatcher.then(
        ({ default: dispatcher }) => dispatcher.handleData(dispatch, options)
    ),
    updateLoadStatus: (isLoading) => dispatch(updateInfoLoadStatus(isLoading)),
    updateNoMatch: (options) => NoMatchDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateNoMatch(dispatch, options)
    ),
    setBigOfflineNotice: (isBig) => dispatch(setBigOfflineNotice(isBig)),
    updateMetaFromCategory: (category) => MetaDispatcher.then(
        ({ default: dispatcher }) => dispatcher.updateWithCategory(category, dispatch)
    ),
    clearCategory: () => dispatch(updateCurrentCategory({}))
});

export class CategoryPageContainer extends PureComponent {
    static propTypes = {
        history: HistoryType.isRequired,
        category: CategoryTreeType.isRequired,
        location: LocationType.isRequired,
        match: MatchType.isRequired,
        requestCategory: PropTypes.func.isRequired,
        changeHeaderState: PropTypes.func.isRequired,
        changeNavigationState: PropTypes.func.isRequired,
        requestProductListInfo: PropTypes.func.isRequired,
        setBigOfflineNotice: PropTypes.func.isRequired,
        updateMetaFromCategory: PropTypes.func.isRequired,
        updateBreadcrumbs: PropTypes.func.isRequired,
        updateLoadStatus: PropTypes.func.isRequired,
        updateNoMatch: PropTypes.func.isRequired,
        filters: PropTypes.objectOf(PropTypes.shape).isRequired,
        sortFields: PropTypes.shape({
            options: PropTypes.array
        }).isRequired,
        currentArgs: PropTypes.shape({
            filter: PropTypes.shape({
                categoryIds: PropTypes.number
            })
        }),
        selectedInfoFilter: PropTypes.shape({
            categoryIds: PropTypes.number
        }),
        isInfoLoading: PropTypes.bool.isRequired,
        isOffline: PropTypes.bool.isRequired,
        categoryIds: PropTypes.number,
        isSearchPage: PropTypes.bool
    };

    static defaultProps = {
        categoryIds: -1,
        isSearchPage: false,
        currentArgs: {},
        selectedInfoFilter: {}
    };

    state = {
        currentCategoryIds: -1,
        breadcrumbsWereUpdated: false,
        contentIsHidden: false,
        prevLocation: '',
        transition: 'opacity .8s ease'
    };

    config = {
        sortKey: 'name',
        sortDirection: 'ASC'
    };

    containerFunctions = {
        onSortChange: this.onSortChange.bind(this)
    };

    static getDerivedStateFromProps(props, state) {
        const { currentCategoryIds } = state;
        const { category: { id } } = props;

        /**
         * If the category we expect to load is loaded - reset it
         */
        if (currentCategoryIds === id) {
            return {
                currentCategoryIds: -1
            };
        }

        return null;
    }

    componentDidMount() {
        const {
            categoryIds,
            category: {
                id
            }
        } = this.props;

        /**
         * Always make sure the navigation show / hide mode (on scroll)
         * is activated when entering the category page.
         * */
        this.updateNavigationState();

        /**
         * Always update the history, ensure the history contains category
         */
        this.updateHistory();

        /**
         * Make sure to update header state, if the category visited
         * was already loaded.
         */
        if (categoryIds === id) {
            this.updateBreadcrumbs();
            this.updateHeaderState();
        } else {
            /**
             * Still update header and breadcrumbs, but ignore
             * the category data, as it is outdated
             */
            this.updateHeaderState(true);
            this.updateBreadcrumbs(true);
        }
    }

    componentDidUpdate(prevProps) {
        const {
            isOffline,
            categoryIds,
            category: {
                id
            }
        } = this.props;

        const {
            breadcrumbsWereUpdated,
            prevLocation
        } = this.state;

        const {
            categoryIds: prevCategoryIds,
            category: {
                id: prevId
            }
        } = prevProps;

        // TODO: category scrolls up when coming from PDP

        if (isOffline) {
            debounce(this.setOfflineNoticeSize, LOADING_TIME)();
        }
        /* eslint-disable */
        if (prevLocation !== location.href) {
            this.setState({ prevLocation: location.href, contentIsHidden: true, transition: 'none' });
            setTimeout(() => {
                this.setState({ contentIsHidden: false, transition: 'opacity .8s ease' })
            })
        }

        /**
         * If the URL rewrite has been changed, make sure the category ID
         * will persist in the history state.
         */
        if (categoryIds !== prevCategoryIds) {
            this.updateHistory();
        }

        /**
         * If the currently loaded category ID does not match the ID of
         * category from URL rewrite, request category.
         */
        if (categoryIds !== id) {
            this.requestCategory();
        }

        /**
         * If category ID was changed => it is loaded => we need to
         * update category specific information, i.e. breadcrumbs.
         *
         * Or if the breadcrumbs were not yet updated after category request,
         * and the category ID expected to load was loaded, update data.
         */
        if (
            id !== prevId
            || (!breadcrumbsWereUpdated && id === categoryIds)
        ) {
            this.checkIsActive();
            this.updateMeta();
            this.updateBreadcrumbs();
            this.updateHeaderState();
        }
    }

    onSortChange(sortDirection, sortKey) {
        const { location, history } = this.props;

        setQueryParams({ sortKey }, location, history);
        setQueryParams({ sortDirection }, location, history);
    }

    setOfflineNoticeSize = () => {
        const { setBigOfflineNotice, isInfoLoading } = this.props;

        if (isInfoLoading) {
            setBigOfflineNotice(true);
        } else {
            setBigOfflineNotice(false);
        }
    };

    getIsMatchingListFilter() {
        const {
            location,
            currentArgs: {
                currentPage,
                sort,
                filter
            } = {}
        } = this.props;

        /**
         * ? implementation bellow blinks, implementation with categoryIds check only does not show loading when selecting filters.
         * TODO: resolve it to be a combination of these two behaviour
         */

        // Data used to request category matches current data
        return JSON.stringify(filter) === JSON.stringify(this.getFilter())
            && JSON.stringify(sort) === JSON.stringify(this.getSelectedSortFromUrl())
            && currentPage === +(getQueryParam('page', location) || 1);
    }

    getIsMatchingInfoFilter() {
        const {
            categoryIds,
            selectedInfoFilter: {
                categoryIds: selectedCategoryIds
            }
        } = this.props;

        // Requested category is equal to current category
        return categoryIds === selectedCategoryIds;
    }

    containerProps = () => ({
        filter: this.getFilter(),
        isMatchingListFilter: this.getIsMatchingListFilter(),
        isMatchingInfoFilter: this.getIsMatchingInfoFilter(),
        selectedSort: this.getSelectedSortFromUrl(),
        selectedFilters: this.getSelectedFiltersFromUrl(),
        isContentFiltered: this.isContentFiltered()
    });

    isContentFiltered() {
        const {
            customFilters,
            priceMin,
            priceMax
        } = this.urlStringToObject();

        return !!(customFilters || priceMin || priceMax);
    }

    urlStringToObject() {
        const { location: { search } } = this.props;

        return search.substr(1).split('&').reduce((acc, part) => {
            const [key, value] = part.split('=');
            return { ...acc, [key]: value };
        }, {});
    }

    getSelectedFiltersFromUrl() {
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

    getSelectedSortFromUrl() {
        const {
            location,
            category: {
                default_sort_by
            }
        } = this.props;

        const {
            sortKey: globalDefaultSortKey,
            sortDirection: defaultSortDirection
        } = this.config;

        /**
         * Default SORT DIRECTION is taken from (sequentially):
         * - URL param "sortDirection"
         * - CategoryPage class property "config"
         * */
        const sortDirection = getQueryParam('sortDirection', location) || defaultSortDirection;

        /**
         * Default SORT KEY is taken from (sequentially):
         * - URL param "sortKey"
         * - Category default sort key (Magento 2 configuration)
         * - CategoryPage class property "config"
         * */
        const defaultSortKey = default_sort_by || globalDefaultSortKey;
        const sortKey = getQueryParam('sortKey', location) || defaultSortKey;

        return {
            sortDirection,
            sortKey
        };
    }

    getSelectedPriceRangeFromUrl() {
        const { location } = this.props;
        const min = +getQueryParam('priceMin', location);
        const max = +getQueryParam('priceMax', location);
        return { min, max };
    }

    getFilter() {
        const { categoryIds } = this.props;
        const customFilters = this.getSelectedFiltersFromUrl();
        const priceRange = this.getSelectedPriceRangeFromUrl();

        if (categoryIds === -1) {
            return {
                priceRange,
                customFilters
            };
        }

        return {
            priceRange,
            customFilters,
            categoryIds
        };
    }

    updateHistory() {
        const {
            history,
            location,
            categoryIds
        } = this.props;

        const {
            search,
            pathname,
            state = {}
        } = location;

        const { category } = state;

        /**
         * Prevent pushing non-existent category into the state
         */
        if (categoryIds === -1) {
            return;
        }

        if (category !== categoryIds) {
            history.replace({
                pathname,
                search,
                state: {
                    ...state,
                    category: categoryIds
                }
            });
        }
    }

    checkIsActive() {
        const {
            category: { is_active },
            updateNoMatch
        } = this.props;

        if (!is_active) {
            updateNoMatch({ noMatch: true });
        }
    }

    updateMeta() {
        const { updateMetaFromCategory, category } = this.props;
        updateMetaFromCategory(category);
    }

    updateBreadcrumbs(isUnmatchedCategory = false) {
        const { updateBreadcrumbs, category } = this.props;
        const breadcrumbs = isUnmatchedCategory ? {} : category;
        updateBreadcrumbs(breadcrumbs);

        this.setState({ breadcrumbsWereUpdated: true });
    }

    updateNavigationState() {
        const { changeNavigationState } = this.props;

        changeNavigationState({
            name: MENU_TAB,
            isVisibleOnScroll: true
        });
    }

    updateHeaderState(isUnmatchedCategory = false) {
        const {
            changeHeaderState,
            category: {
                name
            },
            history
        } = this.props;

        const { isFromCategory } = history?.location?.state || {};

        const onBackClick = isFromCategory
            ? () => history.goBack()
            : () => history.push(appendWithStoreCode('/menu'));

        /**
         * Ensure the name is not set if the category IDs do not
         * match. Otherwise, the previous value is displayed.
         */
        const title = isUnmatchedCategory ? undefined : name;

        changeHeaderState({
            name: CATEGORY,
            title,
            onBackClick
        });
    }

    requestCategory() {
        const {
            categoryIds,
            isSearchPage,
            requestCategory
        } = this.props;

        const {
            currentCategoryIds
        } = this.state;

        /**
         * Prevent non-existent category from being requested
         */
        if (categoryIds === -1) {
            return;
        }

        /**
         * Do not request a category again! We are still waiting for
         * a requested category to load!
         */
        if (categoryIds === currentCategoryIds) {
            return;
        }

        /**
         * Update current category to track if it is loaded or not - useful,
         * to prevent category from requesting itself multiple times.
         */
        this.setState({
            currentCategoryIds: categoryIds,
            breadcrumbsWereUpdated: false
        });

        requestCategory({
            isSearchPage,
            categoryIds
        });
    }

    render() {
        const { pageSize } = this.config;
        const { contentIsHidden, transition } = this.state;

        return (
            <div
                block="CategoryPage"
                elem="FadeIn"
                mods={ { contentIsHidden } }
            >
                <CategoryPage
                  { ...this.props }
                  pageSize={ pageSize }
                  { ...this.containerFunctions }
                  { ...this.containerProps() }
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPageContainer);
