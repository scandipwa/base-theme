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

import { customerType } from 'Type/Account';

import MyAccountDashboard from './MyAccountDashboard.component';

export const mapStateToProps = state => ({
    customer: state.MyAccountReducer.customer
});

export class MyAccountDashboardContainer extends ExtensiblePureComponent {
    static propTypes = {
        customer: customerType.isRequired
    };

    containerFunctions = {
        getDefaultAddress: this.getDefaultAddress.bind(this)
    };

    getDefaultAddress(isBilling) {
        const { customer: { addresses = [] } } = this.props;
        const key = isBilling ? 'default_billing' : 'default_shipping';
        return addresses.find(({ [key]: defaultAddress }) => defaultAddress);
    }

    render() {
        return (
            <MyAccountDashboard
              { ...this.props }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, null)(
    middleware(MyAccountDashboardContainer, 'Component/MyAccountDashboard/Container')
);
