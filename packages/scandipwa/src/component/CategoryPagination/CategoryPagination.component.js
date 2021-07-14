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
import { range } from 'Util/Manipulations';

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
        anchorTextPrevious: PropTypes.string,
        anchorTextNext: PropTypes.string,
        firstFramePage: PropTypes.number.isRequired,
        lastFramePage: PropTypes.number.isRequired,
        prevPageJump: PropTypes.number.isRequired,
        nextPageJump: PropTypes.number.isRequired,
        shouldRenderNextJump: PropTypes.bool.isRequired,
        shouldRenderPreviousJump: PropTypes.bool.isRequired,
        shouldRenderJumps: PropTypes.bool.isRequired,
        paginationFrame: PropTypes.bool.isRequired,
        id: PropTypes.string
    };

    static defaultProps = {
        isLoading: false,
        anchorTextPrevious: '',
        anchorTextNext: '',
        id: ''
    };

    renderPreviousPageLink() {
        const {
            anchorTextPrevious,
            currentPage,
            totalPages,
            paginationFrame
        } = this.props;

        /*
        1. hide 'Previous' button if current page is the first page
        2. hide 'Previous' button if total number of pages doesn't exceed total number of pages to display
        (i.e. all pages are already shown)
         */
        if (currentPage <= 1 || paginationFrame >= totalPages) {
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
            currentPage,
            firstFramePage,
            lastFramePage
        } = this.props;

        return range(firstFramePage, lastFramePage).map((page) => this.renderPageLink(
            page,
            __('Page %s', page),
            page.toString(),
            page === currentPage
        ));
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
        if (currentPage > totalPages - 1 || paginationFrame >= totalPages) {
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

    renderFirstPageLink() {
        const { shouldRenderJumps, firstFramePage } = this.props;

        if (!shouldRenderJumps || firstFramePage === 1) {
            return null;
        }

        return this.renderPageLink(
            1,
            __('Page %s', 1),
            '1',
        );
    }

    renderLastPageLink() {
        const { totalPages, shouldRenderJumps, lastFramePage } = this.props;

        if (!shouldRenderJumps || lastFramePage === totalPages) {
            return null;
        }

        return this.renderPageLink(
            totalPages,
            __('Page %s', totalPages),
            totalPages.toString(),
        );
    }

    // displayed as '...' by default
    renderPreviousJump() {
        const { prevPageJump, shouldRenderPreviousJump } = this.props;

        if (!shouldRenderPreviousJump) {
            return null;
        }

        return this.renderPageLink(
            prevPageJump,
            __('Page %s', prevPageJump),
            '...',
        );
    }

    // displayed as '...' by default
    renderNextJump() {
        const { nextPageJump, shouldRenderNextJump } = this.props;

        if (!shouldRenderNextJump) {
            return null;
        }

        return this.renderPageLink(
            nextPageJump,
            __('Page %s', nextPageJump),
            '...',
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
                    { this.renderFirstPageLink() }
                    { this.renderPreviousJump() }
                    { this.renderPageLinks() }
                    { this.renderNextJump() }
                    { this.renderLastPageLink() }
                    { this.renderNextPageLink() }
                </ul>
            </nav>
        );
    }
}

export default CategoryPagination;
