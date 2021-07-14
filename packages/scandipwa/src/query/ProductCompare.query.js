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

import { ProductListQuery } from 'Query/ProductList.query';
import { Field } from 'Util/Query';

/** @namespace Query/ProductCompare */
export class ProductCompareQuery extends ProductListQuery {
    getCreateEmptyCompareList() {
        return new Field('createCompareList')
            .addArgument('input', 'CreateCompareListInput', {})
            .addFieldList(this._getCompareListFields());
    }

    getCreateCompareList(products) {
        return new Field('createCompareList')
            .addArgument('input', 'CreateCompareListInput', { products })
            .addFieldList(this._getCompareListFields());
    }

    getDeleteCompareList(uid) {
        return new Field('deleteCompareList')
            .addArgument('uid', 'ID!', uid)
            .addField('result');
    }

    getAddProductsToCompareList(uid, products) {
        return new Field('addProductsToCompareList')
            .addArgument('input', 'AddProductsToCompareListInput', { uid, products })
            .addFieldList(this._getCompareListFields());
    }

    getRemoveProductsFromCompareList(uid, products) {
        return new Field('removeProductsFromCompareList')
            .addArgument('input', 'RemoveProductsFromCompareListInput', { uid, products })
            .addFieldList(this._getCompareListFields());
    }

    getAssignCompareList(uid) {
        return new Field('assignCompareListToCustomer')
            .addArgument('uid', 'ID!', uid)
            .addFieldList(this._getAssignFields());
    }

    _getAssignFields() {
        return [
            'result',
            this._getAssignCompareListField()
        ];
    }

    _getAssignCompareListField() {
        return new Field('compare_list')
            .addFieldList(this._getCompareListFields());
    }

    getCompareList(uid) {
        return new Field('compareList')
            .addArgument('uid', 'ID!', uid)
            .addFieldList(this._getCompareListFields());
    }

    getCompareListIds(uid) {
        return new Field('compareList')
            .addArgument('uid', 'ID!', uid)
            .addField(this._getComparableItemIdsField());
    }

    _getCompareListFields() {
        return [
            'uid',
            'item_count',
            // 'review_count',
            // 'rating_summary',
            this._getCompareAttributeField(),
            this._getComparableItemField()
        ];
    }

    _getCompareAttributeField() {
        return new Field('attributes')
            .addFieldList(this._getCompareAttributeFields());
    }

    _getCompareAttributeFields() {
        return [
            'label',
            'code'
        ];
    }

    _getComparableItemAttributeField() {
        return new Field('attributes')
            .addFieldList(this._getComparableItemAttributeFields());
    }

    _getComparableItemAttributeFields() {
        return [
            'value',
            'code'
        ];
    }

    _getComparableItemFields() {
        return [
            this._getProductField(),
            this._getComparableItemAttributeField()
        ];
    }

    _getComparableItemIdsFields() {
        return [
            this._getProductIdsField()
        ];
    }

    _getProductField() {
        return new Field('product')
            .addFieldList(this._getProductInterfaceFields(true, false))
            .addFieldList(['url'])
            .addField(this._getReviewCountField())
            .addField(this._getRatingSummaryField());
    }

    _getProductIdsField() {
        return new Field('product')
            .addFieldList(this._getProductIdsFields());
    }

    _getComparableItemField() {
        return new Field('items')
            .addFieldList(this._getComparableItemFields());
    }

    _getComparableItemIdsField() {
        return new Field('items')
            .addFieldList(this._getComparableItemIdsFields());
    }

    _getProductIdsFields() {
        return [
            'id'
        ];
    }
}

export default new ProductCompareQuery();
