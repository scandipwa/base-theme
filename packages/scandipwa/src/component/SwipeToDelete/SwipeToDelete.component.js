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

import Draggable from 'Component/Draggable';
import Loader from 'Component/Loader';
import { ChildrenType } from 'Type/Common';
import CSS from 'Util/CSS';
import { isRtl } from 'Util/CSS/CSS';

import {
    ANIMATION_DURATION,
    ANIMATION_DURATION_ON_REMOVE,
    DRAG_ITEM_REMOVE_THRESHOLD,
    DRAG_RIGHT_OPEN_THRESHOLD,
    DRAG_RIGHT_OPEN_TRIGGER_THRESHOLD
} from './SwipeToDelete.config';

import './SwipeToDelete.style';

/** @namespace Component/SwipeToDelete/Component */
export class SwipeToDelete extends PureComponent {
    static propTypes = {
        children: ChildrenType.isRequired,
        dragRightOpenTriggerThreshold: PropTypes.number,
        dragRightOpenThreshold: PropTypes.number,
        dragItemRemoveThreshold: PropTypes.number,
        animationDuration: PropTypes.number,
        animationDurationOnRemove: PropTypes.number,
        renderRightSideContent: PropTypes.func,
        rightSideMix: PropTypes.object,
        topElemMix: PropTypes.object,
        onAheadOfDragItemRemoveThreshold: PropTypes.func,
        isLoading: PropTypes.bool
    };

    static defaultProps = {
        // Threshold after we open right side
        dragRightOpenTriggerThreshold: DRAG_RIGHT_OPEN_TRIGGER_THRESHOLD,
        // Width of opened right side
        dragRightOpenThreshold: DRAG_RIGHT_OPEN_THRESHOLD,
        // Threshold after we remove item on touchend as percentage of item width
        dragItemRemoveThreshold: DRAG_ITEM_REMOVE_THRESHOLD,
        animationDuration: ANIMATION_DURATION,
        animationDurationOnRemove: ANIMATION_DURATION_ON_REMOVE,
        renderRightSideContent: () => {},
        rightSideMix: {},
        topElemMix: {},
        onAheadOfDragItemRemoveThreshold: () => {},
        isLoading: false
    };

    state = {
        isRightSideOpen: false,
        isAheadRemoveItemThreshold: false
    };

    draggableRef = createRef();

    draggableRemoveThreshold;

    draggableWidth;

    componentDidMount() {
        // Sets default style
        this.setTranslateXStyle(0);
        this.setRightSideContentWidth();
        this.setDraggableWidth();
        this.setDraggableRemoveThreshold();
    }

    setRightSideContentWidth() {
        const { dragRightOpenThreshold } = this.props;
        CSS.setVariable(this.draggableRef, 'right-side-content-width', `${ dragRightOpenThreshold }px`);
    }

    setTranslateXStyle(translate) {
        CSS.setVariable(this.draggableRef, 'translateX', `${ translate }px`);
    }

    setDraggableWidth() {
        const { draggableRef } = this;
        const { width } = draggableRef.current.getBoundingClientRect();
        this.draggableWidth = width;
    }

    setDraggableRemoveThreshold() {
        const { draggableWidth } = this;
        const {
            dragRightOpenThreshold,
            dragItemRemoveThreshold
        } = this.props;

        this.draggableRemoveThreshold = draggableWidth * dragItemRemoveThreshold - dragRightOpenThreshold;
    }

    setAnimationSpeedStyle(specAnimationDuration) {
        const { animationDuration } = this.props;

        const duration = specAnimationDuration === undefined
            ? animationDuration
            : specAnimationDuration;

        CSS.setVariable(this.draggableRef, 'animation-speed', `${ duration }ms`);
    }

    handleDragStart = () => {
        // Remove animation when drag starts
        this.setAnimationSpeedStyle(0);
    };

    handleDrag = ({ translateX: translate }) => {
        const { dragRightOpenThreshold } = this.props;
        const { isRightSideOpen, isAheadRemoveItemThreshold } = this.state;
        const { draggableRemoveThreshold } = this;

        const translateX = isRtl() ? -translate : translate;
        const nextIsAheadRemoveItemThreshold = Math.abs(translateX) > draggableRemoveThreshold;

        if (isAheadRemoveItemThreshold !== nextIsAheadRemoveItemThreshold) {
            this.setState({
                isAheadRemoveItemThreshold: nextIsAheadRemoveItemThreshold
            });
        }

        // When dragging to left from current start point, going negative translateX
        if (translateX <= 0) {
            const translate = isRightSideOpen
                // Add (remove to have minus value) opened content width, to have full -translateX value
                ? translateX - dragRightOpenThreshold
                : translateX;

            this.setTranslateXStyle(translate);

            return;
        }

        // When dragging to right from current start point, going positive translateX
        if (translateX > 0) {
            // When translate goes out of screen
            if (!isRightSideOpen || (isRightSideOpen && translateX - dragRightOpenThreshold > 0)) {
                this.setTranslateXStyle(0);

                return;
            }

            // When content is opened and dragging to right side
            if (translateX - dragRightOpenThreshold < 0 && isRightSideOpen) {
                // Add (remove to have minus value) opened content width, to have full -translateX value
                this.setTranslateXStyle(translateX - dragRightOpenThreshold);
            }
        }
    };

    handleDragEnd = ({ translateX: translate }) => {
        const {
            dragRightOpenThreshold,
            dragRightOpenTriggerThreshold,
            onAheadOfDragItemRemoveThreshold,
            animationDurationOnRemove
        } = this.props;
        const { isAheadRemoveItemThreshold } = this.state;
        const { draggableWidth } = this;

        const translateX = isRtl() ? -translate : translate;
        const shouldOpen = translateX <= -dragRightOpenTriggerThreshold;

        if (isAheadRemoveItemThreshold) {
            // swipe to the end
            this.setAnimationSpeedStyle(animationDurationOnRemove);
            this.setTranslateXStyle(-draggableWidth);
            onAheadOfDragItemRemoveThreshold();

            return;
        }

        this.setAnimationSpeedStyle();
        this.setState({ isRightSideOpen: shouldOpen });

        if (!shouldOpen) {
            this.setTranslateXStyle(0);

            return;
        }

        this.setTranslateXStyle(-dragRightOpenThreshold);
    };

    renderRightSideContent() {
        const { renderRightSideContent, rightSideMix } = this.props;
        const { isAheadRemoveItemThreshold } = this.state;

        return (
            <div
              block="SwipeToDelete"
              elem="RightSideContentWrapper"
            >
                <div
                  block="SwipeToDelete"
                  elem="RightSideContent"
                  mods={ { isAheadRemoveItemThreshold } }
                  mix={ rightSideMix }
                >
                    { renderRightSideContent() }
                </div>
            </div>
        );
    }

    stopPropagation = (event) => {
        event.stopPropagation();
    };

    renderChildren() {
        const { children } = this.props;

        return (
            <>
                <div
                  block="SwipeToDelete"
                  role="button"
                  tabIndex="0"
                  onMouseDown={ this.stopPropagation }
                >
                    { children }
                </div>
                { this.renderRightSideContent() }
            </>
        );
    }

    render() {
        const { topElemMix, isLoading } = this.props;
        const { isAheadRemoveItemThreshold } = this.state;

        return (
            <Draggable
              onDrag={ this.handleDrag }
              draggableRef={ this.draggableRef }
              onDragStart={ this.handleDragStart }
              onDragEnd={ this.handleDragEnd }
              mix={ topElemMix }
            >
                <Loader isLoading={ isLoading && isAheadRemoveItemThreshold } />
                { this.renderChildren() }
            </Draggable>
        );
    }
}

export default SwipeToDelete;
