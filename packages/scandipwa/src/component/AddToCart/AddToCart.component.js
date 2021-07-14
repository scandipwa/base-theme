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

import Image from 'Component/Image/Image.container';
import { GRID_LAYOUT } from 'Route/CategoryPage/CategoryPage.config';
import bag from 'Style/icons/bag.svg';
import { MixType } from 'Type/Common';
import { LayoutType } from 'Type/Layout';
import { ProductType } from 'Type/ProductList';

import './AddToCart.style';

/**
 * Button for adding product to Cart
 * @class AddToCart
 * @namespace Component/AddToCart/Component
 */
export class AddToCart extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        product: ProductType,
        mix: MixType,
        buttonClick: PropTypes.func.isRequired,
        layout: LayoutType,
        isWithIcon: PropTypes.bool,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        product: {},
        mix: {},
        isLoading: false,
        layout: GRID_LAYOUT,
        isWithIcon: false,
        disabled: false
    };

    renderPlaceholder() {
        const { isLoading, mix } = this.props;

        return (
            <div
              block="AddToCart"
              mods={ { isLoading, isPlaceholder: true } }
              mix={ mix }
            />
        );
    }

    renderCartIcon() {
        const { isWithIcon } = this.props;

        if (!isWithIcon) {
            return null;
        }

        return <Image src={ bag } alt="cart" mix={ { block: 'AddToCart', elem: 'Icon' } } />;
    }

    render() {
        const {
            mix,
            product: { type_id },
            isLoading,
            buttonClick,
            layout,
            disabled
        } = this.props;

        if (!type_id) {
            this.renderPlaceholder();
        }

        return (
            <button
              onClick={ buttonClick }
              block="Button AddToCart"
              mix={ mix }
              mods={ { isLoading, layout } }
              disabled={ isLoading || disabled }
            >
                { this.renderCartIcon() }
                <span>{ isLoading ? __('Adding...') : __('Add to cart') }</span>
            </button>
        );
    }
}

export default AddToCart;
