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

import { withRouter } from 'react-router-dom';

import ContentWrapper from 'Component/ContentWrapper';
import Loader from 'Component/Loader';
import {
    MyAccountOverlay
} from 'Component/MyAccountOverlay/MyAccountOverlay.component';

import './CreateAccount.style';

/** @namespace Route/CreateAccount/Component/CreateAccountComponent */
export class CreateAccountComponent extends MyAccountOverlay {
    renderSignInWrapper() {
        const { onLoginClick } = this.props;

        return (
            <div block="CreateAccount" elem="SignInWrapper">
                <h3>{ __('Registered Customers') }</h3>
                <p>{ __('If you have an account, sign in with your email address.') }</p>
                <button block="Button" onClick={ onLoginClick }>{ __('Sign In Here') }</button>
            </div>
        );
    }

    renderCreateAccountWrapper() {
        return (
            <div block="CreateAccount" elem="CreateAccountWrapper">
                <h3>{ __('New Customers') }</h3>
                <p>
                    { __('Creating an account has many benefits:') }
                    { __(' check out faster, keep more than one address, track orders and more.') }
                </p>
                { this.renderCreateAccount() }
            </div>
        );
    }

    renderForgotPasswordWrapper() {
        return (
            <div block="CreateAccount" elem="ForgetPasswordWrapper">
                <h3>{ __('Forgot Your Password?') }</h3>
                <p>
                    { __('Please enter your email address below to receive a password reset link.') }
                </p>
                { this.renderForgotPassword() }
            </div>
        );
    }

    renderContent() {
        const { device } = this.props;

        if (device.isMobile) {
            return this.renderCreateAccount();
        }

        return (
            <>
                { this.renderCreateAccountWrapper() }
                { this.renderSignInWrapper() }
            </>
        );
    }

    render() {
        const {
            isLoading
        } = this.props;

        return (
            <ContentWrapper
              label="Create account page"
              mix={ {
                  block: 'CreateAccount'
              } }
            >
                <div block="CreateAccount" elem="InnerWrapper">
                    <Loader isLoading={ isLoading } />
                    { this.renderContent() }
                </div>
            </ContentWrapper>
        );
    }
}
export default withRouter(
    CreateAccountComponent
);
