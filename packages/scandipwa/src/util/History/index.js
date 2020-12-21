// eslint-disable-next-line import/no-extraneous-dependencies

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
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory({ basename: '/' });
export default history;
