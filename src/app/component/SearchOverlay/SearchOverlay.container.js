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
import { connect } from 'react-redux';
import { PureComponent } from 'react';
import { SearchBarDispatcher } from 'Store/SearchBar';
import { hideActiveOverlay } from 'Store/Overlay';
import SearchOverlay from './SearchOverlay.component';

export const mapStateToProps = (state) => ({
    searchResults: state.SearchBarReducer.productsInSearch,
    isLoading: state.SearchBarReducer.isLoading
});

export const mapDispatchToProps = (dispatch) => ({
    hideActiveOverlay: () => dispatch(hideActiveOverlay()),
    makeSearchRequest: (options) => SearchBarDispatcher.handleData(dispatch, options),
    clearSearchResults: () => SearchBarDispatcher.clearSearchResults(dispatch)
});

export class SearchOverlayContainer extends PureComponent {
    static propTypes = {
        makeSearchRequest: PropTypes.func.isRequired,
        clearSearchResults: PropTypes.func.isRequired,
        searchCriteria: PropTypes.string.isRequired
    };

    containerFunctions = {
        getProductLinkTo: this.getProductLinkTo.bind(this),
        makeSearchRequest: this.makeSearchRequest.bind(this)
    };

    getProductLinkTo(product) {
        const { url } = product;

        if (!url) {
            return {};
        }

        return {
            pathname: url,
            state: { product }
        };
    }

    makeSearchRequest() {
        const {
            makeSearchRequest,
            clearSearchResults,
            searchCriteria
        } = this.props;

        if (searchCriteria) {
            clearSearchResults();

            makeSearchRequest({
                args: {
                    search: searchCriteria,
                    pageSize: 24,
                    currentPage: 1
                }
            });
        }
    }

    render() {
        return (
            <SearchOverlay
              { ...this.props }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchOverlayContainer);
