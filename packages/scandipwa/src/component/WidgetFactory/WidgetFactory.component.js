/* eslint-disable max-len */
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
import { lazy, PureComponent, Suspense } from 'react';

import RenderWhenVisible from 'Component/RenderWhenVisible';

import {
    CATALOG_PRODUCT_LIST,
    NEW_PRODUCTS,
    RECENTLY_VIEWED,
    SLIDER
} from './WidgetFactory.config';

import './WidgetFactory.style';

export const ProductListWidget = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "widget-product-list" */
    'Component/ProductListWidget'
));
export const NewProducts = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "widget-new-product" */
    'Component/NewProducts'
));
export const HomeSlider = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "widget-slider" */
    'Component/SliderWidget'
));
export const RecentlyViewedWidget = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "widget-recently-viewed" */
    'Component/RecentlyViewedWidget'
));

/** @namespace Component/WidgetFactory/Component */
export class WidgetFactory extends PureComponent {
    static propTypes = {
        type: PropTypes.string.isRequired
    };

    renderMap = {
        [SLIDER]: {
            component: HomeSlider,
            fallback: this.renderSliderFallback
        },
        [NEW_PRODUCTS]: {
            component: NewProducts
        },
        [CATALOG_PRODUCT_LIST]: {
            component: ProductListWidget
        },
        [RECENTLY_VIEWED]: {
            component: RecentlyViewedWidget
        }
    };

    renderSliderFallback() {
        return (
            <div block="WidgetFactory" elem="SliderPlaceholder" />
        );
    }

    renderDefaultFallback() {
        return <div />;
    }

    renderContent() {
        const { type } = this.props;
        const {
            component: Widget,
            fallback
        } = this.renderMap[type] || {};

        if (Widget !== undefined) {
            return (
                <RenderWhenVisible fallback={ fallback }>
                    <Widget { ...this.props } />
                </RenderWhenVisible>
            );
        }

        return null;
    }

    renderFallback() {
        const { type } = this.props;
        const { fallback = this.renderDefaultFallback } = this.renderMap[type] || {};

        return fallback();
    }

    render() {
        return (
            <Suspense fallback={ this.renderFallback() }>
                { this.renderContent() }
            </Suspense>
        );
    }
}

export default WidgetFactory;
