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

import KeyValueTable from 'Component/KeyValueTable';
import { customerType } from 'Type/Account';

/** @namespace Component/MyAccountCustomerTable/Component */
export class MyAccountCustomerTable extends KeyValueTable {
    static propTypes = {
        customer: customerType.isRequired,
        showEditPopup: PropTypes.func.isRequired,
        showChangePasswordPopup: PropTypes.func.isRequired
    };

    get dataPairArray() {
        const { customer } = this.props;

        return [
            {
                key: 'firstname',
                label: __('First name'),
                source: customer
            },
            {
                key: 'lastname',
                label: __('Last name'),
                source: customer
            },
            {
                key: 'email',
                label: __('Email'),
                source: customer
            }
        ];
    }

    renderActions() {
        const { showChangePasswordPopup, showEditPopup } = this.props;

        return (
            <>
                <button
                  block="Button"
                  mods={ { isHollow: true } }
                  onClick={ showEditPopup }
                >
                    { __('Edit details') }
                </button>
                <button
                  block="Button"
                  mods={ { isHollow: true, isWithoutBorder: true } }
                  onClick={ showChangePasswordPopup }
                >
                    { __('Change password') }
                </button>
            </>
        );
    }

    render() {
        return (
            <div block="MyAccountCustomerTable">
                { this.renderTable() }
                { this.renderActions() }
            </div>
        );
    }
}

export default MyAccountCustomerTable;
