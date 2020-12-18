/* eslint-disable react/no-array-index-key */
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
import { PureComponent } from 'react';

import Html from 'Component/Html';
import Image from 'Component/Image';
import Slider from 'Component/Slider';
import { DeviceType } from 'Type/Device';

import './SliderWidget.style';

/**
 * Homepage slider
 * @class SliderWidget
 * @namespace Component/SliderWidget/Component
 */
export class SliderWidget extends PureComponent {
    static propTypes = {
        slider: PropTypes.shape({
            title: PropTypes.string,
            slideSpeed: PropTypes.number,
            slides: PropTypes.arrayOf(
                PropTypes.shape({
                    desktop_image: PropTypes.string,
                    mobile_image: PropTypes.string,
                    slide_text: PropTypes.string,
                    isPlaceholder: PropTypes.bool
                })
            )
        }),
        device: DeviceType.isRequired,
        isVertical: PropTypes.bool,
        isLoaded: PropTypes.bool
    };

    static defaultProps = {
        slider: [{}],
        isVertical: false,
        isLoaded: false
    };

    state = {
        activeSlide: 0
    };

    componentDidMount() {
        const { slider: { slideSpeed, slides } } = this.props;

        if (slideSpeed && slides.length > 1) {
            this.startCarousel(slideSpeed);
        }
    }

    componentWillUnmount() {
        clearInterval(this.carouselInterval);
    }

    onActiveSlideChange = (activeSlide) => {
        this.setState({ activeSlide });
    };

    startCarousel = (interval) => {
        this.carouselInterval = setInterval(() => {
            this.updateImageToShow();
        }, interval);
    };

    updateImageToShow() {
        const { activeSlide } = this.state;

        this.setState({ activeSlide: activeSlide + 1 });
    }

    getSlideImage(slide) {
        const {
            desktop_image,
            mobile_image
        } = slide;
        const { device } = this.props;

        if (device.isMobile && mobile_image) {
            return `/${mobile_image}`;
        }

        if (!desktop_image) {
            return '';
        }

        return `/${desktop_image}`;
    }

    renderSlide = (slide) => {
        const {
            slide_text,
            isPlaceholder,
            title: block,
            item_id
        } = slide;

        const { slider: { slides: { length } }, isVertical } = this.props;
        const isSlider = length > 1;

        return (
            <figure
              block="SliderWidget"
              elem="Figure"
              key={ block + item_id }
              mods={ { isSlider, isVertical } }
            >
                <Image
                  mix={ { block: 'SliderWidget', elem: 'FigureImage' } }
                  ratio="custom"
                  src={ this.getSlideImage(slide) }
                  isPlaceholder={ isPlaceholder }
                />
                <figcaption
                  block="SliderWidget"
                  elem="Figcaption"
                  mix={ { block } }
                >
                    <Html content={ slide_text || '' } />
                </figcaption>
            </figure>
        );
    };

    renderPlaceholder() {
        return <div block="WidgetFactory" elem="SliderPlaceholder" />;
    }

    render() {
        const { isLoaded } = this.props;

        if (!isLoaded) {
            return this.renderPlaceholder();
        }

        const { activeSlide } = this.state;
        const { slider: { slides, title: block }, isVertical } = this.props;

        const children = slides.map(this.renderSlide);
        const isInfinite = slides.length > 1;

        return (
            <Slider
              mix={ { block: 'SliderWidget', mix: { block } } }
              showCrumbs
              activeSlide={ activeSlide }
              onActiveSlideChange={ this.onActiveSlideChange }
              isVertical={ isVertical }
              infinite={ isInfinite }
              isWidget
            >
                { children }
            </Slider>
        );
    }
}

export default SliderWidget;
