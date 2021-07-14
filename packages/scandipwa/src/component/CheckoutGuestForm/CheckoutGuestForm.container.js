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
import { connect } from 'react-redux';

import {
    AUTOFILL_CHECK_TIMER,
    GUEST_EMAIL_FIELD_ID
} from 'Component/CheckoutGuestForm/CheckoutGuestForm.config';
import {
    STATE_CREATE_ACCOUNT,
    STATE_FORGOT_PASSWORD,
    STATE_SIGN_IN
} from 'Component/MyAccountOverlay/MyAccountOverlay.config';
import { SHIPPING_STEP } from 'Route/Checkout/Checkout.config';
import { showNotification } from 'Store/Notification/Notification.action';
import { isSignedIn } from 'Util/Auth';
import { getErrorMessage } from 'Util/Request';

import CheckoutGuestForm from './CheckoutGuestForm.component';

export const MyAccountDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/MyAccount/MyAccount.dispatcher'
);

/** @namespace Component/CheckoutGuestForm/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isEmailConfirmationRequired: state.ConfigReducer.is_email_confirmation_required,
    emailValue: state.CheckoutReducer.email,
    isEmailAvailable: state.CheckoutReducer.isEmailAvailable
});

/** @namespace Component/CheckoutGuestForm/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    signIn: (options) => MyAccountDispatcher.then(
        ({ default: dispatcher }) => dispatcher.signIn(options, dispatch)
    ),
    showNotification: (type, message) => dispatch(showNotification(type, message)),
    showErrorNotification: (error) => dispatch(showNotification('error', getErrorMessage(error)))
});

/** @namespace Component/CheckoutGuestForm/Container */
export class CheckoutGuestFormContainer extends PureComponent {
    static propTypes = {
        isCreateUser: PropTypes.bool.isRequired,
        isGuestEmailSaved: PropTypes.bool,
        showErrorNotification: PropTypes.func.isRequired,
        onEmailChange: PropTypes.func.isRequired,
        onCreateUserChange: PropTypes.func.isRequired,
        onPasswordChange: PropTypes.func.isRequired,
        emailValue: PropTypes.string,
        onSignIn: PropTypes.func,
        isEmailAvailable: PropTypes.bool.isRequired,
        showNotification: PropTypes.func.isRequired,
        signIn: PropTypes.func.isRequired
    };

    static defaultProps = {
        emailValue: '',
        isGuestEmailSaved: false,
        onSignIn: () => {}
    };

    state = {
        isLoading: false,
        signInState: ''
    };

    containerFunctions = {
        handleEmailInput: this.handleEmailInput.bind(this),
        handleCreateUser: this.handleCreateUser.bind(this),
        handlePasswordInput: this.handlePasswordInput.bind(this),
        handleForgotPassword: this.handleForgotPassword.bind(this),
        handleSignIn: this.handleSignIn.bind(this),
        handleCreateAccount: this.handleCreateAccount.bind(this),
        onFormError: this.onFormError.bind(this),
        setSignInState: this.setSignInState.bind(this),
        setLoadingState: this.setLoadingState.bind(this)
    };

    componentDidMount() {
        setTimeout(
            () => this.handleEmailInput(document.getElementById(GUEST_EMAIL_FIELD_ID).value),
            AUTOFILL_CHECK_TIMER
        );
    }

    containerProps = () => {
        const { emailValue } = this.props;
        return ({
            formId: SHIPPING_STEP,
            emailValue
        });
    };

    onFormError() {
        this.setState({ isLoading: false });
    }

    handleForgotPassword(e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        this.setState({ signInState: STATE_FORGOT_PASSWORD });
    }

    handleSignIn(e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        this.setState({ signInState: STATE_SIGN_IN });
    }

    handleCreateAccount(e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        this.setState({ signInState: STATE_CREATE_ACCOUNT });
    }

    setSignInState(signInState) {
        this.setState({ signInState });
    }

    setLoadingState(isLoading) {
        this.setState({ isLoading });
    }

    handleEmailInput(email) {
        const { onEmailChange } = this.props;
        onEmailChange(email);
    }

    handleCreateUser() {
        const { onCreateUserChange } = this.props;
        onCreateUserChange();
    }

    handlePasswordInput(password) {
        const { onPasswordChange } = this.props;
        onPasswordChange(password);
    }

    render() {
        const { isGuestEmailSaved } = this.props;
        if (isSignedIn() || isGuestEmailSaved) {
            return null;
        }

        return (
            <CheckoutGuestForm
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutGuestFormContainer);
