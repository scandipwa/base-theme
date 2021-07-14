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

import Overlay from 'Component/Overlay';
import SearchItem from 'Component/SearchItem';
import { ItemsType } from 'Type/ProductList';

import {
    AMOUNT_OF_PLACEHOLDERS,
    SEARCH_TIMEOUT
} from './SearchOverlay.config';

import './SearchOverlay.style';

/** @namespace Component/SearchOverlay/Component */
export class SearchOverlay extends PureComponent {
    static propTypes = {
        searchCriteria: PropTypes.string,
        searchResults: ItemsType.isRequired,
        isLoading: PropTypes.bool.isRequired,
        makeSearchRequest: PropTypes.func.isRequired,
        clearSearchResults: PropTypes.func.isRequired,
        isHideOverlay: PropTypes.bool
    };

    static defaultProps = {
        searchCriteria: '',
        isHideOverlay: false
    };

    componentDidUpdate(prevProps) {
        const { searchCriteria: prevSearchCriteria } = prevProps;
        const { searchCriteria, clearSearchResults, makeSearchRequest } = this.props;

        if (searchCriteria !== prevSearchCriteria) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            clearSearchResults();
            this.timeout = setTimeout(() => {
                this.timeout = null;
                makeSearchRequest();
            }, SEARCH_TIMEOUT);
        }
    }

    renderSearchItem(product, i) {
        return (
            <SearchItem
              product={ product }
              key={ i }
            />
        );
    }

    renderNoResults() {
        return <p>{ __('No results found!') }</p>;
    }

    renderSearchResults() {
        const { searchResults, isLoading } = this.props;

        if (!searchResults.length && !isLoading && !this.timeout) {
            return this.renderNoResults();
        }

        const resultsToRender = (isLoading || this.timeout) ? Array(AMOUNT_OF_PLACEHOLDERS).fill({}) : searchResults;

        return (
            <ul>
                { resultsToRender.map((item, i) => this.renderSearchItem(item, i)) }
            </ul>
        );
    }

    render() {
        const { isHideOverlay, searchCriteria } = this.props;

        if (!searchCriteria.trim()) {
            return null;
        }

        if (isHideOverlay) {
            return (
                <article
                  block="SearchOverlay"
                  elem="Results"
                  aria-label="Search results"
                >
                    { this.renderSearchResults() }
                </article>
            );
        }

        return (
            <Overlay
              id="search"
              mix={ { block: 'SearchOverlay' } }
            >
                <article
                  block="SearchOverlay"
                  elem="Results"
                  aria-label="Search results"
                >
                    { this.renderSearchResults() }
                </article>
            </Overlay>
        );
    }
}

export default SearchOverlay;
