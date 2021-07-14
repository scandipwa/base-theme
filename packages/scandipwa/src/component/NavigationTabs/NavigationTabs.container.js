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

import { connect } from 'react-redux';

import { CART, MY_ACCOUNT } from 'Component/Header/Header.config';
import { NavigationAbstractContainer } from 'Component/NavigationAbstract/NavigationAbstract.container';
import {
    ACCOUNT_LOGIN_URL
} from 'Route/MyAccount/MyAccount.config';
import { changeNavigationState, goToPreviousNavigationState } from 'Store/Navigation/Navigation.action';
import { BOTTOM_NAVIGATION_TYPE, TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { hideActiveOverlay, toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import { isSignedIn } from 'Util/Auth';
import browserHistory from 'Util/History';
import { debounce } from 'Util/Request';
import { appendWithStoreCode } from 'Util/Url';

import NavigationTabs from './NavigationTabs.component';
import {
    ACCOUNT_TAB,
    CART_TAB,
    CHECKOUT_TAB, HOME_TAB,
    MENU_TAB
} from './NavigationTabs.config';

/** @namespace Component/NavigationTabs/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    navigationState: state.NavigationReducer[BOTTOM_NAVIGATION_TYPE].navigationState,
    headerState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
    device: state.ConfigReducer.device,
    cartTotals: state.CartReducer.cartTotals,
    noMatch: state.NoMatchReducer.noMatch
});

/** @namespace Component/NavigationTabs/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
    hideActiveOverlay: () => dispatch(hideActiveOverlay()),
    setNavigationState: (stateName) => dispatch(changeNavigationState(BOTTOM_NAVIGATION_TYPE, stateName)),
    goToPreviousHeaderState: () => dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE)),
    goToPreviousNavigationState: () => dispatch(goToPreviousNavigationState(BOTTOM_NAVIGATION_TYPE))
});

export const DEFAULT_NAVIGATION_TABS_STATE = { name: MENU_TAB };

/** @namespace Component/NavigationTabsContainer/Container */
export class NavigationTabsContainer extends NavigationAbstractContainer {
    default_state = DEFAULT_NAVIGATION_TABS_STATE;

    scrollPosition = 0;

    routeMap = {
        '/account': { name: ACCOUNT_TAB },
        '/my-account': { name: ACCOUNT_TAB },
        '/checkout': { name: CHECKOUT_TAB },
        '/cart': { name: CART_TAB },
        '/': { name: HOME_TAB },
        '': { name: HOME_TAB }
    };

    containerFunctions = {
        onMenuButtonClick: this.onMenuButtonClick.bind(this),
        onMyAccountButtonClick: this.onMyAccountButtonClick.bind(this),
        onMinicartButtonClick: this.onMinicartButtonClick.bind(this),
        onHomeButtonClick: this.onHomeButtonClick.bind(this)
    };

    componentDidMount() {
        this.handleNavVisibility();

        const SCROLL_DEBOUNCE_DELAY = 10;
        const { name } = this.getNavigationState();
        this.lastSeenMenu = name === MENU_TAB ? 0 : -1;
        window.addEventListener('scroll', debounce(this.handleScroll, SCROLL_DEBOUNCE_DELAY));

        super.componentDidMount();
    }

    componentDidUpdate(prevProps) {
        this.handleNavVisibility();
        this.handleVisibleOnScrollChange(prevProps);
    }

    handleNavVisibility() {
        const { navigationState: { isHidden } } = this.props;

        if (isHidden) {
            document.documentElement.classList.add('hiddenNavigationTabs');

            return;
        }

        document.documentElement.classList.remove('hiddenNavigationTabs');
    }

    handleVisibleOnScrollChange(prevProps) {
        const { navigationState: { isVisibleOnScroll } } = this.props;
        const { navigationState: { isVisibleOnScroll: prevIsVisible } } = prevProps;

        if (isVisibleOnScroll !== prevIsVisible) {
            this.scrollPosition = window.pageYOffset;
            document.documentElement.classList.remove('hideOnScroll');
        }
    }

    handleNavVisibilityOnScroll(windowY) {
        const ERROR_TOP_OFFSET = 10;
        const ERROR_BOTTOM_OFFSET = 20;
        const TOP_MIN_OFFSET = 100;

        const doc = document.body;
        const offset = window.innerHeight + window.pageYOffset;
        const height = doc.scrollHeight;

        if (windowY < TOP_MIN_OFFSET) {
            // We are on top
            document.documentElement.classList.remove('hideOnScroll');

            return;
        }

        if (offset >= (height - ERROR_BOTTOM_OFFSET)) {
            // We are on the bottom
            document.documentElement.classList.remove('hideOnScroll');

            return;
        }

        // Scroll is less then min offset
        if (Math.abs(windowY - this.scrollPosition) < ERROR_TOP_OFFSET) {
            return;
        }

        if (windowY < this.scrollPosition) {
            // Scrolling UP
            document.documentElement.classList.remove('hideOnScroll');
        } else {
            // Scrolling DOWN
            document.documentElement.classList.add('hideOnScroll');
        }
    }

    handleScroll = () => {
        const { navigationState: { isVisibleOnScroll } } = this.props;
        if (!isVisibleOnScroll) {
            return;
        }

        const windowY = window.pageYOffset;
        this.handleNavVisibilityOnScroll(windowY);
        this.scrollPosition = windowY;
    };

    onMenuButtonClick() {
        const { navigationState: { name } } = this.props;

        // TODO: resolve issue when coming from CMS page

        if (name === MENU_TAB) { // if we already are in menu
            browserHistory.push(appendWithStoreCode('/menu'));
        } else if (this.lastSeenMenu <= 0) { // if we have not yet seen menu
            browserHistory.push(appendWithStoreCode('/menu'));
        } else { // otherwise go to last remembered category
            browserHistory.go(-this.lastSeenMenu);
        }

        this.lastSeenMenu = 0;
    }

    onMinicartButtonClick() {
        const { pathname } = location;

        if (pathname !== appendWithStoreCode(`/${ CART }`)) {
            browserHistory.push(appendWithStoreCode(`/${ CART }`));
        }
    }

    onMyAccountButtonClick() {
        const { pathname } = location;
        const url = appendWithStoreCode(isSignedIn() ? `/${ MY_ACCOUNT }` : ACCOUNT_LOGIN_URL);

        if (pathname !== url) {
            browserHistory.push(url);
        }
    }

    preserveState(name, newName) {
        const { noMatch } = this.props;

        if (noMatch) {
            this.lastSeenMenu = -1;

            return;
        }

        if (this.lastSeenMenu === -1) {
            return;
        }

        if (newName !== MENU_TAB) {
            this.lastSeenMenu++;
        }

        if (newName === MENU_TAB && name === MENU_TAB) {
            this.lastSeenMenu = 0;
        }
    }

    handleMobileRouteChange(history) {
        const {
            setNavigationState,
            navigationState: { name }
        } = this.props;

        const { pathname } = history;

        // Find the new state name
        const newNavigationState = this.getNavigationState();
        const { name: newName } = newNavigationState;

        // Update the state if new name is set
        if (name !== newName) {
            setNavigationState(newNavigationState);
        }

        this.preserveState(name, newName);

        return { prevPathname: pathname };
    }

    onHomeButtonClick() {
        const {
            hideActiveOverlay
        } = this.props;

        const { pathname } = location;

        browserHistory.push(appendWithStoreCode('/'));
        hideActiveOverlay();

        if (
            pathname === appendWithStoreCode('/')
            || pathname === '/'
        ) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    render() {
        return (
            <NavigationTabs
              { ...this.props }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationTabsContainer);
