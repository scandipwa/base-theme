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
import { connect } from 'react-redux';

import { OUT_OF_STOCK } from 'Component/ProductCard/ProductCard.config';
import { ProductType } from 'Type/ProductList';
import {
    BUNDLE,
    CONFIGURABLE,
    DOWNLOADABLE,
    GROUPED,
    SIMPLE,
    VIRTUAL
} from 'Util/Product';

import ProductActions from './ProductActions.component';
import { DEFAULT_MAX_PRODUCTS, ONE_HUNDRED_PERCENT } from './ProductActions.config';

/** @namespace Component/ProductActions/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    groupedProductQuantity: state.ProductReducer.groupedProductQuantity,
    device: state.ConfigReducer.device,
    displayProductStockStatus: state.ConfigReducer.display_product_stock_status,
    isWishlistEnabled: state.ConfigReducer.wishlist_general_active,
    areReviewsEnabled: state.ConfigReducer.reviews_are_enabled
});

/** @namespace Component/ProductActions/Container/mapDispatchToProps */
export const mapDispatchToProps = () => ({});

/** @namespace Component/ProductActions/Container */
export class ProductActionsContainer extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        productOrVariant: PropTypes.object.isRequired,
        configurableVariantIndex: PropTypes.number.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired,
        productOptionsData: PropTypes.objectOf(PropTypes.array).isRequired,
        parameters: PropTypes.objectOf(PropTypes.string).isRequired,
        selectedInitialBundlePrice: PropTypes.number.isRequired,
        selectedBundlePrice: PropTypes.number.isRequired,
        selectedBundlePriceExclTax: PropTypes.number.isRequired,
        selectedLinkPrice: PropTypes.number.isRequired,
        getLink: PropTypes.func.isRequired,
        isWishlistEnabled: PropTypes.bool.isRequired
    };

    static getMinQuantity(props) {
        const {
            product: { stock_item: { min_sale_qty } = {}, variants } = {},
            configurableVariantIndex
        } = props;

        if (!min_sale_qty) {
            return 1;
        }
        if (!configurableVariantIndex && !variants) {
            return min_sale_qty;
        }

        const { stock_item: { min_sale_qty: minVariantQty } = {} } = variants[configurableVariantIndex] || {};

        return minVariantQty || min_sale_qty;
    }

    static getMaxQuantity(props) {
        const {
            product: {
                stock_item: {
                    max_sale_qty
                } = {},
                variants
            } = {},
            configurableVariantIndex
        } = props;

        if (!max_sale_qty) {
            return DEFAULT_MAX_PRODUCTS;
        }

        if (configurableVariantIndex === -1 || !Object.keys(variants).length) {
            return max_sale_qty;
        }

        const {
            stock_item: {
                max_sale_qty: maxVariantQty
            } = {}
        } = variants[configurableVariantIndex] || {};

        return maxVariantQty || max_sale_qty;
    }

    state = {
        quantity: 1,
        groupedProductQuantity: {}
    };

    containerFunctions = {
        showOnlyIfLoaded: this.showOnlyIfLoaded.bind(this),
        onProductValidationError: this.onProductValidationError.bind(this),
        getIsOptionInCurrentVariant: this.getIsOptionInCurrentVariant.bind(this),
        setQuantity: this.setQuantity.bind(this),
        setGroupedProductQuantity: this._setGroupedProductQuantity.bind(this),
        clearGroupedProductQuantity: this._clearGroupedProductQuantity.bind(this),
        setRefs: this.setRefs.bind(this),
        getIsConfigurableAttributeAvailable: this.getIsConfigurableAttributeAvailable.bind(this),
        filterConfigurableOptions: this.filterConfigurableOptions.bind(this)
    };

    static getDerivedStateFromProps(props, state) {
        const { quantity } = state;
        const minQty = ProductActionsContainer.getMinQuantity(props);
        const maxQty = ProductActionsContainer.getMaxQuantity(props);

        if (quantity < minQty) {
            return { quantity: minQty };
        }
        if (quantity > maxQty) {
            return { quantity: maxQty };
        }

        return null;
    }

    setRefs(refs) {
        const {
            configurableOptionsRef,
            groupedProductsRef
        } = refs;

        this.onConfigurableProductError = this.onProductError.bind(this, configurableOptionsRef);
        this.onGroupedProductError = this.onProductError.bind(this, groupedProductsRef);
    }

    onProductError(ref) {
        if (!ref) {
            return;
        }
        const { current } = ref;

        current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        current.classList.remove('animate');
        // eslint-disable-next-line no-unused-expressions
        current.offsetWidth; // trigger a DOM reflow
        current.classList.add('animate');
    }

    onProductValidationError(type) {
        switch (type) {
        case CONFIGURABLE:
            this.onConfigurableProductError();
            break;
        case GROUPED:
            this.onGroupedProductError();
            break;
        default:
            break;
        }
    }

    setQuantity(value) {
        this.setState({ quantity: +value });
    }

    // TODO: make key=>value based
    getIsOptionInCurrentVariant(attribute, value) {
        const { configurableVariantIndex, product: { variants } } = this.props;
        if (!variants) {
            return false;
        }

        return variants[configurableVariantIndex].product[attribute] === value;
    }

    filterConfigurableOptions(options) {
        const { product: { variants } } = this.props;

        return Object.values(options).reduce((acc, option) => {
            const { attribute_values, attribute_code } = option;

            // show option if it exist as variant for configurable product
            const filteredOptions = attribute_values.reduce((acc, value) => {
                const isVariantExist = variants.find(({ attributes }) => {
                    const { attribute_value: foundValue } = attributes[attribute_code] || {};

                    return value === foundValue;
                });

                if (isVariantExist) {
                    acc.push(value);
                }

                return acc;
            }, []);

            acc.push({ ...option, attribute_values: filteredOptions });

            return acc;
        }, []);
    }

    getIsConfigurableAttributeAvailable({ attribute_code, attribute_value }) {
        const { parameters, product: { variants } } = this.props;

        const isAttributeSelected = Object.hasOwnProperty.call(parameters, attribute_code);

        // If value matches current attribute_value, option should be enabled
        if (isAttributeSelected && parameters[attribute_code] === attribute_value) {
            return true;
        }

        const parameterPairs = Object.entries(parameters);

        const selectedAttributes = isAttributeSelected
            // Need to exclude itself, otherwise different attribute_values of the same attribute_code will always be disabled
            ? parameterPairs.filter(([key]) => key !== attribute_code)
            : parameterPairs;

        return variants
            .some(({ stock_status, attributes }) => {
                const { attribute_value: foundValue } = attributes[attribute_code] || {};

                return (
                    stock_status === 'IN_STOCK'
                    // Variant must have currently checked attribute_code and attribute_value
                    && foundValue === attribute_value
                    // Variant must have all currently selected attributes
                    && selectedAttributes.every(([key, value]) => attributes[key].attribute_value === value)
                );
            });
    }

    containerProps = () => ({
        minQuantity: ProductActionsContainer.getMinQuantity(this.props),
        maxQuantity: ProductActionsContainer.getMaxQuantity(this.props),
        groupedProductQuantity: this._getGroupedProductQuantity(),
        productPrice: this.getProductPrice(),
        productName: this.getProductName(),
        offerCount: this.getOfferCount(),
        offerType: this.getOfferType(),
        stockMeta: this.getStockMeta(),
        metaLink: this.getMetaLink()
    });

    getProductName() {
        const {
            product,
            product: { variants = [] },
            configurableVariantIndex
        } = this.props;

        const {
            name
        } = variants[configurableVariantIndex] || product;

        return name;
    }

    getMetaLink() {
        const { getLink } = this.props;

        return window.location.origin + getLink().replace(/\?.*/, '');
    }

    getStockMeta() {
        const {
            product,
            product: { variants = [] },
            configurableVariantIndex
        } = this.props;

        const {
            stock_status
        } = variants[configurableVariantIndex] || product;

        if (stock_status === OUT_OF_STOCK) {
            return 'https://schema.org/OutOfStock';
        }

        return 'https://schema.org/InStock';
    }

    getOfferType() {
        const { product: { variants } } = this.props;

        if (variants && variants.length >= 1) {
            return 'https://schema.org/AggregateOffer';
        }

        return 'https://schema.org/Offer';
    }

    getOfferCount() {
        const { product: { variants } } = this.props;

        if (variants && variants.length) {
            return variants.length;
        }

        return 0;
    }

    getSelectedOptions() {
        const {
            productOptionsData: {
                productOptionsMulti = [],
                productOptions = []
            } = {}
        } = this.props;

        return [...productOptionsMulti, ...productOptions].map((productOption) => {
            const { option_value } = productOption;

            return parseInt(option_value, 10);
        });
    }

    getSelectedOptionsMulti() {
        const {
            productOptionsData: {
                productOptionsMulti = [],
                productOptions = []
            } = {}
        } = this.props;

        return [...productOptionsMulti, ...productOptions].map((productOption) => {
            const { option_id } = productOption;

            return parseInt(option_id, 10);
        });
    }

    getOptionPricesTotal(options) {
        const selectedOptions = this.getSelectedOptions();
        const selectedOptionsMulti = this.getSelectedOptionsMulti();

        return options.reduce(([priceInclTaxTotal, priceExclTaxTotal], { data = [], option_id, type }) => {
            /*
            * Such types contain a single item within data
            * as those are looked up on the option_id
            */
            if (['area', 'field', 'file'].includes(type)) {
                if (selectedOptionsMulti.includes(option_id)) {
                    const [{ priceInclTax, priceExclTax }] = data;
                    return [priceInclTaxTotal + priceInclTax, priceExclTaxTotal + priceExclTax];
                }

                return [priceInclTaxTotal, priceExclTaxTotal];
            }

            const [
                selectionPriceInclTax,
                selectionPriceExclTax
            ] = data.reduce((
                [optionPriceInclTax, optionPriceExclTax], { option_type_id, priceInclTax, priceExclTax }
            ) => {
                if (selectedOptions.includes(option_type_id)) {
                    return [
                        optionPriceInclTax + priceInclTax,
                        optionPriceExclTax + priceExclTax
                    ];
                }

                return [optionPriceInclTax, optionPriceExclTax];
            }, [0, 0]);

            return [
                priceInclTaxTotal + selectionPriceInclTax,
                priceExclTaxTotal + selectionPriceExclTax
            ];
        }, [0, 0]);
    }

    getSimpleBasePrice() {
        const {
            product: {
                price_range: {
                    minimum_price: {
                        regular_price_excl_tax: {
                            currency
                        } = {},
                        default_final_price_excl_tax: {
                            value: defaultFinalPriceExclTax = 0
                        } = {},
                        default_final_price: {
                            value: defaultFinalPrice = 0
                        } = {},
                        default_price: {
                            value: defaultPrice = 0
                        } = {},
                        discount: {
                            percent_off = 0
                        } = {}
                    } = {}
                } = {}
            } = {}
        } = this.props;

        return {
            minimum_price: {
                final_price: {
                    currency,
                    value: defaultFinalPrice
                },
                discount: { percent_off },
                regular_price: { value: defaultPrice },
                final_price_excl_tax: { value: defaultFinalPriceExclTax }
            }
        };
    }

    getCustomizablePrice({
        minimum_price: {
            final_price: {
                currency,
                value: finalPrice
            },
            discount: { percent_off },
            regular_price: { value: regularPrice },
            final_price_excl_tax: { value: finalPriceExclTax }
        }
    }) {
        const { product: { options = [] } = {} } = this.props;

        const [priceInclTax, priceExclTax] = this.getOptionPricesTotal(options);

        return {
            minimum_price: {
                final_price: {
                    currency,
                    value: priceInclTax + finalPrice
                },
                discount: { percent_off },
                regular_price: { value: priceInclTax + regularPrice },
                final_price_excl_tax: { value: priceExclTax + finalPriceExclTax }
            }
        };
    }

    getProductPrice() {
        const { product: { options = {} } } = this.props;

        const priceWithVariants = this.getProductPriceWithVariants();

        if (Object.keys(options).length === 0) {
            return priceWithVariants;
        }

        return this.getCustomizablePrice(priceWithVariants);
    }

    getProductPriceWithVariants() {
        const {
            product,
            product: { variants = [], type_id, links_purchased_separately },
            configurableVariantIndex,
            selectedLinkPrice
        } = this.props;

        const { options = [] } = product;

        const {
            price_range
        } = variants[configurableVariantIndex] || product;

        if (type_id === BUNDLE) {
            const {
                selectedBundlePrice,
                selectedBundlePriceExclTax,
                selectedInitialBundlePrice,
                product: { dynamic_price }
            } = this.props;

            return this._getBundleCustomPrice(
                selectedBundlePrice,
                selectedBundlePriceExclTax,
                selectedInitialBundlePrice,
                dynamic_price
            );
        }

        if (type_id === DOWNLOADABLE && links_purchased_separately) {
            return this._getCustomPrice(selectedLinkPrice, selectedLinkPrice, true);
        }

        if ((type_id === SIMPLE || type_id === VIRTUAL) && options.length !== 0) {
            // price of a product before selecting any options
            return this.getSimpleBasePrice();
        }

        return price_range;
    }

    _getCustomPrice(price, withoutTax, addBase = false) {
        const {
            product: {
                price_range: {
                    minimum_price: {
                        regular_price: { currency = '', value = 0 } = {},
                        regular_price_excl_tax: { value: value_excl_tax = 0 } = {},
                        discount: { percent_off = 0 } = {}
                    } = {}
                } = {}
            } = {}
        } = this.props;

        const discount = (1 - percent_off / ONE_HUNDRED_PERCENT);

        const basePrice = addBase ? value : 0;
        const basePriceExclTax = addBase ? value_excl_tax : 0;

        const finalPrice = (basePrice + price) * discount;
        const finalPriceExclTax = (basePriceExclTax + withoutTax) * discount;

        const priceValue = { value: finalPrice, currency };
        const priceValueExclTax = { value: finalPriceExclTax, currency };

        return {
            minimum_price: {
                final_price: priceValue,
                regular_price: priceValue,
                final_price_excl_tax: priceValueExclTax,
                regular_price_excl_tax: priceValueExclTax
            }
        };
    }

    _getBundleCustomPrice(price, withoutTax, initial, isDynamicPrice) {
        const {
            product: {
                price_range: {
                    minimum_price: {
                        default_price: { currency, value: defaultPrice },
                        default_final_price: { value: defaultFinalPrice },
                        default_final_price_excl_tax: { value: defaultFinalPriceExclTax },
                        discount: discountData,
                        discount: { percent_off }
                    }
                }
            }
        } = this.props;

        // If bundle product has dynamic price, it's own base price is always 0. For fix priced bundles price it's configurable
        const addBase = !isDynamicPrice;

        // Adjusting `discount` for bundle products for discount to be displayed on PDP
        const priceBeforeDiscount = addBase ? defaultPrice : initial;
        const priceAfterDiscount = addBase ? defaultFinalPrice : price;
        const finalDiscount = !percent_off && defaultPrice !== defaultFinalPrice
            ? {
                percent_off: (ONE_HUNDRED_PERCENT * (priceBeforeDiscount - priceAfterDiscount)) / priceBeforeDiscount,
                amount_off: priceBeforeDiscount - priceAfterDiscount
            }
            : discountData;

        // Set initial price different from 0 for specific product types, i.e. downloadable, bundles with fixed price
        const baseInitialPrice = addBase ? defaultPrice : 0;
        const baseFinalPrice = addBase ? defaultFinalPrice : 0;
        const basePriceExclTax = addBase ? defaultFinalPriceExclTax : 0;

        const initialPrice = baseInitialPrice + initial;
        const finalPrice = baseFinalPrice + price;
        const finalPriceExclTax = basePriceExclTax + withoutTax;

        const initialPriceValue = { value: initialPrice, currency };
        const priceValue = { value: finalPrice, currency };
        const priceValueExclTax = { value: finalPriceExclTax, currency };

        return {
            minimum_price: {
                final_price: priceValue,
                regular_price: initialPriceValue,
                final_price_excl_tax: priceValueExclTax,
                regular_price_excl_tax: initialPriceValue,
                discount: finalDiscount
            }
        };
    }

    _getGroupedProductQuantity() {
        const { groupedProductQuantity } = this.state;

        return groupedProductQuantity;
    }

    _setGroupedProductQuantity(id, value) {
        this.setState(({ groupedProductQuantity }) => ({
            groupedProductQuantity: {
                ...groupedProductQuantity,
                [id]: value
            }
        }));
    }

    _clearGroupedProductQuantity() {
        this.setState({ groupedProductQuantity: {} });
    }

    showOnlyIfLoaded(expression, content, placeholder = content) {
        const { areDetailsLoaded } = this.props;

        if (!areDetailsLoaded) {
            return placeholder;
        }
        if (areDetailsLoaded && !expression) {
            return null;
        }

        return content;
    }

    render() {
        return (
            <ProductActions
              { ...this.props }
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductActionsContainer);
