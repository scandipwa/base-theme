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

import Image from 'Component/Image/Image.component';
import {
    IMAGE_NOT_FOUND,
    IMAGE_NOT_SPECIFIED
} from 'Component/Image/Image.config';
import logo from 'Style/icons/logo.svg';

import './Logo.style';

/** @namespace Component/Logo/Component */
export class Logo extends Image {
    renderPlaceholderLogo() {
        return (
            <div
              block="Logo"
              elem="Placeholder"
            >
                <Image
                  src={ logo }
                  alt="LogoPlaceholder"
                  ratio="custom"
                />
            </div>
        );
    }

    renderImage() {
        const { imageStatus } = this.state;
        const { src } = this.props;

        if (!src) {
            return this.renderPlaceholderLogo();
        }

        switch (imageStatus) {
        case IMAGE_NOT_FOUND:
        case IMAGE_NOT_SPECIFIED:
            return this.renderPlaceholderLogo();
        default:
            return super.renderImage();
        }
    }

    render() {
        const { imageStatus } = this.state;

        return (
            <div
              block="Image"
              mods={ { imageStatus } }
              mix={ { block: 'Logo' } }
            >
                { this.renderImage() }
            </div>
        );
    }
}

export default Logo;
