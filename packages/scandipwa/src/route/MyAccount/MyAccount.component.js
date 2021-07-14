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
import { Component, lazy, Suspense } from 'react';

import ContentWrapper from 'Component/ContentWrapper';
import Loader from 'Component/Loader/Loader.component';
import MyAccountOverlay from 'Component/MyAccountOverlay';
import MyAccountTabList from 'Component/MyAccountTabList';
import {
    activeTabType,
    ADDRESS_BOOK,
    DASHBOARD,
    MY_DOWNLOADABLE,
    MY_ORDERS,
    MY_WISHLIST,
    NEWSLETTER_SUBSCRIPTION,
    tabMapType
} from 'Type/Account';
import { isSignedIn } from 'Util/Auth';

import './MyAccount.style';

export const MyAccountAddressBook = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-address" */
    'Component/MyAccountAddressBook'
));
export const MyAccountDashboard = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-dashboard" */
    'Component/MyAccountDashboard'
));
export const MyAccountDownloadable = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-downloadable" */
    'Component/MyAccountDownloadable'
));
export const MyAccountMyOrders = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-orders" */
    'Component/MyAccountMyOrders'
));
export const MyAccountMyWishlist = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-wishlist" */
    'Component/MyAccountMyWishlist'
));
export const MyAccountNewsletterSubscription = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "account-newsletter" */
    'Component/MyAccountNewsletterSubscription'
));

/** @namespace Route/MyAccount/Component */
export class MyAccount extends Component {
    static propTypes = {
        activeTab: activeTabType.isRequired,
        tabMap: tabMapType.isRequired,
        changeActiveTab: PropTypes.func.isRequired,
        onSignIn: PropTypes.func.isRequired,
        onSignOut: PropTypes.func.isRequired,
        isEditingActive: PropTypes.bool.isRequired,
        subHeading: PropTypes.func.isRequired
    };

    renderMap = {
        [DASHBOARD]: MyAccountDashboard,
        [MY_ORDERS]: MyAccountMyOrders,
        [MY_WISHLIST]: MyAccountMyWishlist,
        [ADDRESS_BOOK]: MyAccountAddressBook,
        [NEWSLETTER_SUBSCRIPTION]: MyAccountNewsletterSubscription,
        [MY_DOWNLOADABLE]: MyAccountDownloadable
    };

    shouldComponentUpdate(nextProps) {
        const { activeTab } = this.props;
        const { activeTab: nextActiveTab } = nextProps;

        return activeTab !== nextActiveTab;
    }

    renderLoginOverlay() {
        const { onSignIn } = this.props;

        return (
            <MyAccountOverlay
              onSignIn={ onSignIn }
            />
        );
    }

    renderSubHeading() {
        const { subHeading } = this.props;

        if (!subHeading) {
            return null;
        }

        return <span block="MyAccount" elem="SubHeading">{ subHeading }</span>;
    }

    renderContent() {
        const {
            activeTab,
            tabMap,
            changeActiveTab,
            onSignOut,
            isEditingActive
        } = this.props;

        if (!isSignedIn()) {
            return this.renderLoginOverlay();
        }

        const TabContent = this.renderMap[activeTab];
        const { name } = tabMap[activeTab];

        return (
            <ContentWrapper
              label={ __('My Account page') }
              wrapperMix={ { block: 'MyAccount', elem: 'Wrapper' } }
            >
                <MyAccountTabList
                  tabMap={ tabMap }
                  activeTab={ activeTab }
                  changeActiveTab={ changeActiveTab }
                  onSignOut={ onSignOut }
                />
                <div block="MyAccount" elem="TabContent">
                    <h2 block="MyAccount" elem="Heading">
                        { name }
                        { this.renderSubHeading() }
                    </h2>
                    <Suspense fallback={ <Loader /> }>
                        <TabContent isEditingActive={ isEditingActive } />
                    </Suspense>
                </div>
            </ContentWrapper>
        );
    }

    render() {
        return (
            <main block="MyAccount">
                { this.renderContent() }
            </main>
        );
    }
}

export default MyAccount;
