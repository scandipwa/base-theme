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

import CheckEmailQuery from 'Query/CheckEmail.query';
import { QueryDispatcher } from 'Util/Request';

import { updateEmailAvailable } from './Checkout.action';

/**
 * Checkout Dispatcher
 * @class CheckoutDispatcher
 * @extends QueryDispatcher
 * @namespace Store/Checkout/Dispatcher/CheckoutDispatcher
 */
export class CheckoutDispatcher extends QueryDispatcher {
    __construct() {
        super.__construct('Checkout');
    }

    onSuccess(data, dispatch) {
        const { isEmailAvailable: { is_email_available } } = data;
        dispatch(updateEmailAvailable(is_email_available));
    }

    onError(error, dispatch) {
        dispatch(updateEmailAvailable(true));
        return error;
    }

    prepareRequest(email) {
        return CheckEmailQuery.getIsEmailAvailableQuery(email);
    }
}

export default new CheckoutDispatcher();
