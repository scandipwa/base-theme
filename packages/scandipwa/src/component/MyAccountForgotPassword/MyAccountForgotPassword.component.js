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
import { PureComponent } from 'react';

import Field from 'Component/Field';
import Form from 'Component/Form';
import { signInStateType } from 'Type/Account';

/** @namespace Component/MyAccountForgotPassword/Component */
export class MyAccountForgotPassword extends PureComponent {
    static propTypes = {
        state: signInStateType.isRequired,
        onForgotPasswordSuccess: PropTypes.func.isRequired,
        onForgotPasswordAttempt: PropTypes.func.isRequired,
        onFormError: PropTypes.func.isRequired,
        handleSignIn: PropTypes.func.isRequired,
        handleCreateAccount: PropTypes.func.isRequired,
        isCheckout: PropTypes.bool.isRequired
    };

    renderForgotPasswordForm() {
        const { onForgotPasswordAttempt, onForgotPasswordSuccess, onFormError } = this.props;

        return (
            <Form
              key="forgot-password"
              onSubmit={ onForgotPasswordAttempt }
              onSubmitSuccess={ onForgotPasswordSuccess }
              onSubmitError={ onFormError }
            >
                <Field
                  type="text"
                  id="email"
                  name="email"
                  placeholder={ __('Your email address') }
                  label={ __('Email') }
                  autocomplete="email"
                  validation={ ['notEmpty', 'email'] }
                />
                <div block="MyAccountOverlay" elem="Buttons">
                    <button
                      block="Button"
                      type="submit"
                      mix={ { block: 'MyAccountOverlay', elem: 'ResetPassword' } }
                    >
                        { __('Send reset link') }
                    </button>
                </div>
            </Form>
        );
    }

    renderCreateAccountLabel() {
        const { isCheckout, handleCreateAccount } = this.props;

        if (isCheckout) {
            return null;
        }

        return (
            <section aria-labelledby="create-account-label">
                <h4 id="create-account-label">{ __("Don't have an account?") }</h4>
                <button
                  block="Button"
                  mods={ { likeLink: true } }
                  onClick={ handleCreateAccount }
                >
                    { __('Create an account') }
                </button>
            </section>
        );
    }

    renderAdditionalField() {
        const { state, handleSignIn } = this.props;

        return (
            <article block="MyAccountOverlay" elem="Additional" mods={ { state } }>
                <section aria-labelledby="forgot-password-labe">
                    <h4 id="forgot-password-label">{ __('Already have an account?') }</h4>
                    <button
                      block="Button"
                      mods={ { likeLink: true } }
                      onClick={ handleSignIn }
                    >
                        { __('Sign in') }
                    </button>
                </section>
                { this.renderCreateAccountLabel() }
            </article>
        );
    }

    render() {
        return (
            <>
                { this.renderForgotPasswordForm() }
                { this.renderAdditionalField() }
            </>
        );
    }
}

export default MyAccountForgotPassword;
