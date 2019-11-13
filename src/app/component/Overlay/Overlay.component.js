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

import { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';

import isMobile from 'Util/Mobile';
import { MixType, ChildrenType } from 'Type/Common';

import './Overlay.style';

export default class Overlay extends PureComponent {
    static propTypes = {
        mix: MixType,
        id: PropTypes.string.isRequired,
        onVisible: PropTypes.func,
        onHide: PropTypes.func,
        activeOverlay: PropTypes.string.isRequired,
        areOtherOverlaysOpen: PropTypes.bool.isRequired,
        children: ChildrenType
    };

    static defaultProps = {
        mix: {},
        children: [],
        onVisible: () => {},
        onHide: () => {}
    };

    overlayRef = createRef();

    componentDidUpdate(prevProps) {
        const prevWasVisible = this.getIsVisible(prevProps);
        const isVisible = this.getIsVisible();
        if (isVisible && !prevWasVisible) this.onVisible();
        if (!isVisible && prevWasVisible) this.onHide();
    }

    onVisible() {
        const { onVisible } = this.props;
        if (isMobile.any()) this.freezeScroll();
        this.overlayRef.current.focus();
        onVisible();
    }

    onHide() {
        const { onHide } = this.props;
        if (isMobile.any()) this.unfreezeScroll();
        onHide();
    }

    getIsVisible(props = this.props) {
        const { id, activeOverlay } = props;
        return id === activeOverlay;
    }

    freezeScroll() {
        this.YoffsetWhenScrollDisabled = window.pageYOffset || document.documentElement.scrollTop;
        document.body.classList.add('scrollDisabled');
        document.body.style.marginTop = `${-this.YoffsetWhenScrollDisabled}px`;
    }

    unfreezeScroll() {
        document.body.classList.remove('scrollDisabled');
        document.body.style.marginTop = 0;
        window.scrollTo(0, this.YoffsetWhenScrollDisabled);
    }

    render() {
        const { children, mix, areOtherOverlaysOpen } = this.props;
        const isVisible = this.getIsVisible();

        return (
            <div
              block="Overlay"
              ref={ this.overlayRef }
              mods={ { isVisible, isInstant: areOtherOverlaysOpen } }
              mix={ { ...mix, mods: { ...mix.mods, isVisible } } }
            >
                { children && children }
            </div>
        );
    }
}
