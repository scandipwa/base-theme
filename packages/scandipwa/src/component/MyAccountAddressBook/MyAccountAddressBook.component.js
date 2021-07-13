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

import MyAccountAddressPopup from 'Component/MyAccountAddressPopup';
import MyAccountAddressTable from 'Component/MyAccountAddressTable';
import { customerType } from 'Type/Account';
import { getDefaultAddressLabel } from 'Util/Address';

import './MyAccountAddressBook.style';

/** @namespace Component/MyAccountAddressBook/Component */
export class MyAccountAddressBook extends PureComponent {
    static propTypes = {
        customer: customerType.isRequired,
        showCreateNewPopup: PropTypes.func.isRequired
    };

    renderPopup() {
        return <MyAccountAddressPopup />;
    }

    renderAddress = (address, index) => {
        const addressNumber = index + 1;
        const postfix = getDefaultAddressLabel(address);

        return (
            <MyAccountAddressTable
              title={ __('Address #%s%s', addressNumber, postfix) }
              showActions
              address={ address }
              key={ addressNumber }
            />
        );
    };

    renderNoAddresses() {
        return (
            <div>
                <p>{ __('You have no configured addresses.') }</p>
            </div>
        );
    }

    renderActions() {
        const { showCreateNewPopup } = this.props;

        return (
            <button
              block="Button"
              mix={ { block: 'MyAccountAddressBook', elem: 'Button' } }
              mods={ { isHollow: true } }
              onClick={ showCreateNewPopup }
            >
                { __('Add new address') }
            </button>
        );
    }

    renderAddressList() {
        const { customer: { addresses = [] } } = this.props;
        if (!addresses.length) {
            return this.renderNoAddresses();
        }

        return addresses.map(this.renderAddress);
    }

    render() {
        return (
            <div block="MyAccountAddressBook">
                { this.renderActions() }
                { this.renderAddressList() }
                { this.renderPopup() }
            </div>
        );
    }
}

export default MyAccountAddressBook;
