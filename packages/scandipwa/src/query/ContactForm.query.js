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

/** @namespace Query/ContactForm */
export class ContactFormQuery {
    getSendContactFormMutation(options) {
        const mutation = new Field('contactForm');
        this._addSendContactFormMutationArguments(mutation, options);
        mutation.addFieldList(this._getSendContactFormMutationResponse());

        return mutation;
    }

    getContactPageConfigQuery() {
        return new Field('contactPageConfig')
            .addFieldList(this._getContactPageConfigFields());
    }

    _addSendContactFormMutationArguments(mutation, options) {
        return mutation.addArgument('contact', 'ContactForm!', options);
    }

    _getSendContactFormMutationResponse() {
        return ['message'];
    }

    _getContactPageConfigFields() {
        return ['enabled'];
    }
}

export default new ContactFormQuery();
