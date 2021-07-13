/* eslint-disable fp/no-let, fp/no-loops */
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

import CategoryPaginationLink from 'Component/CategoryPaginationLink';
import Image from 'Component/Image';
import TextPlaceholder from 'Component/TextPlaceholder';
import chevron from 'Style/icons/chevron.svg';

import './CategoryPagination.style';

/** @namespace Component/CategoryPagination/Component */
export class CategoryPagination extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        pathname: PropTypes.string.isRequired,
        onPageSelect: PropTypes.func.isRequired,
        totalPages: PropTypes.number.isRequired,
        currentPage: PropTypes.number.isRequired,
        getSearchQuery: PropTypes.func.isRequired,
        paginationFrame: PropTypes.number,
        paginationFrameSkip: PropTypes.number,
        anchorTextPrevious: PropTypes.string,
        anchorTextNext: PropTypes.string,
        id: PropTypes.string
    };

    static defaultProps = {
        isLoading: false,
        paginationFrame: 5,
        paginationFrameSkip: 4,
        anchorTextPrevious: '',
        anchorTextNext: '',
        id: ''
    };

    renderPreviousPageLink() {
        const {
            anchorTextPrevious,
            currentPage,
            paginationFrame,
            totalPages
        } = this.props;

        /*
        1. hide 'Previous' button if current page is the first page
        2. hide 'Previous' button if total number of pages doesn't exceed total number of pages to display
        (i.e. all pages are already shown)
         */
        if (currentPage <= 1 || totalPages <= paginationFrame + 1) {
            return (
                <li block="CategoryPagination" elem="ListItem" />
            );
        }

        return this.renderPageLink(
            currentPage - 1,
            __('Previous page'),
            anchorTextPrevious || this.renderPageIcon()
        );
    }

    renderPageLinks() {
        const {
            totalPages,
            paginationFrame,
            paginationFrameSkip,
            currentPage
        } = this.props;

        let pages = [];
        let i;

        // Render next pagination links
        for (i = currentPage; i <= currentPage + paginationFrame; i++) {
            if (i <= totalPages && pages.length <= paginationFrameSkip) {
                pages.push(this.renderPageLink(
                    i,
                    __('Page %s', i),
                    i.toString(),
                    i === currentPage
                ));
            }
        }

        // Render previous pagination links if necessary
        for (i = 1; i < currentPage; i++) {
            if (pages.length < paginationFrame) {
                const id = currentPage - i;
                const pageData = this.renderPageLink(
                    id,
                    __('Page %s', id),
                    id.toString()
                );

                pages = [pageData, ...pages];
            }
        }

        // Edge case for rendering correct count of next links when current page is 1
        if (currentPage === 1 && pages.length < totalPages) {
            for (i = pages.length + 1; i <= paginationFrame; i++) {
                pages.push(this.renderPageLink(
                    i,
                    __('Page %s', i),
                    i.toString()
                ));
            }
        }

        return pages;
    }

    renderPageIcon(isNext = false) {
        return (
            <Image
              src={ chevron }
              alt="Next Icon"
              mix={ { block: 'CategoryPagination', elem: 'Icon', mods: { isNext } } }
            />
        );
    }

    renderNextPageLink() {
        const {
            anchorTextNext,
            currentPage,
            totalPages,
            paginationFrame
        } = this.props;

        /*
        1. hide 'Next' button if current page is the last page
        2. hide 'Next' button if total number of pages doesn't exceed total number of pages to display
        (i.e. all pages are already shown)
         */
        if (currentPage > totalPages - 1 || totalPages <= paginationFrame + 1) {
            return (
                <li block="CategoryPagination" elem="ListItem" />
            );
        }

        return this.renderPageLink(
            currentPage + 1,
            __('Next page'),
            anchorTextNext || this.renderPageIcon(true)
        );
    }

    renderPageLink(
        pageNumber,
        label,
        children,
        isCurrent = false
    ) {
        const {
            pathname,
            onPageSelect,
            getSearchQuery
        } = this.props;

        return (
            <li
              key={ pageNumber }
              block="CategoryPagination"
              elem="ListItem"
            >
                <CategoryPaginationLink
                  label={ label }
                  url_path={ pathname }
                  getPage={ onPageSelect }
                  isCurrent={ isCurrent }
                  pageNumber={ pageNumber }
                  getSearchQueryForPage={ getSearchQuery }
                >
                    { children }
                </CategoryPaginationLink>
            </li>
        );
    }

    renderPlaceholder() {
        return (
            <ul block="CategoryPagination" mods={ { isLoading: true } }>
                { Array.from({ length: 4 }, (_, i) => (
                    <li
                      key={ i }
                      block="CategoryPagination"
                      elem="ListItem"
                    >
                        <TextPlaceholder length="block" />
                    </li>
                )) }
            </ul>
        );
    }

    render() {
        const { isLoading, totalPages, id } = this.props;

        if (totalPages === 1) { // do not show pagination, if there are less then one page
            return <ul block="CategoryPagination" />;
        }

        if (isLoading) {
            return this.renderPlaceholder();
        }

        return (
            <nav aria-label={ __('Product list navigation') }>
                <ul block="CategoryPagination" id={ id }>
                    { this.renderPreviousPageLink() }
                    { this.renderPageLinks() }
                    { this.renderNextPageLink() }
                </ul>
            </nav>
        );
    }
}

export default CategoryPagination;
