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

import { CUSTOMER_SUB_ACCOUNT, LOGIN } from 'Component/Header/Header.config';
import {
    mapDispatchToProps,
    mapStateToProps,
    MyAccountOverlayContainer
} from 'Component/MyAccountOverlay/MyAccountOverlay.container';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import CreateAccount from './CreateAccount.component';

/** @namespace Route/CreateAccount/Container/CreateAccountContainer */
export class CreateAccountContainer extends MyAccountOverlayContainer {
    containerFunctions = {
        ...this.containerFunctions,
        onLoginClick: this.onLoginClick.bind(this)
    };

    componentDidMount() {
        const { setHeaderState } = this.props;

        setHeaderState({
            name: CUSTOMER_SUB_ACCOUNT,
            title: 'Create account',
            onBackClick: (e) => {
                history.push({ pathname: appendWithStoreCode(`${ LOGIN }`) });
                this.handleSignIn(e);
            }
        });
    }

    onLoginClick() {
        history.replace(appendWithStoreCode(`${ LOGIN }`));
    }

    render() {
        return (
            <CreateAccount
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccountContainer);
