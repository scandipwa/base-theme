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
import {
    SET_AGREEMENTS_STATUS,
    UPDATE_EMAIL,
    UPDATE_EMAIL_AVAILABLE,
    UPDATE_SHIPPING_FIELDS
} from './Checkout.action';

/** @namespace Store/Checkout/Reducer/getInitialState */
export const getInitialState = () => ({
    shippingFields: {},
    email: '',
    isEmailAvailable: true,
    isAllRequiredAgreementsSelected: false
});

/** @namespace Store/Checkout/Reducer/checkoutReducer */
export const CheckoutReducer = (state = getInitialState(), action) => {
    switch (action.type) {
    case UPDATE_SHIPPING_FIELDS:
        const { shippingFields } = action;

        return {
            ...state,
            shippingFields
        };

    case UPDATE_EMAIL:
        const { email } = action;
        return {
            ...state,
            email
        };

    case UPDATE_EMAIL_AVAILABLE:
        const { isEmailAvailable } = action;
        return {
            ...state,
            isEmailAvailable
        };

    case SET_AGREEMENTS_STATUS:
        return {
            ...state,
            isAllRequiredAgreementsSelected: action.isAllRequiredAgreementsSelected
        };

    default:
        return state;
    }
};

export default CheckoutReducer;
