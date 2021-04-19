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

import { PRODUCT_COMPARE } from 'Component/Header/Header.config';
import { updateMeta } from 'Store/Meta/Meta.action';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { showNotification } from 'Store/Notification/Notification.action';
import DataContainer from 'Util/Request/DataContainer';

import ProductComparePage from './ProductComparePage.component';

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Breadcrumbs/Breadcrumbs.dispatcher'
);

/** @namespace Route/ProductComparePage/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device,
    isLoading: state.ProductCompareReducer.isLoading
});

/** @namespace Route/ProductComparePage/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showNotification: (type, message) => dispatch(showNotification(type, message)),
    updateMeta: (meta) => dispatch(updateMeta(meta)),
    setHeaderState: (stateName) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, stateName)),
    updateBreadcrumbs: (breadcrumbs) => {
        BreadcrumbsDispatcher.then(
            ({ default: dispatcher }) => dispatcher.update(breadcrumbs, dispatch)
        );
    }
});

/** @namespace Route/ProductComparePage/Container/ProductComparePageContainer */
export class ProductComparePageContainer extends DataContainer {
    static propTypes = {
        updateMeta: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
        isLoading: PropTypes.bool
    };

    static defaultProps = {
        isLoading: false
    };

    componentDidMount() {
        this.updateMeta();
        this.updateBreadcrumbs();
        this.updateHeaderState();
    }

    updateMeta() {
        const { updateMeta } = this.props;
        updateMeta({ title: __('Product Compare') });
    }

    updateBreadcrumbs() {
        const { updateBreadcrumbs } = this.props;
        const breadcrumbs = [
            {
                url: '/compare',
                name: __('Product Compare')
            }
        ];

        updateBreadcrumbs(breadcrumbs);
    }

    updateHeaderState() {
        const { setHeaderState } = this.props;

        setHeaderState({
            name: PRODUCT_COMPARE,
            title: __('Compare'),
            onBackClick: () => history.back()
        });
    }

    render() {
        return (
            <ProductComparePage
              { ...this.props }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductComparePageContainer);
