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

import TextPlaceholder from 'Component/TextPlaceholder';
import { MixType } from 'Type/Common';
import { PriceType } from 'Type/ProductList';

import './ProductPrice.style';

/**
 * Product price
 * @class ProductPrice
 * @namespace Component/ProductPrice/Component
 */
export class ProductPrice extends PureComponent {
    static propTypes = {
        isSchemaRequired: PropTypes.bool,
        roundedRegularPrice: PropTypes.string,
        priceCurrency: PropTypes.string,
        discountPercentage: PropTypes.number,
        formattedFinalPrice: PropTypes.string,
        formattedSubPrice: PropTypes.string,
        defaultFinalPriceExclTax: PropTypes.number,
        variantsCount: PropTypes.number,
        price: PriceType,
        label: PropTypes.string,
        price_tiers: PropTypes.array,
        mix: MixType
    };

    static defaultProps = {
        isSchemaRequired: false,
        roundedRegularPrice: '0',
        priceCurrency: 'USD',
        defaultFinalPriceExclTax: 0,
        discountPercentage: 0,
        formattedFinalPrice: '0',
        formattedSubPrice: null,
        variantsCount: 0,
        mix: {},
        price: {},
        label: '',
        price_tiers: []
    };

    renderPlaceholder() {
        const { mix } = this.props;

        return (
            <p block="ProductPrice" aria-label="Product Price" mix={ mix }>
                <TextPlaceholder mix={ { block: 'ProductPrice', elem: 'Placeholder' } } length="custom" />
            </p>
        );
    }

    getCurrencySchema() {
        const { isSchemaRequired, priceCurrency } = this.props;

        return isSchemaRequired ? { itemProp: 'priceCurrency', content: priceCurrency } : {};
    }

    getCurrentPriceSchema() {
        const { isSchemaRequired, variantsCount, price } = this.props;
        const content_price = price.minimum_price.final_price
            ? price.minimum_price.final_price.value : price.minimum_price.regular_price.value;

        if (variantsCount > 1) {
            return isSchemaRequired ? { itemProp: 'lowPrice', content: content_price } : {};
        }

        return isSchemaRequired ? { itemProp: 'price', content: content_price } : {};
    }

    renderCurrentPrice() {
        const {
            discountPercentage,
            formattedFinalPrice,
            label
        } = this.props;

        const priceSchema = this.getCurrentPriceSchema();

        // Use <ins></ins> <del></del> to represent new price and the old (deleted) one
        const PriceSemanticElementName = discountPercentage > 0 ? 'ins' : 'span';

        // force unequal comparison - unsure of resulting type
        // eslint-disable-next-line
        if (formattedFinalPrice == 0) {
            return null;
        }

        return (
            <PriceSemanticElementName block="ProductPrice" elem="Price">
                { this.renderPriceBadge(label) }
                <span { ...priceSchema }>{ formattedFinalPrice }</span>
            </PriceSemanticElementName>
        );
    }

    renderPriceBadge(label) {
        if (!label) {
            return null;
        }

        return <span mix={ { block: 'ProductPrice', elem: 'PriceBadge' } }>{ label }</span>;
    }

    renderSubPrice() {
        const { formattedSubPrice } = this.props;

        if (!formattedSubPrice) {
            return null;
        }

        return (
            <span
              aria-label={ __('Current product price excl. tax') }
              block="ProductPrice"
              elem="SubPrice"
            >
                { __('Excl. tax: %s', formattedSubPrice) }
            </span>
        );
    }

    renderOldPrice() {
        const {
            discountPercentage,
            roundedRegularPrice,
            isSchemaRequired,
            variantsCount,
            price_tiers,
            label
        } = this.props;

        const schema = isSchemaRequired && variantsCount > 1 ? { itemProp: 'highPrice' } : {};

        if (discountPercentage === 0 || roundedRegularPrice === 0 || price_tiers.length || label) {
            return null;
        }

        return (
            <del
              block="ProductPrice"
              elem="HighPrice"
              aria-label={ __('Old product price') }
              { ...schema }
            >
                { roundedRegularPrice }
            </del>
        );
    }

    renderSchema() {
        const { isSchemaRequired } = this.props;

        if (isSchemaRequired) {
            const currencySchema = this.getCurrencySchema();

            return (
                <meta { ...currencySchema } />
            );
        }

        return null;
    }

    render() {
        const {
            price: {
                minimum_price: {
                    final_price,
                    regular_price
                } = {}
            } = {},
            discountPercentage,
            formattedFinalPrice,
            mix
        } = this.props;

        if (!final_price || !regular_price) {
            return this.renderPlaceholder();
        }

        return (
            <p
              block="ProductPrice"
              mods={ { hasDiscount: discountPercentage !== 0 } }
              mix={ mix }
              aria-label={ `Product price: ${formattedFinalPrice}` }
            >
                { this.renderOldPrice() }
                { this.renderCurrentPrice() }
                { this.renderSubPrice() }
                { this.renderSchema() }
            </p>
        );
    }
}

export default ProductPrice;
