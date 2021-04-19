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

import { Field, prepareMutation } from 'Util/Query';
import { executePost } from 'Util/Request/Request';

/** @namespace Util/Request/Mutation/fetchMutation */
// eslint-disable-next-line import/prefer-default-export
export const fetchMutation = (rawMutations) => {
    const queries = rawMutations instanceof Field ? [rawMutations] : rawMutations;
    return executePost(prepareMutation(queries, true));
};
