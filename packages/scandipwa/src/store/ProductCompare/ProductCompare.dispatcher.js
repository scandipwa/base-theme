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

import ProductCompareQuery from 'Query/ProductCompare.query';
import { showNotification } from 'Store/Notification/Notification.action';
import {
    clearComparedProducts,
    setCompareList,
    setCompareListIds,
    toggleLoader
} from 'Store/ProductCompare/ProductCompare.action';
import { getUid, removeUid, setUid } from 'Util/Compare';
import { fetchMutation, fetchQuery } from 'Util/Request';

export const CartDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Cart/Cart.dispatcher'
);

/** @namespace Store/ProductCompare/Dispatcher */
export class ProductCompareDispatcher {
    async getCompareList(dispatch) {
        const uid = getUid();

        if (!uid) {
            return false;
        }

        dispatch(toggleLoader(true));

        try {
            const { compareList } = await fetchQuery(
                ProductCompareQuery.getCompareList(uid)
            );

            dispatch(toggleLoader(false));
            dispatch(setCompareList(compareList));
        } catch (error) {
            dispatch(toggleLoader(false));
            dispatch(showNotification('error', __('Unable to fetch compare list'), error));

            return false;
        }

        return true;
    }

    async createCompareList(productId) {
        const {
            createCompareList,
            createCompareList: {
                uid
            }
        } = await fetchMutation(
            ProductCompareQuery.getCreateCompareList(
                [productId]
            )
        );

        if (uid) {
            setUid(uid);
        }

        return createCompareList;
    }

    async addToCompareList(uid, productId) {
        const {
            addProductsToCompareList
        } = await fetchMutation(
            ProductCompareQuery.getAddProductsToCompareList(
                uid,
                [productId]
            )
        );

        return addProductsToCompareList;
    }

    async addProductToCompare(productId, dispatch) {
        const uid = getUid();

        try {
            const result = (uid)
                ? await this.addToCompareList(uid, productId)
                : await this.createCompareList(productId);

            dispatch(setCompareList(result));
            dispatch(showNotification('success', __('Product is added to the compare list')));

            return result;
        } catch (error) {
            dispatch(showNotification('error', __('Unable to add product to the compare list'), error));

            return false;
        }
    }

    async removeComparedProduct(productId, dispatch) {
        const uid = getUid();

        if (!uid) {
            return false;
        }

        try {
            const {
                removeProductsFromCompareList
            } = await fetchMutation(
                ProductCompareQuery.getRemoveProductsFromCompareList(
                    uid,
                    [productId]
                )
            );

            dispatch(setCompareList(removeProductsFromCompareList));
            dispatch(showNotification('success', __('Product is removed from the compare list')));

            return removeProductsFromCompareList;
        } catch (error) {
            dispatch(showNotification('error', __('Unable to remove product from the compare list'), error));

            return false;
        }
    }

    async fetchCustomersList(dispatch) {
        const {
            createCompareList,
            createCompareList: {
                uid
            }
        } = await fetchMutation(
            ProductCompareQuery.getCreateEmptyCompareList()
        );

        if (uid) {
            setUid(uid);
        }

        dispatch(setCompareList(createCompareList));
    }

    async assignCompareList(dispatch) {
        const uid = getUid();

        if (!uid) {
            await this.fetchCustomersList(dispatch);

            return false;
        }

        removeUid();

        try {
            const {
                assignCompareListToCustomer: {
                    result,
                    compare_list,
                    compare_list: {
                        uid: newUid
                    }
                }
            } = await fetchMutation(
                ProductCompareQuery.getAssignCompareList(uid)
            );

            if (result) {
                setUid(newUid);
                dispatch(setCompareList(compare_list));
            }

            return result;
        } catch (error) {
            dispatch(toggleLoader(false));

            return false;
        }
    }

    async clearComparedProducts(dispatch) {
        const uid = getUid();

        if (!uid) {
            return false;
        }

        dispatch(toggleLoader(true));

        try {
            const result = await fetchMutation(
                ProductCompareQuery.getDeleteCompareList(uid)
            );

            removeUid();
            dispatch(clearComparedProducts());
            dispatch(showNotification('success', __('Compare list is cleared')));
            dispatch(toggleLoader(false));

            return result;
        } catch (error) {
            dispatch(toggleLoader(false));
            dispatch(showNotification('error', __('Unable to clear product compare list'), error));

            return false;
        }
    }

    async updateInitialProductCompareData(dispatch) {
        const uid = getUid();

        if (!uid) {
            return false;
        }

        dispatch(toggleLoader(true));

        try {
            const { compareList } = await fetchQuery(
                ProductCompareQuery.getCompareListIds(uid)
            );
            const { items = [] } = compareList || {};
            const compareIds = items.map(({ product: { id } }) => id);

            dispatch(toggleLoader(false));
            dispatch(setCompareListIds(compareIds));
        } catch (error) {
            dispatch(toggleLoader(false));
            dispatch(showNotification('error', __('Unable to fetch compare list'), error));

            return false;
        }

        return true;
    }

    resetComparedProducts(dispatch) {
        dispatch(clearComparedProducts());
    }
}

export default new ProductCompareDispatcher();
