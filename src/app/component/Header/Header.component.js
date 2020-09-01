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

import './Header.style';

import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';

import ClickOutside from 'Component/ClickOutside';
import CmsBlock from 'Component/CmsBlock';
import Link from 'Component/Link';
import Logo from 'Component/Logo';
import Menu from 'Component/Menu';
import { CUSTOMER_ACCOUNT_OVERLAY_KEY } from 'Component/MyAccountOverlay/MyAccountOverlay.config';
import NavigationAbstract from 'Component/NavigationAbstract/NavigationAbstract.component';
import { DEFAULT_STATE_NAME } from 'Component/NavigationAbstract/NavigationAbstract.config';
import OfflineNotice from 'Component/OfflineNotice';
import PopupSuspense from 'Component/PopupSuspense';
import SearchField from 'Component/SearchField';
import StoreSwitcher from 'Component/StoreSwitcher';
import { TotalsType } from 'Type/MiniCart';
import { isSignedIn } from 'Util/Auth';
import media from 'Util/Media';
import { LOGO_MEDIA } from 'Util/Media/Media';
import isMobile from 'Util/Mobile';

import {
    CART,
    CART_EDITING,
    CART_OVERLAY,
    CATEGORY,
    CHECKOUT,
    CHECKOUT_ACCOUNT,
    CMS_PAGE,
    CUSTOMER_ACCOUNT,
    CUSTOMER_ACCOUNT_PAGE,
    CUSTOMER_SUB_ACCOUNT,
    FILTER,
    MENU,
    MENU_SUBCATEGORY,
    PDP,
    POPUP,
    SEARCH
} from './Header.config';

export const CartOverlay = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "cart" */ 'Component/CartOverlay'));
export const MyAccountOverlay = lazy(() => import(/* webpackMode: "lazy", webpackChunkName: "account" */ 'Component/MyAccountOverlay'));

export class Header extends NavigationAbstract {
    static propTypes = {
        navigationState: PropTypes.object.isRequired,
        cartTotals: TotalsType.isRequired,
        onBackButtonClick: PropTypes.func.isRequired,
        onCloseButtonClick: PropTypes.func.isRequired,
        onSearchBarFocus: PropTypes.func.isRequired,
        onClearSearchButtonClick: PropTypes.func.isRequired,
        onMyAccountButtonClick: PropTypes.func.isRequired,
        onSearchBarChange: PropTypes.func.isRequired,
        onClearButtonClick: PropTypes.func.isRequired,
        onEditButtonClick: PropTypes.func.isRequired,
        onMinicartButtonClick: PropTypes.func.isRequired,
        onOkButtonClick: PropTypes.func.isRequired,
        onCancelButtonClick: PropTypes.func.isRequired,
        onSearchOutsideClick: PropTypes.func.isRequired,
        onMyAccountOutsideClick: PropTypes.func.isRequired,
        onMinicartOutsideClick: PropTypes.func.isRequired,
        isClearEnabled: PropTypes.bool.isRequired,
        searchCriteria: PropTypes.string.isRequired,
        header_logo_src: PropTypes.string,
        logo_alt: PropTypes.string,
        isLoading: PropTypes.bool,
        showMyAccountLogin: PropTypes.bool,
        isCheckout: PropTypes.bool.isRequired,
        onSignIn: PropTypes.func.isRequired,
        hideActiveOverlay: PropTypes.func.isRequired
    };

    static defaultProps = {
        logo_alt: 'ScandiPWA logo',
        showMyAccountLogin: false,
        header_logo_src: '',
        isLoading: true
    };

    stateMap = {
        [DEFAULT_STATE_NAME]: {
            title: true,
            logo: true
        },
        [POPUP]: {
            title: true,
            close: true
        },
        [PDP]: {
            back: true,
            title: true
        },
        [CATEGORY]: {
            back: true,
            title: true
        },
        [CUSTOMER_ACCOUNT]: {
            title: true
        },
        [CUSTOMER_SUB_ACCOUNT]: {
            title: true,
            back: true
        },
        [CUSTOMER_ACCOUNT_PAGE]: {
            title: true
        },
        [MENU]: {
            search: true
        },
        [MENU_SUBCATEGORY]: {
            back: true,
            title: true
        },
        [SEARCH]: {
            back: true,
            search: true
        },
        [CART]: {
            title: true
        },
        [CART_OVERLAY]: {
            title: true,
            edit: true
        },
        [CART_EDITING]: {
            ok: true,
            title: true,
            cancel: true
        },
        [FILTER]: {
            close: true,
            clear: true,
            title: true
        },
        [CHECKOUT]: {
            back: true,
            title: true,
            account: true
        },
        [CHECKOUT_ACCOUNT]: {
            title: true,
            close: true
        },
        [CMS_PAGE]: {
            back: true,
            title: true
        }
    };

    renderMap = {
        cancel: this.renderCancelButton.bind(this),
        back: this.renderBackButton.bind(this),
        close: this.renderCloseButton.bind(this),
        title: this.renderTitle.bind(this),
        logo: this.renderLogo.bind(this),
        account: this.renderAccount.bind(this),
        minicart: this.renderMinicart.bind(this),
        search: this.renderSearchField.bind(this),
        clear: this.renderClearButton.bind(this),
        edit: this.renderEditButton.bind(this),
        ok: this.renderOkButton.bind(this)
    };

    renderBackButton(isVisible = false) {
        const { onBackButtonClick } = this.props;

        return (
            <button
              key="back"
              block="Header"
              elem="Button"
              mods={ { type: 'back', isVisible } }
              onClick={ onBackButtonClick }
              aria-label="Go back"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            />
        );
    }

    renderCloseButton(isVisible = false) {
        const { onCloseButtonClick } = this.props;

        return (
            <button
              key="close"
              block="Header"
              elem="Button"
              mods={ { type: 'close', isVisible } }
              onClick={ onCloseButtonClick }
              aria-label="Close"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            />
        );
    }

    renderMenu() {
        const { isCheckout } = this.props;

        if (isMobile.any() || isCheckout) {
            return null;
        }

        return <Menu />;
    }

    renderSearchField(isVisible = false) {
        const {
            searchCriteria,
            onSearchOutsideClick,
            onSearchBarFocus,
            onSearchBarChange,
            onClearSearchButtonClick,
            navigationState: { name },
            isCheckout,
            hideActiveOverlay
        } = this.props;

        if (isCheckout) {
            return null;
        }

        return (
            <SearchField
              key="search"
              searchCriteria={ searchCriteria }
              onSearchOutsideClick={ onSearchOutsideClick }
              onSearchBarFocus={ onSearchBarFocus }
              onSearchBarChange={ onSearchBarChange }
              onClearSearchButtonClick={ onClearSearchButtonClick }
              isVisible={ isVisible }
              isActive={ name === SEARCH }
              hideActiveOverlay={ hideActiveOverlay }
            />
        );
    }

    renderTitle(isVisible = false) {
        const { navigationState: { title } } = this.props;

        return (
            <h2
              key="title"
              block="Header"
              elem="Title"
              mods={ { isVisible } }
            >
                { title }
            </h2>
        );
    }

    renderLogoImage() {
        const {
            header_logo_src,
            logo_alt
        } = this.props;

        return (
            <Logo
              src={ media(header_logo_src, LOGO_MEDIA) }
              alt={ logo_alt }
            />
        );
    }

    renderLogo(isVisible = false) {
        const { isLoading } = this.props;

        if (isLoading) {
            return null;
        }

        return (
            <Link
              to="/"
              aria-label="Go to homepage by clicking on ScandiPWA logo"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
              block="Header"
              elem="LogoWrapper"
              mods={ { isVisible } }
              key="logo"
            >
                { this.renderLogoImage() }
            </Link>
        );
    }

    renderAccountOverlayFallback() {
        return (
            <PopupSuspense
              actualOverlayKey={ CUSTOMER_ACCOUNT_OVERLAY_KEY }
            />
        );
    }

    renderAccountOverlay() {
        const {
            isCheckout,
            showMyAccountLogin,
            onSignIn
        } = this.props;

        // This is here to prevent the popup-suspense from rendering
        if (!showMyAccountLogin) {
            return null;
        }

        return (
            <Suspense fallback={ this.renderAccountOverlayFallback() }>
                <MyAccountOverlay
                  onSignIn={ onSignIn }
                  isCheckout={ isCheckout }
                />
            </Suspense>
        );
    }

    renderAccountButton(isVisible) {
        const {
            onMyAccountButtonClick
        } = this.props;

        return (
            <button
              block="Header"
              elem="MyAccountWrapper"
              tabIndex="0"
              onClick={ onMyAccountButtonClick }
              aria-label="Open my account"
              id="myAccount"
            >
                <div
                  block="Header"
                  elem="MyAccountTitle"
                >
                    { __('Account') }
                </div>
                <div
                  block="Header"
                  elem="Button"
                  mods={ { isVisible, type: 'account' } }
                />
            </button>
        );
    }

    renderAccount(isVisible = false) {
        const {
            onMyAccountOutsideClick,
            isCheckout
        } = this.props;

        // on mobile and tablet hide button if not in checkout
        if ((isMobile.any() || isMobile.tablet()) && !isCheckout) {
            return null;
        }

        if (isCheckout && isSignedIn()) {
            return null;
        }

        return (
            <ClickOutside
              onClick={ onMyAccountOutsideClick }
              key="account"
            >
                <div
                  aria-label="My account"
                  block="Header"
                  elem="MyAccount"
                >
                    { this.renderAccountButton(isVisible) }
                    { this.renderAccountOverlay() }
                </div>
            </ClickOutside>
        );
    }

    renderMinicartItemsQty() {
        const { cartTotals: { items_qty } } = this.props;

        if (!items_qty) {
            return null;
        }

        return (
            <span
              aria-label="Items in cart"
              block="Header"
              elem="MinicartItemCount"
            >
                { items_qty }
            </span>
        );
    }

    renderMinicartOverlayFallback() {
        return (
            <PopupSuspense
              actualOverlayKey={ CART_OVERLAY }
            />
        );
    }

    renderMinicartOverlay() {
        const { shouldRenderCartOverlay } = this.props;

        if (!shouldRenderCartOverlay) {
            return null;
        }

        return (
            <Suspense fallback={ this.renderMinicartOverlayFallback() }>
                <CartOverlay />
            </Suspense>
        );
    }

    renderMinicartButton() {
        const {
            onMinicartButtonClick
        } = this.props;

        return (
            <button
              block="Header"
              elem="MinicartButtonWrapper"
              tabIndex="0"
              onClick={ onMinicartButtonClick }
            >
                <span
                  block="Header"
                  elem="MinicartTitle"
                >
                    { __('Cart') }
                </span>
                <span
                  aria-label="Minicart"
                  block="Header"
                  elem="MinicartIcon"
                />
                { this.renderMinicartItemsQty() }
            </button>
        );
    }

    renderMinicart(isVisible = false) {
        const {
            onMinicartOutsideClick,
            isCheckout
        } = this.props;

        if ((isMobile.any() || isMobile.tablet()) || isCheckout) {
            return null;
        }

        return (
            <ClickOutside
              onClick={ onMinicartOutsideClick }
              key="minicart"
            >
                <div
                  block="Header"
                  elem="Button"
                  mods={ { isVisible, type: 'minicart' } }
                >
                    { this.renderMinicartButton() }
                    { this.renderMinicartOverlay() }
                </div>
            </ClickOutside>
        );
    }

    renderClearButton(isVisible = false) {
        const { isClearEnabled, onClearButtonClick } = this.props;

        return (
            <button
              key="clear"
              block="Header"
              elem="Button"
              mods={ { type: 'clear', isVisible, isDisabled: !isClearEnabled } }
              onClick={ onClearButtonClick }
              aria-label="Clear"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            />
        );
    }

    renderEditButton(isVisible = false) {
        const { onEditButtonClick } = this.props;

        return (
            <button
              key="edit"
              block="Header"
              elem="Button"
              mods={ { type: 'edit', isVisible } }
              onClick={ onEditButtonClick }
              aria-label="Clear"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            />
        );
    }

    renderOkButton(isVisible = false) {
        const { onOkButtonClick } = this.props;

        return (
            <button
              key="ok"
              block="Header"
              elem="Button"
              mods={ { type: 'ok', isVisible } }
              onClick={ onOkButtonClick }
              aria-label="Save changes"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            >
                { __('OK') }
            </button>
        );
    }

    renderCancelButton(isVisible = false) {
        const { onCancelButtonClick } = this.props;

        return (
            <button
              key="cancel"
              block="Header"
              elem="Button"
              mods={ { type: 'cancel', isVisible } }
              onClick={ onCancelButtonClick }
              aria-label="Cancel changes"
              aria-hidden={ !isVisible }
              tabIndex={ isVisible ? 0 : -1 }
            >
                { __('Cancel') }
            </button>
        );
    }

    renderContacts() {
        const { header_content: { contacts_cms } = {} } = window.contentConfiguration;

        if (contacts_cms) {
            return (
                <CmsBlock identifier={ contacts_cms } />
            );
        }

        // following strings are not translated, use CMS blocks to do it
        return (
            <dl block="contacts-wrapper">
                <dt>{ __('Telephone:') }</dt>
                <dd>
                    <a href="tel:983829842">+0 (983) 829842</a>
                </dd>
                <dt>{ __('Mail:') }</dt>
                <dd>
                    <a href="mailto:info@scandipwa.com">info@scandipwa.com</a>
                </dd>
            </dl>
        );
    }

    renderTopMenu() {
        if (isMobile.any()) {
            return null;
        }

        return (
            <div block="Header" elem="TopMenu">
                <div block="Header" elem="Contacts">
                    { this.renderContacts() }
                </div>
                <div block="Header" elem="Switcher">
                    <StoreSwitcher />
                </div>
            </div>
        );
    }

    render() {
        const {
            navigationState: { name, isHiddenOnMobile = false },
            isCheckout
        } = this.props;

        return (
            <>
                <header block="Header" mods={ { name, isHiddenOnMobile, isCheckout } }>
                    { this.renderTopMenu() }
                    <nav block="Header" elem="Nav">
                        { this.renderNavigationState() }
                    </nav>
                    { this.renderMenu() }
                </header>
                <OfflineNotice />
            </>
        );
    }
}

export default Header;
