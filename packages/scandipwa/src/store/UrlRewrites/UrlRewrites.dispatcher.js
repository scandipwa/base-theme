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

import UrlRewritesQuery from 'Query/UrlRewrites.query';
import { showNotification } from 'Store/Notification/Notification.action';
import { setIsUrlRewritesLoading, updateUrlRewrite } from 'Store/UrlRewrites/UrlRewrites.action';
import { QueryDispatcher } from 'Util/Request';

/**
 * Url Rewrite Dispathcer
 * @class UrlRewritesDispatcher
 * @extends RequestDispatcher
 * @namespace Store/UrlRewrites/Dispatcher
 */
export class UrlRewritesDispatcher extends QueryDispatcher {
    __construct() {
        super.__construct('UrlRewrites');
    }

    onSuccess({ urlResolver }, dispatch, { urlParam }) {
        dispatch(updateUrlRewrite(urlResolver || { notFound: true }, urlParam));
    }

    onError(error, dispatch, { urlParam }) {
        dispatch(setIsUrlRewritesLoading(false));
        dispatch(updateUrlRewrite({ notFound: true }, urlParam));
        dispatch(showNotification('error', __('Error fetching URL-rewrites!'), error));
    }

    /**
     * Prepare UrlRewrite requests
     * @param {Object} options A object containing different aspects of query, each item can be omitted
     * @return {Query} UrlRewrite query
     * @memberof UrlRewritesDispatcher
     */
    prepareRequest(options, dispatch) {
        dispatch(setIsUrlRewritesLoading(true));

        return [
            UrlRewritesQuery.getQuery(this.processUrlOptions(options))
        ];
    }

    processUrlOptions(options) {
        const { urlParam } = options;

        // FAILSAFE: Trim index.php if someone forgot to set "Use Web Server Rewrites" to "Yes"
        const trimmedParam = urlParam.replace('index.php/', '');

        return {
            ...options,
            urlParam: trimmedParam.replace(new RegExp(window.storeRegexText), '')
        };
    }
}

export default new UrlRewritesDispatcher();
