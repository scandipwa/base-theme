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

import CartItemPrice from 'Component/CartItemPrice';
import Field from 'Component/Field';
import Image from 'Component/Image';
import Link from 'Component/Link';
import Loader from 'Component/Loader';
import { DeviceType } from 'Type/Device';
import { CartItemType } from 'Type/MiniCart';

import './CartItem.style';

/**
 * Cart and CartOverlay item
 * @class CartItem
 * @namespace Component/CartItem/Component
 */
export class CartItem extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        item: CartItemType.isRequired,
        currency_code: PropTypes.string.isRequired,
        isEditing: PropTypes.bool,
        isCartOverlay: PropTypes.bool,
        handleRemoveItem: PropTypes.func.isRequired,
        minSaleQuantity: PropTypes.number.isRequired,
        maxSaleQuantity: PropTypes.number.isRequired,
        handleChangeQuantity: PropTypes.func.isRequired,
        linkTo: PropTypes.oneOfType([
            PropTypes.shape({
                pathname: PropTypes.string,
                search: PropTypes.string
            }),
            PropTypes.string
        ]).isRequired,
        thumbnail: PropTypes.string.isRequired,
        isProductInStock: PropTypes.bool.isRequired,
        device: DeviceType.isRequired,
        optionsLabels: PropTypes.array.isRequired,
        isMobileLayout: PropTypes.bool
    };

    static defaultProps = {
        isEditing: false,
        isCartOverlay: false,
        isMobileLayout: false
    };

    renderProductConfigurations() {
        const { optionsLabels } = this.props;

        return (
            <div
              block="CartItem"
              elem="Options"
            >
                { optionsLabels.join(', ') }
            </div>
        );
    }

    renderWrapperContent() {
        const { isEditing, isMobileLayout } = this.props;

        if (isMobileLayout) {
            return this.renderMobileContent();
        }

        return isEditing ? this.renderDesktopContent() : this.renderDesktopSummary();
    }

    renderDesktopSummary() {
        return (
            <div block="CartItem" elem="Wrapper" mods={ { isSummary: true } }>
                { this.renderImage() }
                <div block="CartItem" elem="CartItemRows">
                    <div block="CartItem" elem="ProductInfo">
                        { this.renderTitle() }
                        { this.renderProductPrice() }
                    </div>
                    <div block="CartItem" elem="ProductActions">
                        { this.renderQuantity() }
                    </div>
                </div>
            </div>
        );
    }

    renderTitle() {
        const { isMobileLayout } = this.props;

        const {
            item: {
                customizable_options,
                bundle_options,
                downloadable_links
            } = {}
        } = this.props;

        return (
            <div block="CartItem" elem="Title" mods={ { isMobileLayout } }>
                { this.renderProductName() }
                { this.renderOutOfStockMessage() }
                { this.renderProductConfigurations() }
                { this.renderProductOptions(customizable_options) }
                { this.renderProductOptions(bundle_options) }
                { this.renderProductLinks(downloadable_links) }
            </div>
        );
    }

    renderMobileContent() {
        const { isMobileLayout, isProductInStock } = this.props;

        return (
            <div block="CartItem" elem="Wrapper" mods={ { isMobileLayout, isProductOutOfStock: !isProductInStock } }>
                { this.renderImage() }
                <div block="CartItem" elem="CartItemRows">
                    <div block="CartItem" elem="ProductInfo" mods={ { isMobileLayout } }>
                        { this.renderTitle() }
                        { this.renderDeleteButton() }
                    </div>
                    <div block="CartItem" elem="ProductActions" mods={ { isMobileLayout } }>
                        { this.renderQuantityChangeField() }
                        { this.renderProductPrice() }
                    </div>
                </div>
            </div>
        );
    }

    renderDesktopContent() {
        return (
            <div block="CartItem" elem="Wrapper" mods={ { isCart: true } }>
                <div block="CartItem" elem="ProductInfo">
                    { this.renderImage() }
                    { this.renderTitle() }
                </div>
                <div
                  block="CartItem"
                  elem="ProductActions"
                >
                    { this.renderQuantityChangeField() }
                    { this.renderDeleteButton() }
                </div>
                { this.renderProductPrice() }
            </div>
        );
    }

    renderContent() {
        const { linkTo = {}, isProductInStock, device } = this.props;

        if (!isProductInStock || Object.keys(linkTo).length === 0 || device.isMobile) {
            // If product is out of stock, or link is not set
            return (
                <span block="CartItem" elem="Link">
                    { this.renderWrapperContent() }
                </span>
            );
        }

        return (
            <Link to={ linkTo } block="CartItem" elem="Link">
                { this.renderWrapperContent() }
            </Link>
        );
    }

    renderProductOption = (option) => {
        const { label, values = [], id } = option;

        const labelText = values
            ? __('%s: %s', label, values.map(({ label, value }) => label || value).join(', '))
            : label;

        return (
            <div
              block="CartItem"
              elem="Option"
              key={ id }
            >
                { labelText }
            </div>
        );
    };

    renderProductOptions(itemOptions = []) {
        if (!itemOptions.length) {
            return null;
        }

        return (
            <div
              block="CartItem"
              elem="Options"
            >
                { itemOptions.map(this.renderProductOption) }
            </div>
        );
    }

    renderProductLinks(itemOptions = []) {
        if (!itemOptions.length) {
            return null;
        }

        return (
            <div
              block="CartItem"
              elem="ItemLinksWrapper"
            >
                <span
                  block="CartItem"
                  elem="ItemLinks"
                >
                    { __('Links:') }
                </span>
                <div
                  block="CartItem"
                  elem="ItemOptionsWrapper"
                >
                    { itemOptions.map(this.renderProductOption) }
                </div>
            </div>
        );
    }

    renderProductName() {
        const {
            item: {
                product: {
                    name
                }
            }
        } = this.props;

        return (
            <p
              block="CartItem"
              elem="Heading"
            >
                { name }
            </p>
        );
    }

    renderProductPrice() {
        const {
            currency_code,
            item: {
                row_total,
                row_total_incl_tax
            },
            isCartOverlay,
            isMobileLayout
        } = this.props;

        return (
            <CartItemPrice
              row_total={ row_total }
              row_total_incl_tax={ row_total_incl_tax }
              currency_code={ currency_code }
              mix={ {
                  block: 'CartItem',
                  elem: 'Price',
                  mods: { isCartOverlay, isMobileLayout }
              } }
            />
        );
    }

    renderOutOfStockMessage() {
        const { isProductInStock } = this.props;

        if (isProductInStock) {
            return null;
        }

        return (
            <p block="CartItem" elem="OutOfStock">
                { __('Product is out of stock') }
            </p>
        );
    }

    quantityClickHandler(e) {
        e.preventDefault();
    }

    renderQuantityChangeField() {
        const {
            item: { qty },
            minSaleQuantity,
            maxSaleQuantity,
            handleChangeQuantity,
            isProductInStock,
            isCartOverlay
        } = this.props;

        if (!isProductInStock) {
            return null;
        }

        return (
            <div
              block="CartItem"
              elem="QuantityWrapper"
              mods={ { isCartOverlay } }
              onClick={ this.quantityClickHandler }
              onKeyDown={ this.quantityClickHandler }
              role="button"
              tabIndex="-1"
            >
                <Field
                  id="item_qty"
                  name="item_qty"
                  type="number"
                  isControlled
                  min={ minSaleQuantity }
                  max={ maxSaleQuantity }
                  mix={ { block: 'CartItem', elem: 'Qty' } }
                  value={ qty }
                  onChange={ handleChangeQuantity }
                />
            </div>
        );
    }

    renderDeleteButton() {
        const { handleRemoveItem, isMobileLayout } = this.props;

        return (
            <button
              block="CartItem"
              id="RemoveItem"
              name="RemoveItem"
              elem="Delete"
              mods={ { isMobileLayout } }
              aria-label="Remove item from cart"
              onClick={ handleRemoveItem }
            >
                <span block="CartItem" elem="DeleteButtonText" mods={ { isMobileLayout } }>
                    { __('Delete') }
                </span>
            </button>
        );
    }

    renderImageElement() {
        const {
            item: {
                product: { name }
            },
            thumbnail,
            isProductInStock,
            isMobileLayout
        } = this.props;
        const isNotAvailable = !isProductInStock;

        return (
            <>
            <Image
              src={ thumbnail }
              mix={ {
                  block: 'CartItem',
                  elem: 'Picture',
                  mods: {
                      isNotAvailable, isMobileLayout
                  }
              } }
              ratio="custom"
              alt={ `Product ${name} thumbnail.` }
            />
                <img
                  style={ { display: 'none' } }
                  alt={ name }
                  src={ thumbnail }
                />
            </>
        );
    }

    renderImage() {
        const { linkTo, device } = this.props;

        if (device.isMobile) {
            return (
                <Link to={ linkTo } block="CartItem" elem="Link">
                    { this.renderImageElement() }
                </Link>
            );
        }

        return this.renderImageElement();
    }

    renderQuantity() {
        const { item: { qty } } = this.props;

        return (
            <p
              block="CartItem"
              elem="Quantity"
            >
                { __('Quantity: %s', qty) }
            </p>
        );
    }

    render() {
        const { isLoading, isEditing, isCartOverlay } = this.props;

        return (
            <div block="CartItem" mods={ { isEditing, isCartOverlay } }>
                <Loader isLoading={ isLoading } />
                { this.renderContent() }
            </div>
        );
    }
}

export default CartItem;
