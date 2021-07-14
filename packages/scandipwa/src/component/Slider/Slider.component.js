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
import { DeviceType } from 'Type/Device';
import CSS from 'Util/CSS';
import { isRtl } from 'Util/CSS/CSS';

import {
    ACTIVE_SLIDE_PERCENT,
    ANIMATION_DURATION,
    HEIGHT_TRANSITION_SPEED_ON_MOUNT
} from './Slider.config';

import './Slider.style';

/**
 * Slider component
 * @class Slider
 * @namespace Component/Slider/Component
 */
export class Slider extends PureComponent {
    static propTypes = {
        showCrumbs: PropTypes.bool,
        showArrows: PropTypes.bool,
        activeImage: PropTypes.number,
        onActiveImageChange: PropTypes.func,
        mix: MixType,
        children: ChildrenType.isRequired,
        isInteractionDisabled: PropTypes.bool,
        device: DeviceType.isRequired,
        onClick: PropTypes.func,
        isVertical: PropTypes.bool,
        isHeightTransitionDisabledOnMount: PropTypes.bool,
        sliderHeight: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        sliderRef: PropTypes.object
    };

    static defaultProps = {
        activeImage: 0,
        onActiveImageChange: () => {},
        showCrumbs: false,
        showArrows: false,
        isInteractionDisabled: false,
        mix: {},
        onClick: null,
        isVertical: false,
        isHeightTransitionDisabledOnMount: false,
        sliderHeight: null,
        sliderRef: null
    };

    sliderWidth = 0;

    draggableRef = createRef();

    sliderRef = createRef();

    handleDragStart = this.handleInteraction.bind(this, this.handleDragStart);

    handleDrag = this.handleInteraction.bind(this, this.handleDrag);

    handleDragEnd = this.handleInteraction.bind(this, this.handleDragEnd);

    renderCrumb = this.renderCrumb.bind(this);

    goNext = this.goNext.bind(this);

    goPrev = this.goPrev.bind(this);

    __construct(props) {
        super.__construct(props);

        const { activeImage } = this.props;

        this.state = {
            prevActiveImage: activeImage
        };
    }

    static getDerivedStateFromProps(props, state) {
        const { activeImage, children } = props;
        const { prevActiveImage } = state;

        if (prevActiveImage !== activeImage && children.length !== 1) {
            return { prevActiveImage: activeImage };
        }

        return null;
    }

    componentDidMount() {
        this.addWindowResizeWatcher();

        if (!this.getIsSlider()) {
            return;
        }

        const sliderChildren = this.draggableRef.current.children;
        const sliderWidth = this.draggableRef.current.offsetWidth;
        this.sliderWidth = sliderWidth;

        if (!sliderChildren || !sliderChildren[0]) {
            return;
        }

        // delay setting carousel translate to avoid wrong calculations be made during transition
        setTimeout(() => {
            this.setStyleVariablesOnMount();
        }, 0);

        const sliderRef = this.getSliderRef();
        const sliderHeight = `${ sliderChildren[0].offsetHeight }px`;

        sliderChildren[0].onload = () => {
            CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
        };

        setTimeout(() => {
            CSS.setVariable(sliderRef, 'slider-height', sliderHeight);
        }, ANIMATION_DURATION);
    }

    componentDidUpdate(prevProps) {
        const { activeImage: prevActiveImage } = prevProps;
        const { activeImage } = this.props;

        if (activeImage !== prevActiveImage && this.getIsSlider()) {
            const newTranslate = -activeImage * this.getSlideWidth() * this.getDir();

            this.setAnimationSpeedStyle(Math.abs((prevActiveImage - activeImage) * ANIMATION_DURATION));
            this.setTranlateXStyle(newTranslate);
        }
    }

    getDir() {
        const { isVertical } = this.props;

        if (!isVertical && isRtl()) {
            return -1;
        }

        return 1;
    }

    addWindowResizeWatcher() {
        window.addEventListener('resize', () => {
            const { activeImage } = this.props;
            const newTranslate = -activeImage * this.getSlideWidth() * this.getDir();

            this.setTranlateXStyle(newTranslate);

            // Removed animation to avoid image movement while changing window width.
            this.setAnimationSpeedStyle(0);

            const delay = 500;
            setTimeout(() => {
                this.setAnimationSpeedStyle();
            }, delay);
        });
    }

    setStyleVariablesOnMount() {
        const { sliderHeight, isHeightTransitionDisabledOnMount, activeImage } = this.props;

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

        const newTranslate = -activeImage * this.getSlideWidth() * this.getDir();
        this.setTranlateXStyle(newTranslate);
    }

    setTranlateXStyle(translate) {
        const { isVertical } = this.props;

        CSS.setVariable(
            this.draggableRef,
            isVertical ? 'translateY' : 'translateX',
            `${ translate }px`
        );
    }

    setAnimationSpeedStyle(animationDuration = ANIMATION_DURATION) {
        CSS.setVariable(this.draggableRef, 'animation-speed', `${ animationDuration }ms`);
    }

    getIsSlider() {
        const { children } = this.props;

        return children.length > 0;
    }

    getSlideWidth() {
        const { isVertical } = this.props;
        const { offsetWidth = 0, offsetHeight = 0 } = this.draggableRef.current || {};

        return isVertical ? offsetHeight : offsetWidth;
    }

    getSliderRef() {
        const { sliderRef } = this.props;

        return sliderRef || this.sliderRef;
    }

    onClickChangeSlide(state, slideSize, lastTranslate, fullSliderSize) {
        const { originalX } = state;
        const { prevActiveImage: prevActiveSlider } = this.state;
        const { onActiveImageChange, device, onClick } = this.props;

        if (onClick) {
            onClick();

            return -prevActiveSlider;
        }

        const fullSliderPoss = Math.round(fullSliderSize / slideSize);
        const elementPossitionInDOM = this.draggableRef.current.getBoundingClientRect().x;

        const sliderPossition = -prevActiveSlider;
        const realElementPossitionInDOM = elementPossitionInDOM - lastTranslate;
        const mousePossitionInElement = originalX - realElementPossitionInDOM;

        if (device.isMobile) {
            return sliderPossition;
        }

        if (slideSize / 2 < mousePossitionInElement && -fullSliderPoss < sliderPossition) {
            const activeSlide = sliderPossition - 1;
            onActiveImageChange(-activeSlide);

            return activeSlide;
        }

        if (slideSize / 2 > mousePossitionInElement && lastTranslate) {
            const activeSlide = sliderPossition + 1;
            onActiveImageChange(-activeSlide);

            return activeSlide;
        }

        return sliderPossition;
    }

    getFullSliderWidth() {
        const { isVertical } = this.props;
        const { scrollWidth: fullSliderWidth, scrollHeight } = this.draggableRef.current;

        const width = isVertical ? scrollHeight : fullSliderWidth;

        return width - this.getSlideWidth();
    }

    calculateNextSlide(state) {
        const { isVertical } = this.props;
        const {
            translateX,
            translateY,
            lastTranslateX,
            lastTranslateY
        } = state;

        const lastTranslate = isVertical ? lastTranslateY : lastTranslateX;
        const translate = isVertical ? translateY : translateX;

        const { onActiveImageChange } = this.props;

        const slideSize = this.getSlideWidth();

        const fullSliderSize = this.getFullSliderWidth();

        const dir = this.getDir();
        const activeSlidePosition = translate / slideSize;
        const activeSlidePercent = Math.abs(activeSlidePosition % 1);
        const isSlideBack = dir === 1 ? translate > lastTranslate : translate < lastTranslate;

        if (!translate) {
            return this.onClickChangeSlide(state, slideSize, lastTranslate, fullSliderSize);
        }

        if ((dir === 1 && translate >= 0) || (dir === -1 && translate < 0)) {
            onActiveImageChange(0);

            return 0;
        }

        if ((dir === 1 && translate < -fullSliderSize) || (dir === -1 && translate > fullSliderSize)) {
            const activeSlide = Math.round(fullSliderSize / (-slideSize * dir));
            onActiveImageChange(-activeSlide);

            return activeSlide;
        }

        if (isSlideBack && activeSlidePercent < 1 - ACTIVE_SLIDE_PERCENT) {
            const activeSlide = Math[dir === 1 ? 'ceil' : 'floor'](activeSlidePosition);
            onActiveImageChange(-activeSlide);

            return activeSlide;
        }

        if (!isSlideBack && activeSlidePercent > ACTIVE_SLIDE_PERCENT) {
            const activeSlide = Math[dir === 1 ? 'floor' : 'ceil'](activeSlidePosition);
            onActiveImageChange(-activeSlide);

            return activeSlide;
        }

        const activeSlide = Math.round(activeSlidePosition);
        onActiveImageChange(-activeSlide);

        return activeSlide;
    }

    handleDragStart() {
        this.setAnimationSpeedStyle(0);
    }

    handleDrag(state) {
        const { isVertical } = this.props;
        const { translateX, translateY } = state;
        const translate = isVertical ? translateY : translateX;
        const fullSliderSize = this.getFullSliderWidth();
        const dir = this.getDir();
        const canDrag = dir === 1
            ? translate < 0 && translate > -fullSliderSize
            : translate > 0 && translate < fullSliderSize;

        if (canDrag) {
            this.setTranlateXStyle(translate);
        }
    }

    handleDragEnd(state, callback) {
        const { isVertical } = this.props;
        const activeSlide = this.calculateNextSlide(state);
        const slideSize = this.getSlideWidth();
        const newTranslate = activeSlide * slideSize;

        this.setAnimationSpeedStyle();
        this.setTranlateXStyle(newTranslate);

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

        if (isInteractionDisabled || !callback) {
            return;
        }

        callback.call(this, ...args);
    }

    changeActiveImage(activeImage) {
        const { onActiveImageChange } = this.props;
        onActiveImageChange(activeImage);
    }

    goPrev() {
        const { activeImage } = this.props;

        if (activeImage > 0) {
            this.changeActiveImage(activeImage - 1);
        }
    }

    goNext() {
        const { activeImage, children } = this.props;
        const nextImage = activeImage + 1;

        if (nextImage < children.length) {
            this.changeActiveImage(nextImage);
        }
    }

    renderCrumbs() {
        const { children, showCrumbs } = this.props;

        if (!showCrumbs || children.length <= 1) {
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
        const { activeImage } = this.props;
        const isActive = i === Math.abs(-activeImage);

        return (
            <button
              block="Slider"
              elem="Image"
              mods={ { type: 'single' } }
              // eslint-disable-next-line react/jsx-no-bind
              onClick={ () => this.changeActiveImage(i) }
              aria-label={ __('Slide crumb') }
            >
                <div
                  block="Slider"
                  elem="Crumb"
                  mods={ { isActive } }
                />
            </button>
        );
    }

    renderArrows() {
        const { showArrows, activeImage, children } = this.props;
        const nextIsDisabled = activeImage + 1 === children.length;
        const prevIsDisabled = activeImage === 0;

        if (!showArrows) {
            return null;
        }

        return (
            <>
                <button
                  block="Slider"
                  elem="Arrow"
                  mods={ { isPrev: true, isDisabled: prevIsDisabled } }
                  aria-label={ __('Previous') }
                  onClick={ this.goPrev }
                />
                <button
                  block="Slider"
                  elem="Arrow"
                  mods={ { isNext: true, isDisabled: nextIsDisabled } }
                  aria-label={ __('Next') }
                  onClick={ this.goNext }
                />
            </>
        );
    }

    renderSliderContent() {
        const { activeImage, children, isVertical } = this.props;
        const dir = this.getDir();

        if (!this.getIsSlider()) {
            return children;
        }

        return (
            <Draggable
              mix={ { block: 'Slider', elem: 'Wrapper', mods: { isVertical } } }
              draggableRef={ this.draggableRef }
              onDragStart={ this.handleDragStart }
              onDragEnd={ this.handleDragEnd }
              onDrag={ this.handleDrag }
              onClick={ this.handleClick }
              shiftX={ -activeImage * this.getSlideWidth() * dir }
              shiftY={ -activeImage * this.getSlideWidth() }
            >
                { children }
            </Draggable>
        );
    }

    render() {
        const { mix } = this.props;

        return (
            <>
                <div
                  block="Slider"
                  mix={ mix }
                  ref={ this.getSliderRef() }
                >
                    { this.renderSliderContent() }
                    { this.renderCrumbs() }
                </div>
                { this.renderArrows() }
            </>
        );
    }
}

export default Slider;
