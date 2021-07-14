/* eslint-disable react/no-unused-prop-types */

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
import { createPortal } from 'react-dom';

import ClickOutside from 'Component/ClickOutside';
import NotificationList from 'Component/NotificationList';
import Overlay from 'Component/Overlay/Overlay.component';
import { DeviceType } from 'Type/Device';

import { ESCAPE_KEY } from './Popup.config';

import './Popup.style';

/** @namespace Component/Popup/Component */
export class Popup extends Overlay {
    static propTypes = {
        ...Overlay.propTypes,
        clickOutside: PropTypes.bool,
        title: PropTypes.string,
        device: DeviceType.isRequired
    };

    static defaultProps = {
        ...Overlay.defaultProps,
        clickOutside: true,
        title: ''
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentDidUpdate(prevProps) {
        const { shouldPopupClose, resetHideActivePopup } = this.props;
        const { shouldPopupClose: prevShouldPopupClose } = prevProps;

        if (shouldPopupClose && shouldPopupClose !== prevShouldPopupClose) {
            this.hidePopUp();
            resetHideActivePopup();
        }

        super.componentDidUpdate(prevProps);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    onVisible() {
        const { onVisible } = this.props;

        this.freezeScroll();
        this.overlayRef.current.focus();

        window.addEventListener('popstate', this.hidePopUp);

        window.history.pushState(
            {
                popupOpen: true
            },
            '',
            `${location.pathname}${location.search}${location.hash}`
        );

        onVisible();
    }

    onHide() {
        const { onHide } = this.props;
        window.removeEventListener('popstate', this.hidePopUp);

        this.unfreezeScroll();

        onHide();
    }

    hidePopUp = () => {
        const { hideActiveOverlay, goToPreviousNavigationState, onClose } = this.props;
        const isVisible = this.getIsVisible();
        if (isVisible) {
            this.unfreezeScroll();
            hideActiveOverlay();
            goToPreviousNavigationState();
            onClose();
        }
    };

    // Same with click outside
    handleClickOutside = () => {
        const { clickOutside } = this.props;
        if (!clickOutside) {
            return;
        }
        this.hidePopUp();
    };

    handleKeyDown = (e) => {
        switch (e.keyCode) {
        case ESCAPE_KEY:
            this.hidePopUp();
            break;
        default:
            break;
        }
    };

    renderTitle() {
        const { title } = this.props;
        if (!title) {
            return null;
        }

        return (
            <h3 block="Popup" elem="Heading">
                { title }
            </h3>
        );
    }

    renderCloseButton() {
        return (
            <button
              block="Popup"
              elem="CloseBtn"
              aria-label={ __('Close') }
              onClick={ this.hidePopUp }
            />
        );
    }

    renderNotifications() {
        const { device: { isMobile } } = this.props;

        if (!isMobile) {
            return null;
        }

        return <NotificationList />;
    }

    renderContent() {
        const { children, contentMix } = this.props;
        const isVisible = this.getIsVisible();

        if (!isVisible) {
            return null;
        }

        return (
            <ClickOutside onClick={ this.handleClickOutside }>
                <div block="Popup" elem="Content" mix={ contentMix }>
                    <header block="Popup" elem="Header">
                        { this.renderTitle() }
                        { this.renderCloseButton() }
                    </header>
                    { this.renderNotifications() }
                    { children }
                </div>
            </ClickOutside>
        );
    }

    render() {
        const { mix, areOtherOverlaysOpen } = this.props;
        const isVisible = this.getIsVisible();

        return createPortal(
            <div
              ref={ this.overlayRef }
              block="Popup"
              mods={ { isVisible, isInstant: areOtherOverlaysOpen } }
              mix={ { ...mix, mods: { ...mix.mods, isVisible } } }
            >
                { this.renderContent() }
            </div>,
            document.body
        );
    }
}

export default Popup;
