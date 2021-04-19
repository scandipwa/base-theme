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

/* eslint-disable prefer-promise-reject-errors */
// Disabled due promise being reject with custom error (isCanceled)

/**
 * Promise wrapper to make it cancelable
 * @static
 * @param  {Promise} promise promise which has to be cancelable
 * @return {Promise} Cancelable promise
 * @namespace Util/Promise/MakeCancelable/makeCancelable
 */
export const makeCancelable = (promise) => {
    // eslint-disable-next-line fp/no-let
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            /** @namespace Util/Promise/MakeCancelable/promiseThen */
            (val) => (!hasCanceled_ && resolve(val)),
            /** @namespace Util/Promise/MakeCancelable/promiseError */
            (error) => (!hasCanceled_ && reject(error))
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        }
    };
};

export default makeCancelable;
