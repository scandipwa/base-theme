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
import { withRouter } from 'react-router';

import { CUSTOMER_ACCOUNT_OVERLAY_KEY } from 'Component/MyAccountOverlay/MyAccountOverlay.config';
import { DEFAULT_STATE_NAME } from 'Component/NavigationAbstract/NavigationAbstract.config';
import { NavigationAbstractContainer } from 'Component/NavigationAbstract/NavigationAbstract.container';
import { SHARE_WISHLIST_POPUP_ID } from 'Component/ShareWishlistPopup/ShareWishlistPopup.config';
import { CHECKOUT_URL } from 'Route/Checkout/Checkout.config';
import { CUSTOMER } from 'Store/MyAccount/MyAccount.dispatcher';
import { changeNavigationState, goToPreviousNavigationState } from 'Store/Navigation/Navigation.action';
import { TOP_NAVIGATION_TYPE } from 'Store/Navigation/Navigation.reducer';
import { hideActiveOverlay, toggleOverlayByKey } from 'Store/Overlay/Overlay.action';
import { showPopup } from 'Store/Popup/Popup.action';
import { DeviceType } from 'Type/Device';
import { isSignedIn } from 'Util/Auth';
import BrowserDatabase from 'Util/BrowserDatabase/BrowserDatabase';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import Header from './Header.component';
import {
    CART,
    CART_OVERLAY, CATEGORY,
    CHECKOUT, CHECKOUT_ACCOUNT, CHECKOUT_SUCCESS,
    CMS_PAGE, CONTACT_US, CUSTOMER_ACCOUNT,
    CUSTOMER_ACCOUNT_PAGE, CUSTOMER_SUB_ACCOUNT,
    MENU, PDP,
    SEARCH
} from './Header.config';

/** @namespace Component/Header/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    navigationState: state.NavigationReducer[TOP_NAVIGATION_TYPE].navigationState,
    cartTotals: state.CartReducer.cartTotals,
    header_logo_src: state.ConfigReducer.header_logo_src,
    isOffline: state.OfflineReducer.isOffline,
    logo_alt: state.ConfigReducer.logo_alt,
    logo_height: state.ConfigReducer.logo_height,
    logo_width: state.ConfigReducer.logo_width,
    isLoading: state.ConfigReducer.isLoading,
    device: state.ConfigReducer.device,
    activeOverlay: state.OverlayReducer.activeOverlay,
    isWishlistLoading: state.WishlistReducer.isLoading
});

/** @namespace Component/Header/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showOverlay: (overlayKey) => dispatch(toggleOverlayByKey(overlayKey)),
    hideActiveOverlay: () => dispatch(hideActiveOverlay()),
    setNavigationState: (stateName) => dispatch(changeNavigationState(TOP_NAVIGATION_TYPE, stateName)),
    showPopup: (payload) => dispatch(showPopup(SHARE_WISHLIST_POPUP_ID, payload)),
    goToPreviousNavigationState: () => dispatch(goToPreviousNavigationState(TOP_NAVIGATION_TYPE))
});

export const DEFAULT_HEADER_STATE = {
    name: DEFAULT_STATE_NAME,
    isHiddenOnMobile: false
};

/** @namespace Component/Header/Container */
export class HeaderContainer extends NavigationAbstractContainer {
    static propTypes = {
        showOverlay: PropTypes.func.isRequired,
        isWishlistLoading: PropTypes.bool.isRequired,
        showPopup: PropTypes.func.isRequired,
        goToPreviousNavigationState: PropTypes.func.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired,
        header_logo_src: PropTypes.string,
        device: DeviceType.isRequired
    };

    static defaultProps = {
        header_logo_src: ''
    };

    default_state = DEFAULT_HEADER_STATE;

    routeMap = {
        // eslint-disable-next-line max-len
        '/account/confirm': { name: CMS_PAGE, title: __('Confirm account'), onBackClick: () => history.push(appendWithStoreCode('/')) },
        '/category': { name: CATEGORY },
        '/checkout/success': { name: CHECKOUT_SUCCESS },
        '/checkout': { name: CHECKOUT, onBackClick: () => history.push(appendWithStoreCode('/cart')) },
        '/my-account': { name: CUSTOMER_ACCOUNT_PAGE, onBackClick: () => history.push(appendWithStoreCode('/')) },
        '/product': { name: PDP, onBackClick: () => history.goBack() },
        '/cart': { name: CART },
        '/menu': { name: MENU },
        '/page': { name: CMS_PAGE, onBackClick: () => history.goBack() },
        '/contact': { name: CONTACT_US, onBackClick: () => history.goBack() },
        '/': { name: DEFAULT_STATE_NAME, isHiddenOnMobile: true }
    };

    containerFunctions = {
        onBackButtonClick: this.onBackButtonClick.bind(this),
        onCloseButtonClick: this.onCloseButtonClick.bind(this),
        onSearchBarFocus: this.onSearchBarFocus.bind(this),
        onClearSearchButtonClick: this.onClearSearchButtonClick.bind(this),
        onMyAccountButtonClick: this.onMyAccountButtonClick.bind(this),
        onSearchBarChange: this.onSearchBarChange.bind(this),
        onEditButtonClick: this.onEditButtonClick.bind(this),
        onMinicartButtonClick: this.onMinicartButtonClick.bind(this),
        onOkButtonClick: this.onOkButtonClick.bind(this),
        onCancelButtonClick: this.onCancelButtonClick.bind(this),
        onSearchOutsideClick: this.onSearchOutsideClick.bind(this),
        onMyAccountOutsideClick: this.onMyAccountOutsideClick.bind(this),
        onMinicartOutsideClick: this.onMinicartOutsideClick.bind(this),
        onSignIn: this.onSignIn.bind(this),
        shareWishlist: this.shareWishlist.bind(this),
        hideActiveOverlay: this.props.hideActiveOverlay
    };

    containerProps = () => {
        const {
            activeOverlay,
            navigationState,
            cartTotals,
            header_logo_src,
            logo_alt,
            logo_height,
            logo_width,
            isLoading,
            device,
            isWishlistLoading
        } = this.props;

        const {
            isClearEnabled,
            searchCriteria,
            showMyAccountLogin
        } = this.state;

        const {
            location: {
                pathname
            }
        } = history;

        const isCheckout = pathname.includes(CHECKOUT_URL);

        return {
            activeOverlay,
            navigationState,
            cartTotals,
            header_logo_src,
            logo_alt,
            logo_height,
            logo_width,
            isLoading,
            isClearEnabled,
            searchCriteria,
            isCheckout,
            showMyAccountLogin,
            device,
            isWishlistLoading,
            firstname: this.getUserName()
        };
    };

    __construct(props) {
        super.__construct(props);

        this.state = {
            prevPathname: '',
            searchCriteria: '',
            isClearEnabled: this.getIsClearEnabled(),
            showMyAccountLogin: false
        };
    }

    componentDidMount() {
        this.handleHeaderVisibility();
        super.componentDidMount();
    }

    componentDidUpdate(prevProps) {
        this.hideSearchOnStateChange(prevProps);
        this.handleHeaderVisibility();
    }

    shareWishlist() {
        const { showPopup } = this.props;
        showPopup({ title: __('Share Wishlist') });
    }

    getNavigationState() {
        const { navigationState } = this.props;

        const { pathname } = location;
        const { state: historyState } = window.history || {};
        const { state = {} } = historyState || {};

        // TODO: something here breaks /<STORE CODE> from being opened, and / when, the url-based stores are enabled.

        const activeRoute = Object.keys(this.routeMap)
            .find((route) => (
                route !== '/'
                || pathname === appendWithStoreCode('/')
                || pathname === '/'
            ) && pathname.includes(route));

        if (state.category || state.product || state.page || state.popupOpen) { // keep state if it category is in state
            return navigationState;
        }

        return this.routeMap[activeRoute] || this.default_state;
    }

    getUserName() {
        const { firstname } = BrowserDatabase.getItem(CUSTOMER) || {};

        return firstname;
    }

    hideSearchOnStateChange(prevProps) {
        const { navigationState: { name: prevName } } = prevProps;
        const { navigationState: { name } } = this.props;

        if (prevName === SEARCH && prevName !== name) {
            this.hideSearchOverlay();
        }
    }

    hideSearchOverlay() {
        const { hideActiveOverlay, activeOverlay } = this.props;

        this.setState({ searchCriteria: '' });

        document.activeElement.blur();

        if (activeOverlay === SEARCH) {
            hideActiveOverlay();
        }
    }

    handleHeaderVisibility() {
        const { navigationState: { isHiddenOnMobile } } = this.props;

        if (isHiddenOnMobile) {
            document.documentElement.classList.add('hiddenHeader');

            return;
        }

        document.documentElement.classList.remove('hiddenHeader');
    }

    handleMobileUrlChange(history) {
        const { prevPathname } = this.state;
        const { pathname } = history;
        const isClearEnabled = this.getIsClearEnabled();

        if (prevPathname === pathname) {
            return { isClearEnabled };
        }

        return {
            isClearEnabled,
            showMyAccountLogin: false
        };
    }

    getIsClearEnabled() {
        const { location: { search } } = history;

        return new RegExp([
            'customFilters',
            'priceMax',
            'priceMin'
        ].join('|')).test(search);
    }

    onBackButtonClick(e) {
        const { navigationState: { onBackClick } } = this.props;

        this.setState({ searchCriteria: '' });

        if (onBackClick) {
            onBackClick(e);
        }
    }

    onCloseButtonClick(e) {
        const { hideActiveOverlay, goToPreviousNavigationState } = this.props;
        const { navigationState: { onCloseClick } } = this.props;

        this.setState({ searchCriteria: '' });

        if (onCloseClick) {
            onCloseClick(e);
        }

        hideActiveOverlay();
        goToPreviousNavigationState();
    }

    onSearchOutsideClick() {
        const {
            goToPreviousNavigationState,
            navigationState: { name }
        } = this.props;

        if (name === SEARCH) {
            this.hideSearchOverlay();
            goToPreviousNavigationState();
        }
    }

    onSearchBarFocus() {
        const {
            setNavigationState,
            goToPreviousNavigationState,
            showOverlay,
            navigationState: { name },
            device
        } = this.props;

        if (
            (!device.isMobile && name === SEARCH)
            || (device.isMobile && name !== MENU)
        ) {
            return;
        }

        showOverlay(SEARCH);

        setNavigationState({
            name: SEARCH,
            onBackClick: () => {
                showOverlay(MENU);
                goToPreviousNavigationState();
            }
        });
    }

    onSearchBarChange({ target: { value: searchCriteria } }) {
        this.setState({ searchCriteria });
    }

    onClearSearchButtonClick() {
        this.setState({ searchCriteria: '' });
    }

    onMyAccountButtonClick() {
        const {
            showOverlay,
            setNavigationState
        } = this.props;

        if (isSignedIn()) {
            history.push({ pathname: appendWithStoreCode('/my-account/dashboard') });

            return;
        }

        this.setState({ showMyAccountLogin: true }, () => {
            showOverlay(CUSTOMER_ACCOUNT_OVERLAY_KEY);
            setNavigationState({
                name: CHECKOUT_ACCOUNT,
                title: 'Sign in',
                onCloseClick: this.closeOverlay
            });
        });
    }

    onMyAccountOutsideClick() {
        const {
            goToPreviousNavigationState,
            hideActiveOverlay,
            navigationState: { name },
            device
        } = this.props;

        if (device.isMobile || ![CUSTOMER_ACCOUNT, CUSTOMER_SUB_ACCOUNT, CHECKOUT_ACCOUNT].includes(name)) {
            return;
        }

        if (name === CUSTOMER_SUB_ACCOUNT) {
            goToPreviousNavigationState();
        }

        this.goToDefaultHeaderState();
        hideActiveOverlay();
    }

    closeOverlay = () => {
        const { location: { pathname } } = history;

        if (pathname.includes(CHECKOUT_URL)) {
            this.setState({ showMyAccountLogin: false });
        }
    };

    onSignIn() {
        const { location: { pathname } } = history;

        if (pathname.includes(CHECKOUT_URL)) {
            this.setState({ showMyAccountLogin: false });
        }
    }

    onMinicartButtonClick() {
        const {
            showOverlay,
            navigationState: { name },
            device
        } = this.props;

        if (name === CART_OVERLAY) {
            return;
        }

        if (!device.isMobile) {
            this.setState({ shouldRenderCartOverlay: true });

            showOverlay(CART_OVERLAY);

            return;
        }

        history.push(appendWithStoreCode(`/${ CART }`));
    }

    onMinicartOutsideClick() {
        const {
            goToPreviousNavigationState,
            hideActiveOverlay,
            navigationState: { name },
            device
        } = this.props;

        if (device.isMobile || name !== CART_OVERLAY) {
            return;
        }

        goToPreviousNavigationState();
        hideActiveOverlay();
    }

    onEditButtonClick(e) {
        const { navigationState: { onEditClick } } = this.props;

        if (onEditClick) {
            onEditClick(e);
        }
    }

    onOkButtonClick(e) {
        const {
            navigationState: { onOkClick, shouldNotGoToPrevState = false },
            goToPreviousNavigationState
        } = this.props;

        if (onOkClick) {
            onOkClick(e);
        }

        if (!shouldNotGoToPrevState) {
            goToPreviousNavigationState();
        }
    }

    onCancelButtonClick() {
        const {
            navigationState: { onCancelClick },
            goToPreviousNavigationState
        } = this.props;

        if (onCancelClick) {
            onCancelClick();
        }

        goToPreviousNavigationState();
    }

    render() {
        return (
            <Header
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderContainer));
