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

import { CUSTOMER } from 'Store/MyAccount/MyAccount.dispatcher';
import BrowserDatabase from 'Util/BrowserDatabase';
import { Field, Fragment } from 'Util/Query';

/**
 * Product List Query
 * @class ProductListQuery
 * @namespace Query/ProductList
 */
export class ProductListQuery {
    __construct() {
        super.__construct();
        this.options = {};
    }

    getQuery(options) {
        if (!options) {
            throw new Error('Missing argument `options`');
        }

        this.options = options;

        return this._getProductsField();
    }

    _getProductsField() {
        const products = new Field('products')
            .addFieldList(this._getProductFields());

        this._getProductArguments().forEach((arg) => products.addArgument(...arg));

        return products;
    }

    _getPriceFilter(key, value) {
        const [from, to] = value[0].split('_');

        if (from === '*') {
            return { [key]: { to } };
        }

        if (to === '*') {
            return { [key]: { from } };
        }

        return {
            [key]: { from, to }
        };
    }

    _getCustomFilters = (filters = {}) => (
        Object.entries(filters).reduce((acc, [key, attribute]) => {
            if (!attribute.length) {
                return acc;
            }

            if (key === 'price') {
                return {
                    ...acc,
                    ...this._getPriceFilter(key, attribute)
                };
            }

            return {
                ...acc,
                [key]: { in: attribute }
            };
        }, {})
    );

    _getFilterArgumentMap() {
        return {
            categoryIds: (id) => ({ category_id: { eq: id } }),
            categoryUrlPath: (url) => ({ category_url_path: { eq: url } }),
            priceRange: ({ min, max }) => {
                const price = {};

                if (min) {
                    price.from = min;
                }

                if (max) {
                    price.to = max;
                }

                return { price };
            },
            productsSkuArray: (sku) => ({ sku: { in: sku } }),
            productSKU: (sku) => ({ sku: { eq: sku } }),
            productUrlPath: (url) => ({ url_key: { eq: url } }),
            customFilters: this._getCustomFilters,
            newToDate: (date) => ({ news_to_date: { gteq: date } }),
            conditions: (conditions) => ({ conditions: { eq: conditions } }),
            customerGroupId: (id) => ({ customer_group_id: { eq: id } })
        };
    }

    _getArgumentsMap() {
        const { requireInfo } = this.options;
        const filterArgumentMap = this._getFilterArgumentMap();

        return {
            currentPage: { type: 'Int!' },
            pageSize: {
                type: 'Int!',
                handler: (option) => (requireInfo ? 1 : option)
            },
            search: {
                type: 'String!',
                handler: (option) => option.replace(/\+/g, ' ')
            },
            sort: {
                type: 'ProductAttributeSortInput!',
                handler: ({ sortKey, sortDirection }) => ({ [sortKey]: sortDirection || 'ASC' })
            },
            filter: {
                type: 'ProductAttributeFilterInput!',
                handler: (initialOptions = {}) => {
                    // add customer group by default to all requests
                    const { group_id } = BrowserDatabase.getItem(CUSTOMER) || {};

                    const options = {
                        ...initialOptions,
                        customerGroupId: group_id || '0'
                    };

                    const {
                        customFilters: { category_id } = {}
                    } = options;

                    /**
                     * Remove category ID from select, if there is a custom filter
                     * of category already selected in filtering options.
                     */
                    if (category_id) {
                        // eslint-disable-next-line fp/no-delete
                        options.categoryIds = undefined;
                    }

                    const parsedOptions = Object.entries(options).reduce(
                        (acc, [key, option]) => {
                            // if there is no value, or if the key is just not present in options object
                            if (!option || !filterArgumentMap[key]) {
                                return acc;
                            }

                            return { ...acc, ...filterArgumentMap[key](option) };
                        },
                        {}
                    );

                    return parsedOptions;
                }
            }
        };
    }

    _getProductArguments() {
        const { args } = this.options;
        const argumentMap = this._getArgumentsMap();

        return Object.entries(args).reduce((acc, [key, arg]) => {
            if (!arg) {
                return acc;
            }
            const { type, handler = (option) => option } = argumentMap[key];

            return [...acc, [key, type, handler(arg)]];
        }, []);
    }

    _getProductFields() {
        const { requireInfo, isSingleProduct, notRequireInfo } = this.options;

        // do not request total count for PDP
        if (isSingleProduct || notRequireInfo) {
            return [
                this._getItemsField()
            ];
        }

        // for filters only request
        if (requireInfo) {
            return [
                this._getSortField(),
                this._getAggregationsField()
            ];
        }

        return [
            'total_count',
            this._getItemsField(),
            this._getPageInfoField()
        ];
    }

    _getProductInterfaceFields(isVariant, isForLinkedProducts = false) {
        const {
            isPlp = false,
            isSingleProduct,
            noAttributes = false,
            noVariants = false,
            noVariantAttributes = false
        } = this.options;

        // Basic fields returned always
        const fields = [
            'id',
            'sku',
            'name',
            'type_id',
            'stock_status'
        ];

        // Additional fields, which we want to return always, except when it's variants on PLP (due to hugh number of items)
        if (!(isPlp && isVariant)) {
            fields.push(
                this._getPriceRangeField(),
                this._getProductImageField(),
                this._getProductThumbnailField(),
                this._getProductSmallField(),
                this._getShortDescriptionField(),
                'special_from_date',
                'special_to_date',
                this._getTierPricesField()
            );
        }

        // if it is normal product and we need attributes
        // or if, it is variant, but we need variant attributes or variants them-self
        if ((!isVariant && !noAttributes) || (isVariant && !noVariantAttributes && !noVariants)) {
            fields.push(this._getAttributesField(isVariant));
        }

        // to all products (non-variants)
        if (!isVariant) {
            fields.push(
                'url',
                this._getUrlRewritesFields(),
                this._getReviewCountField(),
                this._getRatingSummaryField(),
                this._getCustomizableProductFragment()
            );

            // if variants are not needed
            if (!noVariants) {
                fields.push(
                    this._getConfigurableProductFragment(),
                    this._getBundleProductFragment()
                );
            }
        }

        // prevent linked products from looping
        if (isForLinkedProducts) {
            fields.push(this._getProductLinksField());
        }

        // additional information to PDP loads
        if (isSingleProduct) {
            fields.push(
                'stock_status',
                'meta_title',
                'meta_keyword',
                'canonical_url',
                'meta_description',
                this._getDescriptionField(),
                this._getMediaGalleryField(),
                this._getSimpleProductFragment(),
                this._getProductLinksField(),
                this._getCustomizableProductFragment()
            );

            // for variants of PDP requested product
            if (!isVariant) {
                fields.push(
                    this._getCategoriesField(),
                    this._getReviewsField(),
                    this._getVirtualProductFragment(),
                    this._getCustomizableProductFragment()
                );
            }
        }

        return fields;
    }

    /**
     * For grouped products, returns the subfields of the elements of the `items` field
     * @returns {*[]}
     * @private
     */
    _getGroupedProductItemFields() {
        return [
            this._getProductField(),
            'position',
            'qty'
        ];
    }

    /**
     * A GroupedProduct-specific field that queries the products that are grouped under this product
     * @returns {Field}
     * @private
     */
    _getGroupedProductItems() {
        return new Fragment('GroupedProduct').addField(
            new Field('items')
                .addFieldList(this._getGroupedProductItemFields())
        );
    }

    /**
     * A DownloadableProduct-specific field that queries the links and samples
     * @returns {Field}
     * @private
     */
    _getDownloadableProductFields() {
        return new Fragment('DownloadableProduct')
            .addFieldList(this._getDownloadableProductLinks());
    }

    _getDownloadableProductLinks() {
        return [
            'links_title',
            'samples_title',
            'links_purchased_separately',
            this._getDownloadableProductLinkField(),
            this._getDownloadableProductSampleField()
        ];
    }

    _getDownloadableProductLinksRequired() {
        return new Fragment('DownloadableProduct')
            .addFieldList(this._getDownloadableProductLinksRequiredFields());
    }

    _getDownloadableProductLinksRequiredFields() {
        return [
            'links_purchased_separately'
        ];
    }

    _getDownloadableProductLinkField() {
        return new Field('downloadable_product_links')
            .addFieldList(this._getDownloadableProductLinkFields());
    }

    _getDownloadableProductLinkFields() {
        return [
            'sample_url',
            'sort_order',
            'title',
            'id',
            'price'
        ];
    }

    _getDownloadableProductSampleField() {
        return new Field('downloadable_product_samples')
            .addFieldList(this._getDownloadableProductSampleFields());
    }

    _getDownloadableProductSampleFields() {
        return [
            'title',
            'sort_order',
            'sample_url'
        ];
    }

    _getItemsField() {
        const { isSingleProduct } = this.options;

        const items = new Field('items')
            .addFieldList(this._getProductInterfaceFields());

        if (isSingleProduct) {
            items.addField(this._getGroupedProductItems());
            items.addField(this._getDownloadableProductFields());
        } else {
            items.addField(this._getDownloadableProductLinksRequired());
        }

        return items;
    }

    _getProductField() {
        const { isForLinkedProducts } = this.options;

        return new Field('product')
            .addFieldList(this._getProductInterfaceFields(true, isForLinkedProducts));
    }

    _getShortDescriptionFields() {
        return [
            'html'
        ];
    }

    _getShortDescriptionField() {
        return new Field('short_description')
            .addFieldList(this._getShortDescriptionFields());
    }

    _getStockItemField() {
        return new Field('stock_item')
            .addFieldList(this._getStockItemFields());
    }

    _getStockItemFields() {
        return [
            'min_sale_qty',
            'max_sale_qty'
        ];
    }

    _getBreadcrumbFields() {
        return [
            'category_id',
            'category_name',
            'category_level',
            'category_url',
            'category_is_active'
        ];
    }

    _getBreadcrumbsField() {
        return new Field('breadcrumbs')
            .addFieldList(this._getBreadcrumbFields());
    }

    _getCategoryFields() {
        return [
            'id',
            'name',
            'url',
            this._getBreadcrumbsField()
        ];
    }

    _getCategoriesField() {
        return new Field('categories')
            .addFieldList(this._getCategoryFields());
    }

    _getMinimalPriceFields() {
        return [
            this._getDiscountField(),
            this._getFinalPriceField(),
            this._getFinalPriceExclTaxField(),
            this._getRegularPriceField(),
            this._getRegularPriceExclTaxField(),
            this._getDefaultPriceField(),
            this._getDefaultFinalPriceField(),
            this._getDefaultFinalPriceExclTaxField()
        ];
    }

    _getMinimalPriceField() {
        return new Field('minimum_price')
            .addFieldList(this._getMinimalPriceFields());
    }

    _getMaximalPriceField() {
        return new Field('maximum_price')
            .addFieldList(this._getMinimalPriceFields());
    }

    _getPriceRangeFields() {
        // Using an array as potentially would want to add maximum price
        return [
            this._getMinimalPriceField(),
            this._getMaximalPriceField()
        ];
    }

    _getPriceRangeField() {
        return new Field('price_range')
            .addFieldList(this._getPriceRangeFields());
    }

    /**
     * @returns {[string]} an array representing the subfields of the product thumbnail
     * @private
     */
    _getProductThumbnailFields() {
        return [
            'path',
            'url'
            // 'label'
        ];
    }

    _getProductSmallFields() {
        return this._getProductThumbnailFields();
    }

    /**
     * Returns the field for fetching the thumbnail of a product.
     * Not to be confused with the media thumbnail field, which has the same name but is a subfield of media_gallery_entries
     * @returns {Field}
     * @private
     */
    _getProductThumbnailField() {
        return new Field('thumbnail')
            .addFieldList(this._getProductThumbnailFields());
    }

    _getProductSmallField() {
        return new Field('small_image')
            .addFieldList(this._getProductSmallFields());
    }

    _getProductImageField() {
        return new Field('image')
            .addFieldList(this._getProductThumbnailFields());
    }

    _getAttributeOptionField() {
        return [
            'label',
            'value',
            this._getSwatchDataField()
        ];
    }

    _getAttributeOptionsField() {
        return new Field('attribute_options')
            .addFieldList(this._getAttributeOptionField());
    }

    _getAttributeFields(isVariant) {
        return [
            'attribute_id',
            'attribute_value',
            'attribute_code',
            'attribute_type',
            'attribute_label',
            'attribute_group_id',
            'attribute_group_code',
            'attribute_group_name',
            ...(!isVariant
                ? [
                    this._getAttributeOptionsField()
                ]
                : []
            )
        ];
    }

    _getAttributesField(isVariant) {
        return new Field('s_attributes')
            .setAlias('attributes')
            .addFieldList(this._getAttributeFields(isVariant));
    }

    _getMediaGalleryFields() {
        return [
            'id',
            'file',
            'label',
            'position',
            'disabled',
            'media_type',
            'types',
            this._getVideoContentField(),
            this._getMediaThumbnailField(),
            this._getMediaBaseField(),
            this._getMediaLargeField()
        ];
    }

    /**
     * Returns a field querying video-specific data for a media gallery entry.
     * @returns {Field} the video_content field
     * @private
     */
    _getVideoContentField() {
        return new Field('video_content').addFieldList([
            'media_type',
            'video_description',
            'video_metadata',
            'video_provider',
            'video_title',
            'video_url'
        ]);
    }

    /**
     * Returns a field querying the thumbnail of a media gallery entry.
     * Not to be confused with the product thumbnail field, which has the same name but is a direct subfield of the product
     * @returns {Field}
     * @private
     */
    _getMediaThumbnailField() {
        return new Field('thumbnail').addField('url');
    }

    _getMediaBaseField() {
        return new Field('base').addField('url');
    }

    _getMediaLargeField() {
        return new Field('large').addField('url');
    }

    _getMediaGalleryField() {
        return new Field('media_gallery_entries')
            .addFieldList(this._getMediaGalleryFields());
    }

    _getProductLinksField() {
        return new Field('product_links')
            .addFieldList(this._getProductLinkFields());
    }

    _getDescriptionFields() {
        return [
            'html'
        ];
    }

    _getDescriptionField() {
        return new Field('description')
            .addFieldList(this._getDescriptionFields());
    }

    _getUrlRewritesFields() {
        return new Field('url_rewrites')
            .addFieldList(['url']);
    }

    _getProductLinkFields() {
        return [
            'position',
            'link_type',
            'linked_product_sku'
        ];
    }

    _getRatingsBreakdownFields() {
        return [
            new Field('name').setAlias('rating_code'),
            'value'
        ];
    }

    _getRatingsBreakdownField() {
        return new Field('ratings_breakdown')
            .setAlias('rating_votes')
            .addFieldList(this._getRatingsBreakdownFields());
    }

    _getReviewItemsFields() {
        return [
            'average_rating',
            'nickname',
            new Field('summary').setAlias('title'),
            new Field('text').setAlias('detail'),
            'created_at',
            this._getRatingsBreakdownField()
        ];
    }

    _getReviewItemsField() {
        return new Field('items')
            .addFieldList(this._getReviewItemsFields());
    }

    _getReviewsFields() {
        return [
            this._getReviewItemsField()
        ];
    }

    _getReviewsField() {
        return new Field('reviews')
            // Hard-coded pages, it will be very hard to
            // paginate using current implementation
            // eslint-disable-next-line no-magic-numbers
            .addArgument('pageSize', 'Int', 20)
            .addArgument('currentPage', 'Int', 1)
            .addFieldList(this._getReviewsFields());
    }

    _getReviewCountField() {
        return new Field('review_count');
    }

    _getRatingSummaryField() {
        return new Field('rating_summary');
    }

    _getBundleOptionsFields() {
        return [
            'id',
            'label',
            'quantity',
            'position',
            'is_default',
            'price',
            'price_type',
            'can_change_quantity',
            this._getProductField()
        ];
    }

    _getBundleOptionsField() {
        return new Field('options')
            .addFieldList(this._getBundleOptionsFields());
    }

    _getBundleItemsFields() {
        return [
            'option_id',
            'title',
            'required',
            'type',
            'position',
            'sku',
            this._getBundleOptionsField()
        ];
    }

    _getBundleItemsField() {
        return new Field('items')
            .addFieldList(this._getBundleItemsFields());
    }

    _getBundlePriceOptionSelectionFields() {
        return [
            'selection_id',
            'final_option_price',
            'final_option_price_excl_tax',
            'regular_option_price',
            'regular_option_price_excl_tax'
        ];
    }

    _getBundlePriceOptionFields() {
        return [
            'option_id',
            new Field('selection_details')
                .addFieldList(this._getBundlePriceOptionSelectionFields())
        ];
    }

    _getBundlePriceOptionsField() {
        return new Field('bundle_options')
            .addFieldList(this._getBundlePriceOptionFields());
    }

    _getBundleProductFragmentFields() {
        return [
            'price_view',
            'dynamic_price',
            'dynamic_sku',
            'ship_bundle_items',
            'dynamic_weight',
            this._getBundleItemsField(),
            this._getBundlePriceOptionsField()
        ];
    }

    _getValueFields() {
        return [
            'value_index'
        ];
    }

    _getValuesField() {
        return new Field('values')
            .addFieldList(this._getValueFields());
    }

    _getConfigurableOptionFields() {
        return [
            'attribute_code',
            this._getValuesField()
        ];
    }

    _getConfigurableOptionsField() {
        return new Field('configurable_options')
            .addFieldList(this._getConfigurableOptionFields());
    }

    _getVariantFields() {
        return [
            this._getProductField()
        ];
    }

    _getVariantsField() {
        const { isPlp = false } = this.options;

        // For PLP page we have optimized variants graphql field
        const variantsField = isPlp ? 'variants_plp' : 'variants';

        return new Field(variantsField)
            .setAlias('variants')
            .addFieldList(this._getVariantFields());
    }

    _getConfigurableProductFragmentFields() {
        return [
            this._getConfigurableOptionsField(),
            this._getVariantsField()
        ];
    }

    _getCustomizableTextValueFields() {
        return [
            'price',
            'priceInclTax',
            'priceExclTax',
            'price_type',
            'currency',
            'sku',
            'max_characters'
        ];
    }

    _getCustomizableTextValueField(alias) {
        return new Field('value')
            .addFieldList(this._getCustomizableTextValueFields())
            .setAlias(alias);
    }

    _getCustomizableTextFields(alias) {
        return [
            this._getCustomizableTextValueField(alias),
            'product_sku'
        ];
    }

    _getCustomizableFileValueField(alias) {
        return new Field('value')
            .addFieldList([
                'price',
                'priceInclTax',
                'priceExclTax',
                'price_type',
                'currency',
                'sku',
                'file_extension'
            ])
            .setAlias(alias);
    }

    _getCustomizableAreaOption() {
        return new Fragment('CustomizableAreaOption')
            .addFieldList(this._getCustomizableTextFields('areaValues'));
    }

    _getCustomizableFieldOption() {
        return new Fragment('CustomizableFieldOption')
            .addFieldList(this._getCustomizableTextFields('fieldValues'));
    }

    _getCustomizableFileOption() {
        return new Fragment('CustomizableFileOption')
            .addFieldList([this._getCustomizableFileValueField('fileValues')]);
    }

    _getCustomizableSelectionValueFields() {
        return [
            'option_type_id',
            'price',
            'priceInclTax',
            'priceExclTax',
            'price_type',
            'currency',
            'sku',
            'title',
            'sort_order'
        ];
    }

    _getCustomizableSelectionValueField(alias) {
        return new Field('value')
            .addFieldList(this._getCustomizableSelectionValueFields())
            .setAlias(alias);
    }

    _getCustomizableCheckboxOption() {
        return new Fragment('CustomizableCheckboxOption')
            .addFieldList([this._getCustomizableSelectionValueField('checkboxValues')]);
    }

    _getCustomizableMultiOption() {
        return new Fragment('CustomizableMultipleOption')
            .addFieldList([this._getCustomizableSelectionValueField('checkboxValues')]); // same as checkbox
    }

    _getCustomizableDropdownOption() {
        return new Fragment('CustomizableDropDownOption')
            .addFieldList([this._getCustomizableSelectionValueField('dropdownValues')]);
    }

    _getCustomizableRadioOption() {
        return new Fragment('CustomizableRadioOption')
            .addFieldList([this._getCustomizableSelectionValueField('dropdownValues')]); // same as dropdown
    }

    _getCustomizableProductFragmentOptionsFields() {
        return [
            this._getCustomizableDropdownOption(),
            this._getCustomizableRadioOption(),
            this._getCustomizableCheckboxOption(),
            this._getCustomizableMultiOption(),
            this._getCustomizableFieldOption(),
            this._getCustomizableAreaOption(),
            this._getCustomizableFileOption(),
            'title',
            'required',
            'sort_order',
            'option_id'
        ];
    }

    _getCustomizableProductFragmentOptionsField() {
        return new Field('options')
            .addFieldList(this._getCustomizableProductFragmentOptionsFields());
    }

    _getCustomizableProductFragment() {
        return new Fragment('CustomizableProductInterface')
            .addFieldList([this._getCustomizableProductFragmentOptionsField()]);
    }

    _getSimpleProductFragmentFields() {
        return [
            this._getTierPricesField()
        ];
    }

    _getVirtualProductFragmentFields() {
        return [
            this._getTierPricesField()
        ];
    }

    _getTierPricesField() {
        return new Field('price_tiers')
            .addFieldList(this._getTierPricesFields());
    }

    _getTierPricesFields() {
        return [
            this._getDiscountField(),
            this._getFinalPriceField(),
            'quantity'
        ];
    }

    _getDiscountField() {
        return new Field('discount')
            .addField('amount_off')
            .addField('percent_off');
    }

    _getFinalPriceField() {
        return new Field('final_price')
            .addField('currency')
            .addField('value');
    }

    _getFinalPriceExclTaxField() {
        return new Field('final_price_excl_tax')
            .addField('currency')
            .addField('value');
    }

    _getRegularPriceField() {
        return new Field('regular_price')
            .addField('currency')
            .addField('value');
    }

    _getRegularPriceExclTaxField() {
        return new Field('regular_price_excl_tax')
            .addField('currency')
            .addField('value');
    }

    _getDefaultFinalPriceExclTaxField() {
        return new Field('default_final_price_excl_tax')
            .addField('currency')
            .addField('value');
    }

    _getDefaultPriceField() {
        return new Field('default_price')
            .addField('currency')
            .addField('value');
    }

    _getDefaultFinalPriceField() {
        return new Field('default_final_price')
            .addField('currency')
            .addField('value');
    }

    _getBundleProductFragment() {
        return new Fragment('BundleProduct')
            .addFieldList(this._getBundleProductFragmentFields());
    }

    _getConfigurableProductFragment() {
        return new Fragment('ConfigurableProduct')
            .addFieldList(this._getConfigurableProductFragmentFields());
    }

    _getSimpleProductFragment() {
        return new Fragment('SimpleProduct')
            .addFieldList(this._getSimpleProductFragmentFields());
    }

    _getVirtualProductFragment() {
        return new Fragment('VirtualProduct')
            .addFieldList(this._getVirtualProductFragmentFields());
    }

    _getSortOptionFields() {
        return [
            'value',
            'label'
        ];
    }

    _getSortOptionsField() {
        return new Field('options')
            .addFieldList(this._getSortOptionFields());
    }

    _getSortFields() {
        return [
            this._getSortOptionsField()
        ];
    }

    _getSortField() {
        return new Field('sort_fields')
            .addFieldList(this._getSortFields());
    }

    _getSwatchDataFields() {
        return [
            'type',
            'value'
        ];
    }

    _getSwatchDataField() {
        return new Field('swatch_data')
            .addFieldList(this._getSwatchDataFields());
    }

    _getAggregationsField() {
        return new Field('aggregations')
            .setAlias('filters')
            .addFieldList(this._getAggregationsFields());
    }

    _getAggregationsFields() {
        return [
            new Field('label').setAlias('name'),
            new Field('attribute_code').setAlias('request_var'),
            new Field('is_boolean'),
            'position',
            this._getAggregationsOptionsField()
        ];
    }

    _getAggregationsOptionsField() {
        return new Field('options')
            .setAlias('filter_items')
            .addFieldList(this._getAggregationsOptionsFields());
    }

    _getAggregationsOptionsFields() {
        return [
            'label',
            'count',
            new Field('value').setAlias('value_string'),
            this._getSwatchDataField()
        ];
    }

    _getPageInfoField() {
        return new Field('page_info')
            .addField('current_page')
            .addField('total_pages');
    }
}

export default new ProductListQuery();
