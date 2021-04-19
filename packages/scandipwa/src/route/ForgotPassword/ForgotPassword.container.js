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

import { CUSTOMER_SUB_ACCOUNT, LOGIN, REGISTER } from 'Component/Header/Header.config';
import {
    mapDispatchToProps,
    mapStateToProps,
    MyAccountOverlayContainer
} from 'Component/MyAccountOverlay/MyAccountOverlay.container';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import ForgotPassword from './ForgotPassword.component';

/** @namespace Route/ForgotPassword/Container/ForgotPasswordContainer */
export class ForgotPasswordContainer extends MyAccountOverlayContainer {
    containerFunctions = {
        ...this.containerFunctions,
        onLoginClick: this.onLoginClick.bind(this),
        onCreateAccountClick: this.onCreateAccountClick.bind(this)
    };

    componentDidMount() {
        const { setHeaderState } = this.props;

        setHeaderState({
            name: CUSTOMER_SUB_ACCOUNT,
            title: 'Forgot password',
            onBackClick: (e) => {
                history.push({ pathname: appendWithStoreCode(`${ LOGIN }`) });
                this.handleSignIn(e);
            }
        });
    }

    onLoginClick() {
        history.replace(appendWithStoreCode(`${ LOGIN }`));
    }

    onCreateAccountClick() {
        history.replace(appendWithStoreCode(`${ REGISTER }`));
    }

    render() {
        return (
            <ForgotPassword
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordContainer);
