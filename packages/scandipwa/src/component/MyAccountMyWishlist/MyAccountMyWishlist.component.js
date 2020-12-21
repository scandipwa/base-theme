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

import Loader from 'Component/Loader';
import ProductCard from 'Component/ProductCard';
import ShareWishlistPopup from 'Component/ShareWishlistPopup';
import WishlistItem from 'Component/WishlistItem';
import { ProductType } from 'Type/ProductList';
import CSS from 'Util/CSS';

import './MyAccountMyWishlist.style';

/** @namespace Component/MyAccountMyWishlist/Component */
export class MyAccountMyWishlist extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        isWishlistLoading: PropTypes.bool.isRequired,
        removeAll: PropTypes.func.isRequired,
        addAllToCart: PropTypes.func.isRequired,
        shareWishlist: PropTypes.func.isRequired,
        isWishlistEmpty: PropTypes.bool.isRequired,
        wishlistItems: PropTypes.objectOf(ProductType).isRequired,
        isActionsDisabled: PropTypes.bool.isRequired,
        isEditingActive: PropTypes.bool.isRequired,
        isMobile: PropTypes.bool.isRequired,
        removeSelectedFromWishlist: PropTypes.func.isRequired
    };

    state = {
        selectedIdMap: []
    };

    actionLineMobileRef = createRef();

    productsRef = createRef();

    componentDidMount() {
        this.setActionLineHeight();
    }

    componentDidUpdate(prevProps) {
        const { isEditingActive: prevIsEditingActive, isMobile: prevIsMobile } = prevProps;
        const { isEditingActive, isMobile } = this.props;
        const { actionLineHeight: prevActionLineHeight } = this.state;
        const { actionLineHeight } = this.state;

        if ((prevIsEditingActive !== isEditingActive && prevActionLineHeight === actionLineHeight)
            || isMobile !== prevIsMobile
        ) {
            this.setActionLineHeight();
        }
    }

    setActionLineHeight() {
        const { isMobile } = this.props;
        const { current } = this.actionLineMobileRef;

        if (!current) {
            return;
        }

        CSS.setVariable(
            this.productsRef,
            'myaccount-wihslist-products-margin-bottom',
            isMobile ? `${ current.clientHeight }px` : 0
        );
    }

    handleSelectIdChange = (id) => {
        const { selectedIdMap: prevSelectedIdMap } = this.state;
        const selectIdIndex = prevSelectedIdMap.findIndex((selectId) => selectId === id);
        const selectedIdMap = Array.from(prevSelectedIdMap);

        if (selectIdIndex === -1) {
            selectedIdMap.push(id);
        } else {
            selectedIdMap.splice(selectIdIndex, 1);
        }

        this.setState({ selectedIdMap });
    };

    handleRemoveButtonClick = () => {
        // Removes selected items from wishlist

        const { removeSelectedFromWishlist } = this.props;
        const { selectedIdMap } = this.state;

        removeSelectedFromWishlist(selectedIdMap);

        this.setState({ selectedIdMap: [] });
    };

    renderNoProductsFound = () => (
        <div>
            <p>{ __('Wishlist is empty!') }</p>
        </div>
    );

    renderProduct = ([id, product]) => {
        const { isEditingActive } = this.props;

        return (
            <WishlistItem
              key={ id }
              product={ product }
              isEditingActive={ isEditingActive }
              handleSelectIdChange={ this.handleSelectIdChange }
            />
        );
    };

    renderProducts() {
        const {
            isWishlistLoading,
            isWishlistEmpty,
            wishlistItems
        } = this.props;

        if (isWishlistLoading && isWishlistEmpty) {
            return this.renderPlaceholders();
        }

        return Object.entries(wishlistItems).map(this.renderProduct);
    }

    renderClearWishlist() {
        const {
            removeAll,
            isActionsDisabled
        } = this.props;

        return (
            <button
              block="Button"
              mods={ { likeLink: true } }
              mix={ { block: 'MyAccountMyWishlist', elem: 'ClearWishlistButton' } }
              onClick={ removeAll }
              disabled={ isActionsDisabled }
            >
                { __('Clear Wishlist') }
            </button>
        );
    }

    renderAddAllToCart() {
        const {
            addAllToCart,
            isActionsDisabled,
            isEditingActive,
            isMobile
        } = this.props;

        const isDisabled = (isMobile && isEditingActive) || isActionsDisabled;

        return (
            <button
              block="Button"
              mix={ { block: 'MyAccountMyWishlist', elem: 'Button' } }
              onClick={ addAllToCart }
              disabled={ isDisabled }
            >
              { __('Add All to Cart') }
            </button>
        );
    }

    renderShareWishlistButton() {
        const {
            isWishlistLoading,
            shareWishlist,
            isWishlistEmpty
        } = this.props;

        const disabled = isWishlistLoading || isWishlistEmpty;

        return (
            <button
              mix={ { block: 'MyAccountMyWishlist', elem: 'ShareWishlistButton' } }
              onClick={ shareWishlist }
              disabled={ disabled }
              aria-label="Share"
            />
        );
    }

    renderRemoveItemsButton() {
        const { isActionsDisabled, isMobile } = this.props;
        const { selectedIdMap } = this.state;

        const isDisabled = isActionsDisabled || (isMobile && !selectedIdMap.length);

        return (
            <button
              block="Button"
              mods={ { likeLink: true } }
              mix={ { block: 'MyAccountMyWishlist', elem: 'ClearRemoveItemsButton' } }
              onClick={ this.handleRemoveButtonClick }
              disabled={ isDisabled }
            >
                { selectedIdMap.length === 1
                    ? __('Remove item (%s)', 1)
                    : __('Remove items (%s)', selectedIdMap.length) }
            </button>
        );
    }

    renderActionBarAction() {
        const { isEditingActive } = this.props;

        if (!isEditingActive) {
            return null;
        }

        return (
            <div block="MyAccountMyWishlist" elem="ActionBarActionWrapper">
                { this.renderRemoveItemsButton() }
                { this.renderClearWishlist() }
            </div>
        );
    }

    renderActionBarMobile() {
        return (
            <div
              ref={ this.actionLineMobileRef }
              block="MyAccountMyWishlist"
              elem="ActionBar"
            >
                { this.renderActionBarAction() }
                { this.renderAddAllToCart() }
            </div>
        );
    }

    renderActionBar() {
        const { isMobile } = this.props;

        if (isMobile) {
            return this.renderActionBarMobile();
        }

        return (
            <div block="MyAccountMyWishlist" elem="ActionBar">
                { this.renderClearWishlist() }
                { this.renderShareWishlistButton() }
                { this.renderAddAllToCart() }
            </div>
        );
    }

    renderPlaceholders() {
        return Array.from({ length: 2 }, (_, i) => <ProductCard key={ i } />);
    }

    renderShareWishlist() {
        return <ShareWishlistPopup />;
    }

    renderContent() {
        const {
            isWishlistLoading,
            isWishlistEmpty,
            isLoading
        } = this.props;

        if (isWishlistEmpty && !isWishlistLoading) {
            return this.renderNoProductsFound();
        }

        return (
            <div block="MyAccountMyWishlist" elem="Products" ref={ this.productsRef }>
                <Loader isLoading={ isLoading } />
                { this.renderProducts() }
            </div>
        );
    }

    render() {
        return (
            <div block="MyAccountMyWishlist">
                { this.renderShareWishlist() }
                { this.renderContent() }
                { this.renderActionBar() }
            </div>
        );
    }
}

export default MyAccountMyWishlist;
