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
import Loader from 'Component/Loader';
import { addressType } from 'Type/Account';
import { MixType } from 'Type/Common';

import './MyAccountAddressTable.style';

/** @namespace Component/MyAccountAddressTable/Component */
export class MyAccountAddressTable extends KeyValueTable {
    static propTypes = {
        mix: MixType,
        getFormatedRegion: PropTypes.func.isRequired,
        address: addressType.isRequired,
        showActions: PropTypes.bool,
        showAdditionalFields: PropTypes.bool,
        onEditClick: PropTypes.func.isRequired,
        onDeleteClick: PropTypes.func.isRequired,
        countries: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string,
                id: PropTypes.string,
                available_regions: PropTypes.arrayOf(
                    PropTypes.shape({
                        code: PropTypes.string,
                        name: PropTypes.string,
                        id: PropTypes.number
                    })
                )
            })
        ).isRequired
    };

    static defaultProps = {
        showAdditionalFields: false,
        showActions: false,
        mix: {}
    };

    get dataPairArray() {
        const { address, getFormatedRegion, showAdditionalFields } = this.props;
        const regionData = getFormatedRegion(address);

        const additionalFields = [
            {
                key: 'country',
                label: __('County'),
                source: regionData
            },
            {
                key: 'region',
                label: __('State/Province'),
                source: regionData
            },
            {
                key: 'city',
                label: __('City'),
                source: address
            }
            // Will be back with B2B update
            // {
            //     key: 'company',
            //     label: __('Company'),
            //     source: address
            // }
        ];

        return [
            {
                key: 'firstname',
                label: __('First name'),
                source: address
            },
            {
                key: 'lastname',
                label: __('Last name'),
                source: address
            },
            {
                key: 'street',
                label: __('Street'),
                source: address
            },
            {
                key: 'postcode',
                label: __('Postal code'),
                source: address
            },
            {
                key: 'telephone',
                label: __('Phone number'),
                source: address
            },
            ...(showAdditionalFields ? additionalFields : [])
        ];
    }

    renderActions() {
        const {
            onEditClick,
            onDeleteClick,
            showActions,
            address: { default_billing, default_shipping }
        } = this.props;

        const isDeleteAllowed = default_shipping || default_billing;

        if (!showActions) {
            return null;
        }

        return (
            <>
                <button
                  block="Button"
                  onClick={ onEditClick }
                  mods={ { isHollow: true } }
                >
                    { __('Edit address') }
                </button>
                <button
                  block="Button"
                  mods={ { isHollow: true, isWithoutBorder: true } }
                  onClick={ onDeleteClick }
                  disabled={ isDeleteAllowed }
                  title={ isDeleteAllowed ? __('Can not delete - address is set as default.') : 'Delete this address' }
                >
                    { __('Delete') }
                </button>
            </>
        );
    }

    render() {
        const { countries, mix } = this.props;

        return (
            <div block="MyAccountAddressTable" mix={ mix }>
                <Loader isLoading={ !countries.length } />
                { this.renderTable() }
                { this.renderActions() }
            </div>
        );
    }
}

export default MyAccountAddressTable;
