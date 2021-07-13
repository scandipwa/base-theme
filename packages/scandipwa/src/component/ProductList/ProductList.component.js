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

import CategoryPagination from 'Component/CategoryPagination';
import ProductListPage from 'Component/ProductListPage';
import { MixType } from 'Type/Common';
import { DeviceType } from 'Type/Device';
import { FilterType, PagesType } from 'Type/ProductList';

import { observerThreshold } from './ProductList.config';

import './ProductList.style';

/**
 * List of category products
 * @class ProductList
 * @namespace Component/ProductList/Component
 */
export class ProductList extends PureComponent {
    static propTypes = {
        device: DeviceType.isRequired,
        title: PropTypes.string,
        pages: PagesType.isRequired,
        selectedFilters: FilterType,
        isLoading: PropTypes.bool,
        updatePage: PropTypes.func,
        totalPages: PropTypes.number,
        loadPage: PropTypes.func,
        requestPage: PropTypes.func,
        loadPrevPage: PropTypes.func,
        currentPage: PropTypes.number,
        isShowLoading: PropTypes.bool,
        isVisible: PropTypes.bool,
        isInfiniteLoaderEnabled: PropTypes.bool,
        isPaginationEnabled: PropTypes.bool,
        isWidget: PropTypes.bool,
        mix: MixType
    };

    static defaultProps = {
        mix: {},
        title: '',
        isInfiniteLoaderEnabled: false,
        isPaginationEnabled: false,
        selectedFilters: {},
        isLoading: false,
        updatePage: () => {},
        totalPages: 1,
        loadPage: () => {},
        requestPage: () => {},
        loadPrevPage: () => {},
        currentPage: 1,
        isShowLoading: false,
        isVisible: true,
        isWidget: false
    };

    nodes = {};

    observedNodes = [];

    pagesIntersecting = [];

    componentDidUpdate(prevProps) {
        const { isWidget, currentPage, device } = this.props;
        const { currentPage: prevCurrentPage } = prevProps;

        // Scroll up on page change, ignore widgets
        if (prevCurrentPage !== currentPage && !isWidget && !device.isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const { isInfiniteLoaderEnabled } = this.props;

        if (isInfiniteLoaderEnabled) {
            this.observePageChange();
        }
    }

    componentWillUnmount() {
        if (this.observer && this.observer.disconnect) {
            this.observer.disconnect();
        }

        this.observer = null;
    }

    observePageChange() {
        const { updatePage, isLoading } = this.props;

        if (isLoading) {
            this.pagesIntersecting = [];
        }

        if (!this.observer && 'IntersectionObserver' in window) {
            const threshold = this._getThreshold();

            this.observer = new IntersectionObserver((entries) => {
                const { currentPage } = this.props;

                entries.forEach(({ target, isIntersecting }) => {
                    const page = +Object.keys(this.nodes).find((node) => this.nodes[node] === target);
                    const index = this.pagesIntersecting.indexOf(page);

                    if (isIntersecting && index === -1) {
                        this.pagesIntersecting.push(page);
                    }

                    if (!isIntersecting && index > -1) {
                        this.pagesIntersecting.splice(index, 1);
                    }
                });

                const minPage = Math.min(...this.pagesIntersecting);

                if (minPage < Infinity && minPage !== currentPage) {
                    updatePage(minPage);
                }
            }, {
                rootMargin: '0px',
                threshold
            });
        }

        this.updateObserver();
    }

    updateObserver() {
        const currentNodes = Object.values(this.nodes);

        if (!this.observer || currentNodes.length <= 0) {
            return;
        }

        currentNodes.forEach((node) => {
            if (node && !this.observedNodes.includes(node)) {
                this.observer.observe(node);
                this.observedNodes.push(node);
            }
        });

        this.observedNodes = this.observedNodes.reduce((acc, node) => {
            if (!currentNodes.includes(node)) {
                this.observer.unobserve(node);
            } else {
                acc.push(node);
            }

            return acc;
        }, []);
    }

    _getThreshold() {
        const hundredPercent = 100;

        return Array.from(
            { length: (hundredPercent / observerThreshold) + 1 },
            (_, i) => i * (observerThreshold / hundredPercent)
        );
    }

    renderLoadButton() {
        const {
            isShowLoading,
            isInfiniteLoaderEnabled,
            loadPrevPage
        } = this.props;

        if (!isShowLoading || !isInfiniteLoaderEnabled) {
            return null;
        }

        return (
            <div
              block="ProductList"
              elem="LoadButton"
              role="button"
              tabIndex="0"
              onKeyUp={ loadPrevPage }
              onClick={ loadPrevPage }
            >
                { __('Load previous') }
            </div>
        );
    }

    renderNoProducts() {
        return (
            <div block="ProductList">
                <div
                  block="ProductList"
                  elem="ProductsMissing"
                >
                    <h2>{ __('We are sorry!') }</h2>
                    <h3>{ __('There were no products found matching your request.') }</h3>
                    <p>{ __('Please, try removing selected filters and try again!') }</p>
                </div>
            </div>
        );
    }

    renderPages() {
        const {
            pages,
            isVisible,
            isLoading,
            isInfiniteLoaderEnabled
        } = this.props;

        if (isLoading) {
            return this.renderPage();
        }

        const pageRenders = Object.entries(pages).map(this.renderProductPage);

        if (isVisible && isInfiniteLoaderEnabled) { // add placeholders to the end of pages if needed
            const key = Math.max(Object.keys(pages)) + 1; // the key should match next page key
            pageRenders.push(this.renderPage({ key }));
        }

        return pageRenders;
    }

    _processProps(props) {
        const { isInfiniteLoaderEnabled } = this.props;

        if (isInfiniteLoaderEnabled) {
            return props;
        }

        // there must be no more then one page per screen
        // if the "isInfiniteLoaderEnabled" is false
        const { key, ...restProps } = props;
        restProps.key = 0;

        return restProps;
    }

    renderPage(props = {}) {
        const {
            isInfiniteLoaderEnabled,
            loadPage,
            isLoading,
            isVisible,
            currentPage,
            mix
        } = this.props;

        const newProps = this._processProps(props);

        return (
            <ProductListPage
              key={ currentPage }
              isInfiniteLoaderEnabled={ isInfiniteLoaderEnabled }
              updatePages={ loadPage }
              isLoading={ isLoading }
              isVisible={ isVisible }
              mix={ mix }
              { ...newProps }
            />
        );
    }

    renderProductPage = ([key, items = []]) => {
        const { selectedFilters } = this.props;

        const pageNumber = +key;

        return this.renderPage({
            selectedFilters,
            pageNumber,
            items,
            key,
            wrapperRef: (node) => {
                this.nodes[pageNumber] = node;
            }
        });
    };

    renderPagination() {
        const {
            isLoading,
            totalPages,
            requestPage,
            isPaginationEnabled
        } = this.props;

        if (!isPaginationEnabled) {
            return null;
        }

        return (
            <CategoryPagination
              isLoading={ isLoading }
              totalPages={ totalPages }
              onPageSelect={ requestPage }
            />
        );
    }

    renderTitle() {
        const { title } = this.props;

        if (!title) {
            return null;
        }

        return (
            <h2>{ title }</h2>
        );
    }

    render() {
        const {
            totalPages,
            isLoading,
            mix
        } = this.props;

        if (!isLoading && totalPages === 0) {
            return this.renderNoProducts();
        }

        return (
            <div
              block="ProductList"
              mods={ { isLoading } }
              mix={ mix }
            >
                { this.renderTitle() }
                { this.renderLoadButton() }
                { this.renderPages() }
                { this.renderPagination() }
            </div>
        );
    }
}

export default ProductList;
