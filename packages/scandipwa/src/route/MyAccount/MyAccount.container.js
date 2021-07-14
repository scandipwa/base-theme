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
import OrderReducer from 'Store/Order/Order.reducer';
import { toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import {
    ADDRESS_BOOK,
    DASHBOARD, MY_DOWNLOADABLE, MY_ORDERS,
    MY_WISHLIST, NEWSLETTER_SUBSCRIPTION
} from 'Type/Account';
import { HistoryType, LocationType, MatchType } from 'Type/Common';
import { DeviceType } from 'Type/Device';
import { isSignedIn } from 'Util/Auth';
import { withReducers } from 'Util/DynamicReducer';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import MyAccount from './MyAccount.component';
import { MY_ACCOUNT_URL } from './MyAccount.config';

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
    device: state.ConfigReducer.device,
    isWishlistEnabled: state.ConfigReducer.wishlist_general_active,
    wishlistItems: state.WishlistReducer.productsInWishlist,
    isSignedIn: state.MyAccountReducer.isSignedIn,
    newsletterActive: state.ConfigReducer.newsletter_general_active
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
        match: MatchType.isRequired,
        location: LocationType.isRequired,
        history: HistoryType.isRequired,
        device: DeviceType.isRequired,
        wishlistItems: PropTypes.object,
        newsletterActive: PropTypes.bool.isRequired,
        isWishlistEnabled: PropTypes.bool.isRequired,
        isSignedIn: PropTypes.bool.isRequired
    };

    static defaultProps = {
        wishlistItems: {}
    };

    static tabMap = {
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
        [MY_DOWNLOADABLE]: {
            url: '/my-downloadable',
            name: __('My downloadable')
        },
        [MY_WISHLIST]: {
            url: '/my-wishlist',
            name: __('My wishlist')
        },
        [NEWSLETTER_SUBSCRIPTION]: {
            url: '/newsletter-subscription',
            name: __('Newsletter Subscription')
        }
    };

    static isTabEnabled(props, tabName) {
        const { isWishlistEnabled, newsletterActive } = props;

        switch (tabName) {
        case MY_WISHLIST:
            return isWishlistEnabled;
        case NEWSLETTER_SUBSCRIPTION:
            return newsletterActive;
        default:
            return true;
        }
    }

    static navigateToSelectedTab(props, state = {}) {
        const {
            history,
            match: {
                params: {
                    tab: historyActiveTab
                } = {}
            } = {}
        } = props;

        const { activeTab } = state;

        // redirect to Dashboard, if user visited non-existent or disabled page
        const newActiveTab = this.tabMap[historyActiveTab] && this.isTabEnabled(props, historyActiveTab)
            ? historyActiveTab
            : DASHBOARD;

        if (historyActiveTab !== newActiveTab) {
            history.push(appendWithStoreCode(`${ MY_ACCOUNT_URL }/${ newActiveTab }`));
        }

        if (activeTab !== newActiveTab) {
            return { activeTab: newActiveTab };
        }

        return null;
    }

    containerFunctions = {
        changeActiveTab: this.changeActiveTab.bind(this),
        onSignIn: this.onSignIn.bind(this),
        onSignOut: this.onSignOut.bind(this),
        getMyWishlistSubHeading: this.getMyWishlistSubHeading.bind(this)
    };

    subHeadingRenderMap = {
        [MY_WISHLIST]: this.getMyWishlistSubHeading.bind(this)
    };

    __construct(props) {
        super.__construct(props);

        const {
            updateMeta,
            toggleOverlayByKey
        } = this.props;

        this.state = {
            ...MyAccountContainer.navigateToSelectedTab(this.props),
            isEditingActive: false
        };

        if (!isSignedIn()) {
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
        const {
            wishlistItems: prevWishlistItems,
            isSignedIn: prevIsSignedIn
        } = prevProps;
        const {
            wishlistItems,
            isSignedIn: currIsSignedIn
        } = this.props;
        const { activeTab: prevActiveTab } = prevState;
        const { activeTab } = this.state;

        this.redirectIfNotSignedIn();

        if (prevIsSignedIn !== currIsSignedIn) {
            this.changeHeaderState();
        }

        if (prevActiveTab !== activeTab) {
            this.updateBreadcrumbs();
            this.changeHeaderState();
        }

        if (Object.keys(wishlistItems).length !== Object.keys(prevWishlistItems).length) {
            this.changeHeaderState();
        }

        if (!isSignedIn()) {
            this.changeHeaderState('default');
        }
    }

    containerProps = () => ({
        subHeading: this.getSubHeading()
    });

    _getWishlistItemsCount() {
        const { wishlistItems } = this.props;

        const { length } = Object.keys(wishlistItems);

        return length;
    }

    getMyWishlistHeaderTitle = () => {
        const count = this._getWishlistItemsCount();

        return `${ count } ${ count === 1 ? __('item') : __('items') }`;
    };

    getSubHeading() {
        const { activeTab } = this.state;

        const subHeadingFunc = this.subHeadingRenderMap[activeTab];

        if (!subHeadingFunc) {
            return null;
        }

        return subHeadingFunc();
    }

    getMyWishlistSubHeading() {
        const count = this._getWishlistItemsCount();

        return ` (${ count })`;
    }

    tabsFilterEnabled() {
        return Object.fromEntries(Object.entries(MyAccountContainer.tabMap)
            .filter(([k]) => MyAccountContainer.isTabEnabled(this.props, k)));
    }

    onSignOut() {
        const { toggleOverlayByKey } = this.props;
        this.setState({ activeTab: DASHBOARD });
        toggleOverlayByKey(CUSTOMER_ACCOUNT);
        history.push(appendWithStoreCode('/'));
    }

    onSignIn() {
        const { requestCustomerData } = this.props;

        if (isSignedIn()) {
            requestCustomerData();
        }

        this.changeHeaderState();
    }

    changeWishlistHeaderState(hiddenElements) {
        const { changeHeaderState } = this.props;
        const { isEditingActive } = this.state;

        const currentHiddenElements = hiddenElements || [isEditingActive ? 'edit' : 'ok'];

        const handleClick = (isEdit = false) => {
            this.setState({ isEditingActive: isEdit });

            const hiddenElements = [isEdit ? 'edit' : 'ok'];

            this.changeWishlistHeaderState(hiddenElements);
        };

        changeHeaderState({
            title: this.getMyWishlistHeaderTitle(),
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
        const { [activeTab]: { url } } = this.tabsFilterEnabled(MyAccountContainer.tabMap);

        history.push(appendWithStoreCode(`${ MY_ACCOUNT_URL }${ url }`));
        this.changeHeaderState(activeTab);
    }

    updateBreadcrumbs() {
        const { updateBreadcrumbs } = this.props;
        const { activeTab } = this.state;
        const { url, name } = MyAccountContainer.tabMap[activeTab];

        updateBreadcrumbs([
            { url: `${ MY_ACCOUNT_URL }${ url }`, name },
            { name: __('My Account'), url: `${ MY_ACCOUNT_URL }/${ DASHBOARD }` }
        ]);
    }

    redirectIfNotSignedIn() {
        const {
            history,
            location: { pathname },
            device
        } = this.props;

        if (isSignedIn()) { // do nothing for signed-in users
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
              { ...this.containerProps() }
              { ...this.containerFunctions }
              tabMap={ this.tabsFilterEnabled(MyAccountContainer.tabMap) }
            />
        );
    }
}

export default withReducers({
    OrderReducer
})(connect(mapStateToProps, mapDispatchToProps)(MyAccountContainer));
