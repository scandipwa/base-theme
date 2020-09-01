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

import './ProductListPage.style';

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';

import ProductCard from 'Component/ProductCard';
import { MixType } from 'Type/Common';
import { FilterType, ProductType } from 'Type/ProductList';

import { DEFAULT_PLACEHOLDER_COUNT } from './ProductListPage.config';

/**
 * Placeholder for List of category product
 * @class ProductListPage
 */
export class ProductListPage extends PureComponent {
    static propTypes = {
        isInfiniteLoaderEnabled: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isVisible: PropTypes.bool.isRequired,
        updatePages: PropTypes.func.isRequired,
        numberOfPlaceholders: PropTypes.number,
        selectedFilters: FilterType,
        wrapperRef: PropTypes.func,
        pageNumber: PropTypes.number,
        items: PropTypes.arrayOf(ProductType),
        mix: MixType
    };

    static defaultProps = {
        numberOfPlaceholders: DEFAULT_PLACEHOLDER_COUNT,
        wrapperRef: () => {},
        selectedFilters: {},
        pageNumber: null,
        items: [],
        mix: {}
    };

    componentDidMount() {
        this.startObserving();
    }

    componentDidUpdate() {
        this.startObserving();
    }

    componentWillUnmount() {
        this.stopObserving();
    }

    startObserving() {
        const {
            items,
            updatePages,
            isInfiniteLoaderEnabled
        } = this.props;

        if (!isInfiniteLoaderEnabled || items.length) {
            return;
        }

        if (this.node && !this.observer && 'IntersectionObserver' in window) {
            const options = {
                rootMargin: '0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver(([{ intersectionRatio }]) => {
                const { items, isLoading } = this.props;

                // must not be a product items list, and must not be loading
                if (intersectionRatio > 0 && !items.length && !isLoading) {
                    this.stopObserving();
                    updatePages();
                }
            }, options);

            this.observer.observe(this.node);
        }
    }

    stopObserving() {
        if (this.observer) {
            if (this.observer.unobserve && this.node) {
                this.observer.unobserve(this.node);
            }

            if (this.observer.disconnect) {
                this.observer.disconnect();
            }

            this.observer = null;
        }
    }

    renderPlaceholders() {
        const { numberOfPlaceholders } = this.props;

        return Array.from(
            { length: numberOfPlaceholders },
            (_, i) => (
                <ProductCard
                  key={ i }
                  product={ {} }
                />
            )
        );
    }

    getPlaceholderRef() {
        const { isVisible } = this.props;

        if (!isVisible) {
            return undefined;
        }

        return (node) => {
            this.node = node;
        };
    }

    renderPageItems() {
        const {
            items,
            selectedFilters
        } = this.props;

        return items.map((product, i) => (
            <ProductCard
              product={ product }
              // eslint-disable-next-line react/no-array-index-key
              key={ i }
              selectedFilters={ selectedFilters }
            />
        ));
    }

    renderPlaceholderItems() {
        return (
            <>
                <li
                  block="ProductListPage"
                  elem="Offset"
                  ref={ this.getPlaceholderRef() }
                />
                { this.renderPlaceholders() }
            </>
        );
    }

    renderItems() {
        const { items, isLoading } = this.props;

        if (!items.length || isLoading) {
            return this.renderPlaceholderItems();
        }

        return this.renderPageItems();
    }

    render() {
        const {
            pageNumber,
            wrapperRef,
            mix
        } = this.props;

        return (
            <ul
              block="ProductListPage"
              mix={ { ...mix, elem: 'Page' } }
              key={ pageNumber }
              ref={ wrapperRef }
            >
                { this.renderItems() }
            </ul>
        );
    }
}

export default withRouter(ProductListPage);
