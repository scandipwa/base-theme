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

/** @namespace Util/FormPortalCollector */
export class FormPortalCollector {
    portalsObservers = {};

    subscribe(id, f, name) {
        if (this.portalsObservers[id]) {
            this.portalsObservers[id][name] = f;

            return;
        }

        this.portalsObservers[id] = { [name]: f };
    }

    unsubscribe(id, name) {
        if (!this.portalsObservers[id]) {
            return;
        }
        // eslint-disable-next-line fp/no-delete
        delete this.portalsObservers[id][name];
    }

    collect(id) {
        const portals = this.portalsObservers[id] || {};

        return Object.values(portals).map((portal) => portal());
    }
}

export default FormPortalCollector;
