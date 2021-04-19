/* eslint-disable @scandipwa/scandipwa-guidelines/jsx-no-props-destruction */
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

import { connect } from 'react-redux';

import { CUSTOMER_ACCOUNT, FORGOT_PASSWORD, REGISTER } from 'Component/Header/Header.config';
import {
    mapDispatchToProps,
    mapStateToProps,
    MyAccountOverlayContainer
} from 'Component/MyAccountOverlay/MyAccountOverlay.container';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import LoginAccount from './LoginAccount.component';

/** @namespace Route/LoginAccount/Container/LoginAccountContainer */
export class LoginAccountContainer extends MyAccountOverlayContainer {
    containerFunctions = {
        ...this.containerFunctions,
        onCreateAccountClick: this.onCreateAccountClick.bind(this)
    };

    onCreateAccountClick() {
        history.replace(appendWithStoreCode(`${ REGISTER }`));
    }

    handleForgotPassword() {
        history.replace(appendWithStoreCode(`${ FORGOT_PASSWORD }`));
    }

    componentDidMount() {
        const { setHeaderState } = this.props;

        setHeaderState({ name: CUSTOMER_ACCOUNT, title: __('Sign in') });
    }

    render() {
        return (
            <LoginAccount
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginAccountContainer);
