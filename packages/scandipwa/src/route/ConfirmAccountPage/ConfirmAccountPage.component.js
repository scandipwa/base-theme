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
import { Redirect } from 'react-router';

import ContentWrapper from 'Component/ContentWrapper';
import Field from 'Component/Field';
import Form from 'Component/Form';
import Loader from 'Component/Loader';
import { isSignedIn } from 'Util/Auth';

import './ConfirmAccountPage.style';

/** @namespace Route/ConfirmAccountPage/Component */
export class ConfirmAccountPage extends PureComponent {
    static propTypes = {
        redirect: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired,
        onConfirmAttempt: PropTypes.func.isRequired,
        onConfirmSuccess: PropTypes.func.isRequired,
        onFormError: PropTypes.func.isRequired
    };

    renderForm() {
        const {
            onConfirmAttempt,
            onConfirmSuccess,
            onFormError
        } = this.props;

        // TODO: use FieldForm instead!!!

        return (
            <Form
              mix={ { block: 'ConfirmAccountPage', elem: 'Form' } }
              key="confirm-account"
              onSubmit={ onConfirmAttempt }
              onSubmitSuccess={ onConfirmSuccess }
              onSubmitError={ onFormError }
            >
                { /*
                    Added email field with display:none to fix warning
                    `Password forms should have (optionally hidden) username fields for accessibility`
                */ }
                <Field
                  type="email"
                  label={ __('Email') }
                  id="email"
                  name="email"
                  mix={ { block: 'ConfirmAccountPage', elem: 'EmailInput' } }
                />
                <Field
                  type="password"
                  label={ __('Password') }
                  id="password"
                  name="password"
                  validation={ ['notEmpty', 'password'] }
                />
                <button
                  type="submit"
                  block="Button"
                  mix={ { block: 'ConfirmAccountPage', elem: 'Button' } }
                >
                    { __('Confirm your account') }
                </button>
            </Form>
        );
    }

    render() {
        const {
            redirect,
            isLoading
        } = this.props;

        if (redirect || isSignedIn()) {
            return <Redirect to="/my-account/dashboard" />;
        }

        return (
            <main block="ConfirmAccountPage" aria-label={ __('Confirm Account Page') }>
                <ContentWrapper
                  wrapperMix={ { block: 'ConfirmAccountPage', elem: 'Wrapper' } }
                  label={ __('Confirm Account Action') }
                >
                    <Loader isLoading={ isLoading } />
                    <h1 block="ConfirmAccountPage" elem="Heading">
                        { __('Confirm your account') }
                    </h1>
                    { this.renderForm() }
                </ContentWrapper>
            </main>
        );
    }
}

export default ConfirmAccountPage;
