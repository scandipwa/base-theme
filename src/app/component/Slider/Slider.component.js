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
import { Children, createRef, PureComponent } from 'react';

import Draggable from 'Component/Draggable';
import { ChildrenType, MixType } from 'Type/Common';
import CSS from 'Util/CSS';

import {
    ANIMATION_DURATION,
    HEIGHT_TRANSITION_SPEED_ON_MOUNT
} from './Slider.config';

import './Slider.style';

/** @namespace Component/Slider/Component */
export class Slider extends PureComponent {
    static propTypes = {
        showCrumbs: PropTypes.bool,
        mix: MixType,
        activeSlide: PropTypes.number,
        onActiveSlideChange: PropTypes.func,
        children: ChildrenType.isRequired,
        isInteractionDisabled: PropTypes.bool,
        onClick: PropTypes.func,
        isVertical: PropTypes.bool,
        isHeightTransitionDisabledOnMount: PropTypes.bool,
        sliderHeight: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        sliderRef: PropTypes.object,
        infinite: PropTypes.bool,
        isWidget: PropTypes.bool
    };

    static defaultProps = {
        showCrumbs: false,
        isInteractionDisabled: false,
        mix: {},
        onClick: null,
        isVertical: false,
        isHeightTransitionDisabledOnMount: false,
        sliderHeight: null,
        sliderRef: null,
        activeSlide: 0,
        onActiveSlideChange: () => {},
        infinite: false,
        isWidget: false
    };

    state = {
        activeSlide: 0
    };

    draggableRef = createRef();

    sliderRef = createRef();

    handleDragStart = this.handleInteraction.bind(this, this.handleDragStart);

    handleDrag = this.handleInteraction.bind(this, this.handleDrag);

    handleDragEnd = this.handleInteraction.bind(this, this.handleDragEnd);

    renderCrumb = this.renderCrumb.bind(this);

    componentDidMount() {
        if (!this.getIsScrollable()) {
            return;
        }

        window.addEventListener('resize', this.windowResizeWatcher);

        const sliderChildren = this.draggableRef.current.children;

        if (!sliderChildren || !sliderChildren[0]) {
            return;
        }

        const { activeSlide } = this.props;

        const sliderRef = this.getSliderRef();
        const sliderHeight = `${ sliderChildren[0].getBoundingClientRect().height }px`;

        CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
        CSS.setVariable(sliderRef, 'slide-height', sliderHeight);
        sliderChildren[0].onload = () => {
            CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
        };

        setTimeout(() => {
            CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
            this.setStyleVariablesOnMount();
        }, ANIMATION_DURATION);

        this.setAnimationSpeedStyle(0);
        this.setTranslateByActiveSlide(activeSlide);

        // Update to get correct shift prop on <Draggable>
        this.forceUpdate();
    }

    componentDidUpdate(prevProps, prevState) {
        const { activeSlide, onActiveSlideChange } = this.props;
        const { activeSlide: prevActiveSlide } = prevProps;
        const { activeSlide: stateActiveSlide } = this.state;
        const { activeSlide: prevStateActiveSlide } = prevState;

        // Change active slide number of parent component
        if (stateActiveSlide !== prevStateActiveSlide) {
            onActiveSlideChange(stateActiveSlide);
            return;
        }

        // If new active slide number received from parent component
        if (activeSlide !== prevActiveSlide) {
            if (this.animInAction) {
                onActiveSlideChange(stateActiveSlide);
                return;
            }
            this.changeActiveSlide(activeSlide);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeWatcher);
    }

    windowResizeWatcher = () => {
        // Remove animation to avoid image movement while changing window width.
        this.setAnimationSpeedStyle(0);

        const { activeSlide } = this.state;
        this.setTranslateByActiveSlide(activeSlide);
    };

    setStyleVariablesOnMount() {
        const { sliderHeight, isHeightTransitionDisabledOnMount } = this.props;

        const sliderRef = this.getSliderRef();

        if (isHeightTransitionDisabledOnMount) {
            const transitionSpeed = isHeightTransitionDisabledOnMount
                ? 0
                : `${ HEIGHT_TRANSITION_SPEED_ON_MOUNT }ms`;

            CSS.setVariable(
                sliderRef,
                'height-transition-speed',
                transitionSpeed
            );
        }

        if (sliderHeight) {
            CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
        }
    }

    setTranslateXStyle(translate) {
        const { isVertical } = this.props;

        CSS.setVariable(this.draggableRef, isVertical ? 'translateY' : 'translateX', `${ translate }px`);
    }

    setAnimationSpeedStyle(animationDuration = ANIMATION_DURATION) {
        CSS.setVariable(this.draggableRef, 'animation-speed', `${ animationDuration }ms`);
    }

    getCloneCountOnOneSide() {
        if (!this.getIsInfinite() || !this.getIsScrollable()) {
            return 0;
        }

        const { children: { length } } = this.props;
        const threeSlides = 3;
        if (length > threeSlides) {
            return 1;
        }

        return 2;
    }

    getTranslateByActiveSlide(activeSlide) {
        return (-activeSlide * this.getSlideWidth()) - (this.getCloneCountOnOneSide() * this.getSlideWidth());
    }

    setTranslateByActiveSlide(activeSlide) {
        this.setTranslateXStyle(this.getTranslateByActiveSlide(activeSlide));
    }

    getIsScrollable() {
        const { children: { length } } = this.props;

        return length > 1;
    }

    getIsInfinite() {
        const { infinite } = this.props;

        return infinite && this.getIsScrollable();
    }

    getSlideWidth() {
        const { isVertical } = this.props;

        const { width = 0, height = 0 } = this.draggableRef.current
            ? this.draggableRef.current.getBoundingClientRect() : {};

        return isVertical ? height : width;
    }

    getSliderRef() {
        const { sliderRef } = this.props;

        return sliderRef || this.sliderRef;
    }

    getFullSliderWidth() {
        const { isVertical } = this.props;
        const { scrollWidth: fullSliderWidth, scrollHeight } = this.draggableRef.current;

        const width = isVertical ? scrollHeight : fullSliderWidth;

        return width - this.getSlideWidth();
    }

    calculateNextSlide(state) {
        const { isVertical, onClick } = this.props;
        const {
            originalX,
            originalY,
            translateX,
            translateY,
            lastTranslateX,
            lastTranslateY
        } = state;

        const lastTranslate = isVertical ? lastTranslateY : lastTranslateX;

        const translateDirection = isVertical ? translateY : translateX;
        const clickPosition = isVertical ? originalY : originalX;

        const { activeSlide } = this.state;

        // If this is a first drag, lastTranslate will be zero, then no need subtract current slider translate
        const translateDiff = lastTranslate ? this.getTranslateByActiveSlide(activeSlide) : 0;

        // Counting absolute slider drag translate or click coordinates to compare with 0
        const translate = translateDirection ? -(translateDirection - translateDiff)
            : clickPosition - (this.getSlideWidth() / 2);

        if (onClick && !translateDirection) {
            onClick();
        }

        if (translate > 0) {
            return activeSlide + 1;
        }

        if (translate < 0) {
            return activeSlide - 1;
        }

        return activeSlide;
    }

    handleDragStart() {
        this.setAnimationSpeedStyle(0);
    }

    handleDrag(state) {
        const { isVertical } = this.props;
        const { translateX, translateY } = state;

        const translate = isVertical ? translateY : translateX;

        this.setAnimationSpeedStyle(0);
        this.setTranslateXStyle(translate);
    }

    handleDragEnd(state, callback) {
        const { isVertical } = this.props;

        const newActiveSlide = this.calculateNextSlide(state);
        const newTranslate = this.getTranslateByActiveSlide(newActiveSlide);

        this.changeActiveSlide(newActiveSlide);

        if (isVertical) {
            callback({
                originalY: newTranslate,
                lastTranslateY: newTranslate
            });

            return;
        }

        callback({
            originalX: newTranslate,
            lastTranslateX: newTranslate
        });
    }

    handleClick = (state, callback, e) => {
        if (e.type === 'contextmenu') {
            this.handleDragEnd(state, callback);
        }
    };

    handleInteraction(callback, ...args) {
        const { isInteractionDisabled } = this.props;

        if (isInteractionDisabled || !callback || this.animInAction) {
            return;
        }

        callback.call(this, ...args);
    }

    changeActiveSlide(newActiveSlide) {
        const { children: { length } } = this.props;
        const { activeSlide } = this.state;

        if (activeSlide === newActiveSlide) {
            return;
        }

        this.animInAction = true;

        setTimeout(() => {
            this.animInAction = false;
        }, ANIMATION_DURATION);

        this.setAnimationSpeedStyle();

        if (newActiveSlide >= 0 && newActiveSlide < length) {
            this.setTranslateByActiveSlide(newActiveSlide);
            this.setState({ activeSlide: newActiveSlide });
            return;
        }

        if (!this.getIsInfinite()) {
            this.animInAction = false;
            return;
        }

        const countNewActive = newActiveSlide < 0 ? length - 1 : 0;
        this.setState({ activeSlide: countNewActive });
        this.setTranslateByActiveSlide(newActiveSlide);
        setTimeout(() => {
            this.setAnimationSpeedStyle(0);
            this.setTranslateByActiveSlide(countNewActive);
        }, ANIMATION_DURATION);
    }

    renderCrumbs() {
        const { children } = this.props;

        if (!this.getIsScrollable()) {
            return null;
        }

        return (
            <div
              block="Slider"
              elem="Crumbs"
            >
                { Children.map(children, this.renderCrumb) }
            </div>
        );
    }

    renderCrumb(_, i) {
        const { activeSlide } = this.state;
        const isActive = i === activeSlide;

        return (
            <button
              block="Slider"
              elem="Image"
              mods={ { type: 'single' } }
              // eslint-disable-next-line react/jsx-no-bind
              onClick={ () => this.changeActiveSlide(i) }
            >
                <div
                  block="Slider"
                  elem="Crumb"
                  mods={ { isActive } }
                />
            </button>
        );
    }

    renderSlides() {
        const { children, children: { length } } = this.props;

        if (!this.getIsInfinite()) {
            return children;
        }

        // Cloning children to place to left and right, if the slider is infinite
        const leftClone = React.cloneElement(children[length - 1],
            { key: `${children[length - 1].key}-clone` });

        const rightClone = React.cloneElement(children[0],
            { key: `${children[0].key}-clone` });

        // If slide count is 3 or less, then we need extra clone on each side
        const threeSlides = 3;
        if (length <= threeSlides) {
            const extraLeftClone = React.cloneElement(children[0],
                { key: `${children[0].key}-clonex` });

            const extraRightClone = React.cloneElement(children[length - 1],
                { key: `${children[length - 1].key}-clonex` });

            return [extraLeftClone, leftClone, children, rightClone, extraRightClone];
        }

        return [leftClone, children, rightClone];
    }

    renderSlider() {
        if (!this.getIsScrollable()) {
            const { children } = this.props;
            return children;
        }

        const {
            isVertical,
            isWidget,
            infinite: isInfinite
        } = this.props;
        const { activeSlide } = this.state;

        return (
            <Draggable
              mix={ { block: 'Slider', elem: 'Wrapper', mods: { isVertical, isWidget, isInfinite } } }
              draggableRef={ this.draggableRef }
              onDragStart={ this.handleDragStart }
              onDragEnd={ this.handleDragEnd }
              onDrag={ this.handleDrag }
              onClick={ this.handleClick }
              shiftX={ this.getTranslateByActiveSlide(activeSlide) }
              shiftY={ this.getTranslateByActiveSlide(activeSlide) }
            >
                { this.renderSlides() }
            </Draggable>
        );
    }

    render() {
        const {
            showCrumbs,
            mix
        } = this.props;

        return (
            <div
              block="Slider"
              mix={ mix }
              ref={ this.getSliderRef() }
            >
                { this.renderSlider() }
                { showCrumbs && this.renderCrumbs() }
            </div>
        );
    }
}

export default Slider;
