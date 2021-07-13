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

import SliderQuery from 'Query/Slider.query';
import { showNotification } from 'Store/Notification/Notification.action';
import DataContainer from 'Util/Request/DataContainer';

import SliderWidget from './SliderWidget.component';

/** @namespace Component/SliderWidget/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device
});

/** @namespace Component/SliderWidget/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showNotification: (type, title, error) => dispatch(showNotification(type, title, error))
});

/** @namespace Component/SliderWidget/Container */
export class SliderWidgetContainer extends DataContainer {
    static propTypes = {
        sliderId: PropTypes.number.isRequired,
        showNotification: PropTypes.func.isRequired
    };

    state = {
        slider: {
            slideSpeed: 0,
            slides: [{ image: '', slide_text: '', isPlaceholder: true }]
        }
    };

    componentDidMount() {
        this.requestSlider();
    }

    componentDidUpdate(prevProps) {
        const { sliderId } = this.props;
        const { sliderId: pSliderId } = prevProps;

        if (sliderId !== pSliderId) {
            this.requestSlider();
        }
    }

    requestSlider() {
        const { sliderId, showNotification } = this.props;

        this.fetchData(
            [SliderQuery.getQuery({ sliderId })],
            ({ slider }) => this.setState({ slider }),
            (e) => showNotification('error', __('Error fetching Slider!'), e)
        );
    }

    _getGalleryPictures() {
        const { gallery } = this.state;

        return gallery;
    }

    render() {
        return (
            <SliderWidget
              { ...this.props }
              { ...this.state }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SliderWidgetContainer);
