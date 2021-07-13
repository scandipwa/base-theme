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
import { createRef, PureComponent } from 'react';

import { SHARED_ELEMENT_TRANSITION } from './SharedTransition.config';

import './SharedTransition.style';

/** @namespace Component/SharedTransition/Component */
export class SharedTransition extends PureComponent {
    static propTypes = {
        state: PropTypes.shape({
            startingPosition: PropTypes.shape({
                width: PropTypes.number,
                height: PropTypes.number,
                start: PropTypes.number,
                top: PropTypes.number
            }),
            destinationPosition: PropTypes.shape({
                width: PropTypes.number,
                height: PropTypes.number,
                start: PropTypes.number,
                top: PropTypes.number
            }),
            sharedElementDestination: PropTypes.object,
            sharedElement: PropTypes.object
        }).isRequired,
        cleanUpTransition: PropTypes.func.isRequired
    };

    sharedContainer = createRef();

    animationSpeed = SHARED_ELEMENT_TRANSITION;

    setDestinationTransform = this.setTransform.bind(this, 'destinationPosition');

    setStartingTransform = this.setTransform.bind(this, 'startingPosition');

    componentDidUpdate() {
        if (this.transitionInAction) {
            return;
        }
        this.updateSharedElement();
    }

    setTransform(key) {
        const {
            state: {
                [key]: {
                    width,
                    height,
                    start,
                    top
                }
            }
        } = this.props;

        this.sharedContainer.current.style.cssText = `
            --shared-element-width: ${width}px;
            --shared-element-height: ${height}px;
            --shared-element-top: ${top}px;
            --shared-element-start: ${start}px;
            --shared-element-animation-speed: ${this.animationSpeed}ms;
        `;
    }

    cleanUpTransition = () => {
        const { current: wrapper } = this.sharedContainer;
        const { cleanUpTransition } = this.props;

        const range = document.createRange();
        range.selectNodeContents(wrapper);
        range.deleteContents();

        this.transitionInAction = false;
        cleanUpTransition();
    };

    updateSharedElement() {
        const {
            state: {
                sharedElementDestination,
                sharedElement
            }
        } = this.props;

        const { current: wrapper } = this.sharedContainer;

        if (
            !sharedElement
            || !sharedElementDestination
            || !wrapper
        ) {
            // this.cleanUpTransition();
            return;
        }

        this.transitionInAction = true;
        this.setStartingTransform();
        wrapper.appendChild(sharedElement);
        setTimeout(this.setDestinationTransform, 0);
        setTimeout(this.cleanUpTransition, this.animationSpeed);
    }

    render() {
        const { state: { sharedElement } } = this.props;

        return (
            <div
              block="SharedTransition"
              mods={ { isVisible: !!sharedElement } }
              ref={ this.sharedContainer }
            />
        );
    }
}

export default SharedTransition;
