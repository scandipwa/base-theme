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

import { Field } from 'Util/Query';

/** @namespace StoreinPickup/Query/StoreInPickUp/Query/StoreInPickUpQuery */
export class StoreInPickUpQuery {
    getStores(country, search = '') {
        return new Field('getStores')
            .addFieldList([this.getStoreFields()])
            .addArgument('search', 'String', search)
            .addArgument('country', 'String', country);
    }

    getStoreFields() {
        return new Field('stores')
            .addFieldList([
                'city',
                'country',
                'description',
                'name',
                'phone',
                'pickup_location_code',
                'postcode',
                'region',
                'street'
            ]);
    }
}

export default new StoreInPickUpQuery();
