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

import { CUSTOMER_ACCOUNT, CUSTOMER_ACCOUNT_PAGE, CUSTOMER_WISHLIST } from 'Component/Header/Header.config';
import { updateMeta } from 'Store/Meta/Meta.action';
import { changeNavigationState } from 'Store/Navigation/Navigation.action';
import { TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import {
    ADDRESS_BOOK,
    DASHBOARD,
    MY_ORDERS,
    MY_WISHLIST,
    NEWSLETTER_SUBSCRIPTION
} from 'Type/Account';
import { HistoryType, LocationType, MatchType } from 'Type/Common';
import { DeviceType } from 'Type/Device';
import { appendWithStoreCode } from 'Util/Url';

import MyAccount from './MyAccount.component';
import {
    MY_ACCOUNT_URL
} from './MyAccount.config';

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Breadcrumbs/Breadcrumbs.dispatcher'
);
export const MyAccountDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/MyAccount/MyAccount.dispatcher'
);

/** @namespace Route/MyAccount/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isSignedIn: state.MyAccountReducer.isSignedIn,
    device: state.ConfigReducer.device,
    wishlistItems: state.WishlistReducer.productsInWishlist
});

/** @namespace Route/MyAccount/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    updateBreadcrumbs: (breadcrumbs) => BreadcrumbsDispatcher.then(
        ({ default: dispatcher }) => dispatcher.update(breadcrumbs, dispatch)
    ),
    changeHeaderState: (state) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, state)),
    requestCustomerData: () => MyAccountDispatcher.then(
        ({ default: dispatcher }) => dispatcher.requestCustomerData(dispatch)
    ),
    toggleOverlayByKey: (key) => dispatch(toggleOverlayByKey(key)),
    updateMeta: (meta) => dispatch(updateMeta(meta))
});

/** @namespace Route/MyAccount/Container */
export class MyAccountContainer extends PureComponent {
    static propTypes = {
        changeHeaderState: PropTypes.func.isRequired,
        requestCustomerData: PropTypes.func.isRequired,
        updateBreadcrumbs: PropTypes.func.isRequired,
        toggleOverlayByKey: PropTypes.func.isRequired,
        updateMeta: PropTypes.func.isRequired,
        isSignedIn: PropTypes.bool.isRequired,
        match: MatchType.isRequired,
        location: LocationType.isRequired,
        history: HistoryType.isRequired,
        device: DeviceType.isRequired,
        wishlistItems: PropTypes.object
    };

    static defaultProps = {
        wishlistItems: {}
    };

    static navigateToSelectedTab(props, state = {}) {
        const {
            match: {
                params: {
                    tab: historyActiveTab = DASHBOARD
                } = {}
            } = {}
        } = props;

        const { activeTab } = state;

        if (activeTab !== historyActiveTab) {
            return { activeTab: historyActiveTab };
        }

        return null;
    }

    tabMap = {
        [DASHBOARD]: {
            url: '/dashboard',
            name: __('Dashboard')
        },
        [ADDRESS_BOOK]: {
            url: '/address-book',
            name: __('Address book')
        },
        [MY_ORDERS]: {
            url: '/my-orders',
            name: __('My orders')
        },
        [MY_WISHLIST]: {
            url: '/my-wishlist',
            name: __('My wishlist'),
            headerTitle: () => this.getMyWishlistHeaderTitle()
        },
        [NEWSLETTER_SUBSCRIPTION]: {
            url: '/newsletter-subscription',
            name: __('Newsletter Subscription')
        }
    };

    containerFunctions = {
        changeActiveTab: this.changeActiveTab.bind(this),
        onSignIn: this.onSignIn.bind(this),
        onSignOut: this.onSignOut.bind(this)
    };

    __construct(props) {
        super.__construct(props);

        const {
            isSignedIn,
            updateMeta,
            toggleOverlayByKey
        } = this.props;

        this.state = {
            ...MyAccountContainer.navigateToSelectedTab(this.props),
            isEditingActive: false
        };

        if (!isSignedIn) {
            toggleOverlayByKey(CUSTOMER_ACCOUNT);
        }

        updateMeta({ title: __('My account') });

        this.redirectIfNotSignedIn();
        this.onSignIn();
        this.updateBreadcrumbs();
    }

    static getDerivedStateFromProps(props, state) {
        return MyAccountContainer.navigateToSelectedTab(props, state);
    }

    componentDidUpdate(prevProps, prevState) {
        const { wishlistItems: prevWishlistItems } = prevProps;
        const { wishlistItems, isSignedIn } = this.props;
        const { activeTab: prevActiveTab } = prevState;
        const { activeTab } = this.state;

        this.redirectIfNotSignedIn();

        if (prevActiveTab !== activeTab) {
            this.updateBreadcrumbs();
            this.changeHeaderState();
        }

        if (Object.keys(wishlistItems).length !== Object.keys(prevWishlistItems).length) {
            this.changeHeaderState();
        }

        if (!isSignedIn) {
            this.changeHeaderState('default');
        }
    }

    getMyWishlistHeaderTitle = () => {
        const { wishlistItems } = this.props;

        const { length } = Object.keys(wishlistItems);

        return `${ length } ${ length === 1 ? __('item') : __('items') }`;
    };

    onSignOut() {
        const { toggleOverlayByKey } = this.props;
        this.setState({ activeTab: DASHBOARD });
        toggleOverlayByKey(CUSTOMER_ACCOUNT);
    }

    onSignIn() {
        const {
            requestCustomerData,
            isSignedIn
        } = this.props;

        if (isSignedIn) {
            requestCustomerData();
        }

        this.changeHeaderState();
    }

    changeWishlistHeaderState(hiddenElements) {
        const { changeHeaderState } = this.props;
        const { isEditingActive } = this.state;
        const { [MY_WISHLIST]: { headerTitle } } = this.tabMap;

        const currentHiddenElements = hiddenElements || [isEditingActive ? 'edit' : 'ok'];

        const handleClick = (isEdit = false) => {
            this.setState({ isEditingActive: isEdit });

            const hiddenElements = [isEdit ? 'edit' : 'ok'];

            this.changeWishlistHeaderState(hiddenElements);
        };

        changeHeaderState({
            title: headerTitle(),
            name: CUSTOMER_WISHLIST,
            onEditClick: () => handleClick(true),
            onOkClick: () => handleClick(),
            hiddenElements: currentHiddenElements,
            shouldNotGoToPrevState: true
        });
    }

    changeDefaultHeaderState() {
        const { changeHeaderState } = this.props;

        changeHeaderState({
            title: 'My account',
            name: CUSTOMER_ACCOUNT_PAGE,
            onBackClick: () => history.push(appendWithStoreCode('/'))
        });
    }

    changeHeaderState(activeTabParam) {
        const { activeTab: activeTabState } = this.state;
        const activeTab = activeTabParam || activeTabState;

        if (activeTab !== MY_WISHLIST) {
            this.changeDefaultHeaderState();

            return;
        }

        this.changeWishlistHeaderState();
    }

    changeActiveTab(activeTab) {
        const { history } = this.props;
        const { [activeTab]: { url } } = this.tabMap;

        history.push(appendWithStoreCode(`${ MY_ACCOUNT_URL }${ url }`));
        this.changeHeaderState(activeTab);
    }

    updateBreadcrumbs() {
        const { updateBreadcrumbs } = this.props;
        const { activeTab } = this.state;
        const { url, name } = this.tabMap[activeTab];

        updateBreadcrumbs([
            { url: `${ MY_ACCOUNT_URL }${ url }`, name },
            { name: __('My Account'), url: `${ MY_ACCOUNT_URL }/${ DASHBOARD }` }
        ]);
    }

    redirectIfNotSignedIn() {
        const {
            isSignedIn,
            history,
            location: { pathname },
            device
        } = this.props;

        if (isSignedIn) { // do nothing for signed-in users
            return;
        }

        if (device.isMobile) { // do not redirect on mobile
            return;
        }

        if (pathname === '/forgot-password') { // forward the forgot password state
            history.push({ pathname: appendWithStoreCode('/'), state: { isForgotPassword: true } });
            return;
        }

        history.push({ pathname: appendWithStoreCode('/') });
    }

    render() {
        return (
            <MyAccount
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              tabMap={ this.tabMap }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountContainer);
