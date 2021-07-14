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

import { MixType } from 'Type/Common';

import Image from './Image.component';

/** @namespace Component/Image/Container */
export class ImageContainer extends PureComponent {
    static propTypes = {
        isPlaceholder: PropTypes.bool,
        src: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),
        style: PropTypes.shape({}),
        width: PropTypes.string,
        height: PropTypes.string,
        alt: PropTypes.string,
        ratio: PropTypes.oneOf([
            '4x3',
            '16x9',
            'square',
            'custom'
        ]),
        mix: MixType
    };

    static defaultProps = {
        src: '',
        alt: '',
        ratio: 'square',
        mix: {},
        height: '',
        width: '',
        isPlaceholder: false,
        style: {}
    };

    containerProps = () => ({
        style: this._getStyle(),
        wrapperSize: this._getWrapperSize()
    });

    _parseSize(size) {
        const trimmedSize = size.trim();

        if (!trimmedSize) {
            return '100%';
        }

        const PX_LENGTH = -2;
        const PERCENT_LENGTH = -1;

        if (
            trimmedSize.slice(PX_LENGTH) === 'px'
            || trimmedSize.slice(PERCENT_LENGTH) === '%'
        ) {
            return trimmedSize;
        }

        return `${trimmedSize}px`;
    }

    _getCorrectSize() {
        const { width, height } = this.props;

        const correctHeight = this._parseSize(height);
        const correctWidth = this._parseSize(width);

        return { width: correctWidth, height: correctHeight };
    }

    _getStyle() {
        const { style } = this.props;

        return { ...this._getCorrectSize(), ...style };
    }

    _getWrapperSize() {
        const size = this._getCorrectSize();
        const { height, width } = size;

        if (height.slice(-1) === '%' && width.slice(-1) === '%') {
            return {};
        }

        return height.slice(-1) !== '%'
            ? { paddingBottom: height }
            : { paddingBottom: width };
    }

    render() {
        return (
            <Image
              { ...this.props }
              { ...this.containerProps() }
            />
        );
    }
}

export default ImageContainer;
