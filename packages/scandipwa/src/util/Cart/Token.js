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

import BrowserDatabase from 'Util/BrowserDatabase';

export const GUEST_QUOTE_ID = 'guest_quote_id';

/** @namespace Util/Cart/Token/setGuestQuoteId */
export const setGuestQuoteId = (token) => {
    BrowserDatabase.setItem(token, GUEST_QUOTE_ID);
};

/** @namespace Util/Cart/Token/getGuestQuoteId */
export const getGuestQuoteId = () => BrowserDatabase.getItem(GUEST_QUOTE_ID);

/** @namespace Util/Cart/Token/deleteGuestQuoteId */
export const deleteGuestQuoteId = () => BrowserDatabase.deleteItem(GUEST_QUOTE_ID);
