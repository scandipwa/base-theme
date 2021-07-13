/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
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

import Field from 'Component/Field';
import ProductCard from 'Component/ProductCard';
import ProductReviewRating from 'Component/ProductReviewRating';
import { ProductType } from 'Type/ProductList';
import { BUNDLE, CONFIGURABLE, GROUPED } from 'Util/Product';

import './WishlistItem.style';

/** @namespace Component/WishlistItem/Component */
export class WishlistItem extends PureComponent {
    static propTypes = {
        addToCart: PropTypes.func,
        changeQuantity: PropTypes.func,
        product: ProductType.isRequired,
        changeDescription: PropTypes.func,
        removeItem: PropTypes.func,
        redirectToProductPage: PropTypes.func,
        isLoading: PropTypes.bool,
        isRemoving: PropTypes.bool,
        isMobile: PropTypes.bool.isRequired,
        isEditingActive: PropTypes.bool.isRequired,
        handleSelectIdChange: PropTypes.func.isRequired
    };

    static defaultProps = {
        addToCart: () => {},
        changeQuantity: () => {},
        changeDescription: () => {},
        removeItem: () => {},
        redirectToProductPage: () => {},
        isLoading: false,
        isRemoving: false
    };

    optionRenderMap = {
        [GROUPED]: this.renderGroupedOption.bind(this),
        [BUNDLE]: this.renderBundleOption.bind(this)
    };

    renderCommentField() {
        const {
            product: { wishlist: { description } },
            changeDescription
        } = this.props;

        return (
            <Field
              id="description"
              name="description"
              type="input"
              value={ description }
              mix={ { block: 'WishlistItem', elem: 'CommentField' } }
              placeholder={ __('Add a comment') }
              onChange={ changeDescription }
            />
        );
    }

    renderQuantityFieldInput() {
        const {
            product: { wishlist: { quantity } },
            changeQuantity
        } = this.props;

        return (
            <Field
              id="item_qty"
              name="item_qty"
              type="number"
              min={ 1 }
              value={ quantity }
              mix={ { block: 'WishlistItem', elem: 'QuantityInput' } }
              onChange={ changeQuantity }
            />
        );
    }

    renderQuantityField() {
        const {
            product: { wishlist: { quantity } },
            isEditingActive,
            isMobile
        } = this.props;

        if (!isMobile) {
            return this.renderQuantityFieldInput();
        }

        return (
            <div block="WishlistItem" elem="QuantityWrapper">
                <span block="WishlistItem" elem="QuantityText">{ __('Qty:') }</span>
                { isEditingActive
                    ? this.renderQuantityFieldInput()
                    : quantity }
            </div>
        );
    }

    renderAddToCartButton() {
        const {
            addToCart,
            isEditingActive,
            isMobile
        } = this.props;

        const mods = isMobile ? { isEditingActive } : {};

        return (
            <button
              block="Button"
              mods={ { isHollow: isMobile } }
              mix={ { block: 'WishlistItem', elem: 'AddToCart', mods } }
              onClick={ addToCart }
            >
                { __('Add to cart') }
            </button>
        );
    }

    renderRemove() {
        const { removeItem } = this.props;

        return (
            <button
              block="WishlistItem"
              elem="Remove"
              onClick={ removeItem }
              aria-label={ __('Remove') }
            />
        );
    }

    getWishlistProduct() {
        const {
            product,
            product: { url, type_id }
        } = this.props;

        if (type_id !== CONFIGURABLE) {
            return product;
        }

        const wishedVariant = product.variants.find(({ sku }) => sku === product.wishlist.sku);

        if (!wishedVariant) {
            return {
                ...product,
                url
            };
        }

        return {
            ...wishedVariant,
            url
        };
    }

    renderGroupedOption(option) {
        const { label, value } = option;

        return (
            <span block="WishlistItemOption">
                { `${ value} x ${label }` }
            </span>
        );
    }

    renderBundleOption(option) {
        const { label, value } = option;

        return (
            <span block="WishlistItemOption">
                { `${label }: ${ value}` }
            </span>
        );
    }

    renderOptions() {
        const { product: { type_id, wishlist: { options } } } = this.props;

        const renderMethod = this.optionRenderMap[type_id];

        if (renderMethod) {
            return (
                <div block="WishlistItemOptions" elem="List">
                    { options.map(renderMethod) }
                </div>
            );
        }

        return (
            <div block="WishlistItemOptions" elem="List">
                { options.map(({ value }) => value).join(', ') }
            </div>
        );
    }

    renderRating() {
        const { product: { rating_summary, review_count } } = this.props;

        if (review_count < 1) {
            return <div block="WishlistItem" elem="RatingPlaceholder" />;
        }

        return <ProductReviewRating summary={ rating_summary } count={ review_count } />;
    }

    renderBrand() {
        const {
            product: {
                attributes: { brand: { attribute_value: brand } = {} } = {}
            }
        } = this.props;

        return (
            <div block="WishlistItem" elem="Brand">{ brand }</div>
        );
    }

    renderName() {
        const { product: { name } } = this.props;

        return (
            <h4>{ name }</h4>
        );
    }

    renderPrice(productPrice) {
        return (
            <div
              block="WishlistItem"
              elem="Price"
            >
                { productPrice() }
            </div>
        );
    }

    renderSelectCheckbox() {
        const { product: { wishlist: { id } }, handleSelectIdChange, isEditingActive } = this.props;

        return (
            <div block="WishlistItem" elem="Select" mods={ { isEditingActive } }>
                <Field
                  type="checkbox"
                  id={ `option-${ id }` }
                  name={ `option-${ id }` }
                  // eslint-disable-next-line react/jsx-no-bind
                  onClick={ () => handleSelectIdChange(id) }
                />
            </div>
        );
    }

    renderCardFooterMobile() {
        const { redirectToProductPage } = this.props;

        return (
            <div block="WishlistItem" elem="Content">
                { this.renderCommentField() }
                <div block="WishlistItem" elem="ActionWrapper">
                    { this.renderAddToCartButton() }
                    <span
                      block="WishlistItem"
                      elem="EditIcon"
                      onClick={ redirectToProductPage }
                    />
                </div>
            </div>
        );
    }

    renderCardDataMobile({
        content: { productPrice },
        pictureBlock: { picture: renderPicture },
        renderCardLinkWrapper
    }) {
        return (
            <div block="WishlistItem" elem="FigureWrapper">
                { renderCardLinkWrapper((
                    <figure mix={ { block: 'ProductCard', elem: 'Figure' } }>
                        { renderPicture({ block: 'WishlistItem', elem: 'Picture' }) }
                    </figure>
                ), { block: 'WishlistItem', elem: 'ImageWrapper' }) }
                <div block="WishlistItem" elem="InformationWrapper">
                    <div block="WishlistItem" elem="RowWrapper">
                        <div>
                            { this.renderName() }
                            { this.renderOptions() }
                        </div>
                        { this.renderRemove() }
                    </div>
                    <div block="WishlistItem" elem="RowWrapper">
                        { this.renderQuantityFieldInput() }
                        { this.renderPrice(productPrice) }
                    </div>
                </div>
            </div>
        );
    }

    renderContentMobile(renderMethods) {
        const {
            isEditingActive
        } = this.props;

        return (
            <div block="WishlistItem" elem="SelectWrapper">
                    { this.renderSelectCheckbox() }
                    <div block="WishlistItem" elem="ContentWrapper" mods={ { isEditingActive } }>
                        { this.renderCardDataMobile(renderMethods) }
                        { this.renderCardFooterMobile() }
                    </div>
            </div>
        );
    }

    renderContent = (renderMethods) => {
        const { redirectToProductPage } = this.props;

        const {
            content: { productPrice },
            pictureBlock: { picture: renderPicture },
            renderCardLinkWrapper
        } = renderMethods;

        const { isMobile } = this.props;

        if (isMobile) {
            return this.renderContentMobile(renderMethods);
        }

        return (
            <>
                <div block="WishlistItem" elem="FigureWrapper">
                    { renderCardLinkWrapper(
                        <>
                            <figure mix={ { block: 'ProductCard', elem: 'Figure' } }>
                                { renderPicture({ block: 'WishlistItem', elem: 'Picture' }) }
                            </figure>
                            { this.renderRating() }
                            { this.renderBrand() }
                            { this.renderName() }
                        </>
                    ) }
                    { this.renderRemove() }
                </div>
                { this.renderOptions() }
                <div block="WishlistItem" elem="Content">
                    <div block="WishlistItem" elem="RowWrapper">
                        { this.renderPrice(productPrice) }
                        { this.renderQuantityFieldInput() }
                    </div>
                    { this.renderCommentField() }
                    <div block="WishlistItem" elem="ActionWrapper">
                        { this.renderAddToCartButton() }
                        <span
                          block="WishlistItem"
                          elem="EditIcon"
                          onClick={ redirectToProductPage }
                        />
                    </div>
                </div>
            </>
        );
    };

    render() {
        const { isLoading, isRemoving } = this.props;

        return (
            <ProductCard
              product={ this.getWishlistProduct() }
              mix={ { block: 'WishlistItem', elem: 'ProductCard' } }
              isLoading={ isLoading || isRemoving }
              renderContent={ this.renderContent }
              hideWishlistButton
              hideCompareButton
            />
        );
    }
}

export default WishlistItem;
