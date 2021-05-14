/* eslint-disable react/jsx-one-expression-per-line */
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
        isLikeTable: PropTypes.bool,
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
        optionsLabels: PropTypes.array.isRequired
    };

    static defaultProps = {
        isEditing: false,
        isLikeTable: false
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
        return (
            <figure block="CartItem" elem="Wrapper">
                { this.renderImage() }
                { this.renderContent() }
            </figure>
        );
    }

    renderWrapper() {
        const { linkTo, isProductInStock, device } = this.props;

        // TODO: implement shared-transition here?

        if (!isProductInStock || Object.keys(linkTo).length === 0) {
            // If product is out of stock, or link is not set
            return (
                <span block="CartItem" elem="Link">
                    { this.renderWrapperContent() }
                </span>
            );
        }

        if (device.isMobile) {
            return (
                this.renderWrapperContent()
            );
        }

        return (
            <Link to={ linkTo } block="CartItem" elem="Link">
                { this.renderWrapperContent() }
            </Link>
        );
    }

    renderProductOption = (option) => {
        const { label, values, id } = option;

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
        const { isLikeTable } = this.props;

        if (!itemOptions.length) {
            return null;
        }

        return (
            <div
              block="CartItem"
              elem="Options"
              mods={ { isLikeTable } }
            >
                { itemOptions.map(this.renderProductOption) }
            </div>
        );
    }

    renderProductLinks(itemOptions = []) {
        const { isLikeTable } = this.props;

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
                  mods={ { isLikeTable } }
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
            isLikeTable,
            currency_code,
            item: {
                row_total,
                row_total_incl_tax
            }
        } = this.props;

        return (
            <CartItemPrice
              row_total={ row_total }
              row_total_incl_tax={ row_total_incl_tax }
              currency_code={ currency_code }
              mix={ {
                  block: 'CartItem',
                  elem: 'Price',
                  mods: { isLikeTable }
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

    renderContent() {
        const {
            isLikeTable,
            item: {
                customizable_options,
                bundle_options,
                downloadable_links
            } = {}
        } = this.props;

        return (
                <figcaption
                  block="CartItem"
                  elem="Content"
                  mods={ { isLikeTable } }
                >
                    { this.renderOutOfStockMessage() }
                    <div block="CartItem" elem="HeadingWrapper">
                        <div block="CartItem" elem="Title">
                            { this.renderProductName() }
                            { this.renderProductConfigurations() }
                            { this.renderProductOptions(customizable_options) }
                            { this.renderProductOptions(bundle_options) }
                        </div>
                        { this.renderDeleteButton(true) }
                        { this.renderProductLinks(downloadable_links) }
                        { this.renderQuantityChangeField(true) }
                        { this.renderProductPrice() }
                    </div>
                    { this.renderQuantity() }
                </figcaption>
        );
    }

    renderQuantityChangeField(isVisibleOnMobile = false) {
        const {
            item: { qty },
            minSaleQuantity,
            maxSaleQuantity,
            handleChangeQuantity,
            isProductInStock,
            device
        } = this.props;

        if (!isProductInStock) {
            return null;
        }

        if (!isVisibleOnMobile && device.isMobile) {
            return null;
        }

        if (isVisibleOnMobile && !device.isMobile) {
            return null;
        }

        return (
            <div block="CartItem" elem="QuantityWrapper">
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

    renderActions() {
        const {
            isEditing,
            isLikeTable
        } = this.props;

        return (
            <div
              block="CartItem"
              elem="Actions"
              mods={ { isEditing, isLikeTable } }
            >
                { this.renderDeleteButton() }
                { this.renderQuantityChangeField() }
            </div>
        );
    }

    renderDeleteButton(isVisibleOnMobile = false) {
        const { handleRemoveItem, device } = this.props;

        if (!isVisibleOnMobile && device.isMobile) {
            return null;
        }

        if (isVisibleOnMobile && !device.isMobile) {
            return null;
        }

        return (
            <button
              block="CartItem"
              id="RemoveItem"
              name="RemoveItem"
              elem="Delete"
              aria-label="Remove item from cart"
              onClick={ handleRemoveItem }
            >
                <span block="CartItem" elem="DeleteButtonText">{ __('Delete') }</span>
            </button>
        );
    }

    renderImageElement() {
        const { item: { product: { name } }, thumbnail, isProductInStock } = this.props;
        const isNotAvailable = !isProductInStock;
        return (
            <>
            <Image
              src={ thumbnail }
              mix={ {
                  block: 'CartItem',
                  elem: 'Picture',
                  mods: {
                      isNotAvailable
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
        const { item: { qty }, isEditing } = this.props;

        return (
            <p
              block="CartItem"
              elem="Quantity"
              mods={ { isEditing } }
            >
                { __('Quantity: %s', qty) }
            </p>
        );
    }

    render() {
        const { isLoading, isEditing } = this.props;

        return (
            <div block="CartItem" mods={ { isEditing } }>
                <Loader isLoading={ isLoading } />
                { this.renderWrapper() }
                { this.renderActions() }
            </div>
        );
    }
}

export default CartItem;
