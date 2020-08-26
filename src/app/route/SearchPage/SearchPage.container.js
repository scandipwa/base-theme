import { connect } from 'react-redux';
import { compose } from 'redux';

// TODO: try SEARCH type
import { CATEGORY } from 'Component/Header/Header.config';
import { LOADING_TIME } from 'Route/CategoryPage/CategoryPage.config';
import { CategoryPageContainer } from 'Route/CategoryPage/CategoryPage.container';
import { updateCurrentCategory } from 'Store/Category/Category.action';
import { updateMeta } from 'Store/Meta/Meta.action';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { BOTTOM_NAVIGATION_TYPE, TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { setBigOfflineNotice } from 'Store/Offline/Offline.action';
import { toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import { updateInfoLoadStatus } from 'Store/ProductListInfo/ProductListInfo.action';
import { fadeInOut } from 'Util/FadeInOut';
import { debounce } from 'Util/Request';
import { appendWithStoreCode } from 'Util/Url';

import SearchPage from './SearchPage.component';

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
export const ProductListInfoDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/ProductListInfo/ProductListInfo.dispatcher'
);

export const mapStateToProps = (state) => ({
    category: state.CategoryReducer.category,
    isOffline: state.OfflineReducer.isOffline,
    filters: state.ProductListInfoReducer.filters,
    currentArgs: state.ProductListReducer.currentArgs,
    sortFields: state.ProductListInfoReducer.sortFields,
    minPriceRange: state.ProductListInfoReducer.minPrice,
    maxPriceRange: state.ProductListInfoReducer.maxPrice,
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
    updateBreadcrumbs: (breadcrumbs) => BreadcrumbsDispatcher.then(
        ({ default: dispatcher }) => dispatcher.update(breadcrumbs, dispatch)
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
    updateCurrentCategory: (category) => dispatch(updateCurrentCategory(category)),
    updateMeta: (meta) => dispatch(updateMeta(meta))
});

export class SearchPageContainer extends CategoryPageContainer {
    static defaultProps = {
        ...this.defaultProps,
        isSearchPage: true
    };

    updateMeta() {
        const { updateMeta } = this.props;
        updateMeta({ title: __('Search') });
    }

    updateBreadcrumbs() {
        const { updateBreadcrumbs } = this.props;
        const search = this.getSearchParam();

        updateBreadcrumbs([{
            url: '',
            name: search.toUpperCase()
        }, {
            url: '/',
            name: __('Home')
        }]);
    }

    updateHeaderState() {
        const {
            changeHeaderState,
            history
        } = this.props;

        const { isFromCategory } = history?.location?.state || {};
        const search = this.getSearchParam();

        const onBackClick = isFromCategory
            ? () => history.goBack()
            : () => history.push(appendWithStoreCode('/menu'));

        changeHeaderState({
            name: CATEGORY,
            title: search,
            onBackClick
        });
    }

    getIsMatchingListFilter() {
        const { currentArgs: { search: currentSearch } } = this.props;
        const search = this.getSearchParam();

        // if the search requested is equal to search from URL
        return search === currentSearch;
    }

    getIsMatchingInfoFilter() {
        const { currentArgs: { search: currentSearch } } = this.props;
        const search = this.getSearchParam();

        // if the search requested is equal to search from URL
        return search === currentSearch;
    }

    componentDidMount() {
        this.updateMeta();
        this.updateBreadcrumbs();
        this.updateHeaderState();
        this.updateNavigationState();
    }

    componentDidUpdate(prevProps) {
        const {
            isOffline,
            match: { params: { query } }
        } = this.props;

        const {
            match: { params: { query: prevQuery } }
        } = prevProps;

        if (isOffline) {
            debounce(this.setOfflineNoticeSize, LOADING_TIME)();
        }

        /**
         * If search query has changed - update related information
         */
        if (query !== prevQuery) {
            this.updateMeta();
            this.updateBreadcrumbs();
            this.updateHeaderState();
        }
    }

    getSearchParam() {
        const { match: { params: { query } } } = this.props;
        return query;
    }

    render() {
        return (
            <SearchPage
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
              // addded here to not override the container props
              search={ this.getSearchParam() }
            />
        );
    }
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    fadeInOut
)(SearchPageContainer);
