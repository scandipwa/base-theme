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

import { Field } from 'Util/Query';

/** @namespace Query/Config */
export class ConfigQuery {
    getStoreListField() {
        return new Field('storeList')
            .addFieldList(this._getStoreListFields());
    }

    getCheckoutAgreements() {
        return new Field('checkoutAgreements')
            .addFieldList(this._getCheckoutAgreementFields());
    }

    getCurrencyField() {
        return new Field('available_currencies_data')
            .addFieldList([
                'id',
                'label',
                'value'
            ]);
    }

    getCurrencyData() {
        return new Field('currencyData')
            .addFieldList([
                this.getCurrencyField(),
                'current_currency_code'
            ]);
    }

    getPriceDisplayTypeField() {
        return new Field('priceTaxDisplay')
            .addFieldList([
                'product_price_display_type',
                'shipping_price_display_type'
            ]);
    }

    getSaveSelectedCurrencyMutation(newCurrency) {
        return new Field('saveSelectedCurrency')
            .addArgument('currency', 'String', newCurrency)
            .addFieldList([
                this.getCurrencyData()
            ]);
    }

    _getCheckoutAgreementFields() {
        return [
            'agreement_id',
            'checkbox_text',
            'content',
            'content_height',
            'is_html',
            'mode',
            'name'
        ];
    }

    _getStoreListFields() {
        return [
            'name',
            'is_active',
            'base_url',
            'base_link_url',
            'code'
        ];
    }

    getQuery() {
        return new Field('storeConfig')
            .addFieldList(this._getStoreConfigFields());
    }

    _getStoreConfigFields() {
        return [
            'code',
            'is_active',
            'cms_home_page',
            'cms_no_route',
            'copyright',
            'timezone',
            'header_logo_src',
            'timezone',
            'title_prefix',
            'title_suffix',
            'default_display_currency_code',
            'default_keywords',
            'default_title',
            'default_description',
            'default_country',
            'downloadable_links_target_new_window',
            'secure_base_media_url',
            // 'paypal_sandbox_flag',
            // 'paypal_client_id',
            'logo_alt',
            'logo_height',
            'logo_width',
            'cookie_text',
            'cookie_link',
            'terms_are_enabled',
            'address_lines_quantity',
            'base_url',
            'pagination_frame',
            'pagination_frame_skip',
            'anchor_text_for_previous',
            'anchor_text_for_next',
            'reviews_are_enabled',
            'reviews_allow_guest',
            'wishlist_general_active',
            'demo_notice',
            'guest_checkout',
            'is_email_confirmation_required',
            'display_product_stock_status',
            'base_link_url',
            'show_vat_number_on_storefront',
            'show_tax_vat_number',
            'product_use_categories',
            'category_url_suffix',
            'cookie_lifetime',
            'plp_list_mode',
            'layered_navigation_product_count_enabled',
            'region_display_all',
            'redirect_dashboard',
            'product_alert_allow_price',
            'product_alert_allow_stock',
            'newsletter_general_active',
            'newsletter_subscription_allow_guest_subscribe',
            'newsletter_subscription_confirm',
            this.getPriceDisplayTypeField()
        ];
    }
}

export default new ConfigQuery();
