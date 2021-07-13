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

import PropTypes from 'prop-types';

import FieldForm from 'Component/FieldForm/FieldForm.component';
import Form from 'Component/Form';

import './NewsletterSubscription.style';

/**
 * Newsletter Subscription form
 * @class NewsletterSubscription
 * @namespace Component/NewsletterSubscription/Component
 */
export class NewsletterSubscription extends FieldForm {
    static propTypes = {
        onFormSubmit: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired
    };

    get fieldMap() {
        const fields = {
            newsletterEmail: {
                validation: ['notEmpty', 'email'],
                placeholder: __('Enter your email address'),
                'aria-label': __('Email address')
            }
        };

        return fields;
    }

    renderActions() {
        return (
            <button
              type="submit"
              block="Button"
              mods={ { isHollow: true } }
              aria-label={ __('Submit') }
            >
                { __('Subscribe') }
            </button>
        );
    }

    render() {
        const { isLoading, onFormSubmit } = this.props;

        return (
            <div block="NewsletterSubscription">
                <Form
                  onSubmitSuccess={ onFormSubmit }
                  mix={ { block: 'FieldForm' } }
                >
                    <div block="FieldForm" elem="Fieldset" mods={ { isLoading } }>
                        { this.renderFields() }
                        { this.renderActions() }
                    </div>
                </Form>
            </div>
        );
    }
}

export default NewsletterSubscription;
