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

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Loader from 'Component/Loader';
import { ProductType } from 'Type/ProductList';

import './ProductWishlistButton.style';

/** @namespace Component/ProductWishlistButton/Component */
export class ProductWishlistButton extends PureComponent {
    static propTypes = {
        isReady: PropTypes.bool,
        isLoading: PropTypes.bool,
        quantity: PropTypes.number,
        isDisabled: PropTypes.bool,
        isInWishlist: PropTypes.bool,
        product: ProductType.isRequired,
        addToWishlist: PropTypes.func.isRequired,
        removeFromWishlist: PropTypes.func.isRequired,
        mix: PropTypes.shape({ block: PropTypes.string, elem: PropTypes.string, mod: PropTypes.string }),
        isSignedIn: PropTypes.bool.isRequired
    };

    static defaultProps = {
        mix: {},
        quantity: 1,
        isReady: true,
        isLoading: false,
        isDisabled: false,
        isInWishlist: false
    };

    getTitle = () => {
        const { isInWishlist, isReady, isSignedIn } = this.props;

        if (!isSignedIn) {
            return __('Please sign in first!');
        }

        if (!isReady) {
            return __('Please select variant first!');
        }

        if (isInWishlist) {
            return __('Remove from Wishlist');
        }

        return __('Add to Wishlist');
    };

    onClick = (e) => {
        const {
            product,
            quantity,
            isInWishlist,
            addToWishlist,
            removeFromWishlist
        } = this.props;

        e.preventDefault();

        if (!isInWishlist) {
            return addToWishlist(product, quantity);
        }

        return removeFromWishlist(product, quantity);
    };

    renderButton() {
        const { isInWishlist, isDisabled, mix } = this.props;

        return (
            <button
              block="ProductWishlistButton"
              elem="Button"
              mods={ { isInWishlist, isDisabled } }
              mix={ { block: 'Button', mods: { isHollow: !isInWishlist }, mix } }
              title={ this.getTitle() }
              onClick={ this.onClick }
            >
                <div
                  block="ProductWishlistButton"
                  elem="Heart"
                />
            </button>
        );
    }

    renderLoader() {
        const { isLoading } = this.props;

        return (
            <Loader isLoading={ isLoading } />
        );
    }

    renderContent() {
        return (
            <div block="ProductWishlistButton">
                { this.renderButton() }
                { this.renderLoader() }
            </div>
        );
    }

    render() {
        const { product: { id } = {} } = this.props;

        if (id !== -1) {
            return this.renderContent();
        }

        return null;
    }
}

export default ProductWishlistButton;
