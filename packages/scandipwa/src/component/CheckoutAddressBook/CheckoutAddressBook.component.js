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

import CheckoutAddressForm from 'Component/CheckoutAddressForm';
import CheckoutAddressTable from 'Component/CheckoutAddressTable';
import Link from 'Component/Link';
import Loader from 'Component/Loader';
import { BILLING_STEP, SHIPPING_STEP } from 'Route/Checkout/Checkout.config';
import { MY_ACCOUNT_URL } from 'Route/MyAccount/MyAccount.config';
import { ADDRESS_BOOK, customerType } from 'Type/Account';
import { getDefaultAddressLabel } from 'Util/Address';
import { isSignedIn } from 'Util/Auth';

import './CheckoutAddressBook.style';

/** @namespace Component/CheckoutAddressBook/Component */
export class CheckoutAddressBook extends PureComponent {
    static propTypes = {
        customer: customerType.isRequired,
        onAddressSelect: PropTypes.func.isRequired,
        onShippingEstimationFieldsChange: PropTypes.func.isRequired,
        selectedAddressId: PropTypes.number.isRequired,
        isBilling: PropTypes.bool.isRequired,
        isSubmitted: PropTypes.bool,
        is_virtual: PropTypes.bool
    };

    static defaultProps = {
        isSubmitted: false,
        is_virtual: false
    };

    state = {
        isCustomAddressExpanded: false
    };

    static getDerivedStateFromProps(props) {
        const { is_virtual, selectedAddressId } = props;

        if (selectedAddressId === 0) {
            return is_virtual ? { isCustomAddressExpanded: true } : null;
        }

        return { isCustomAddressExpanded: false };
    }

    expandCustomAddress = () => {
        const { onAddressSelect } = this.props;
        this.setState({ isCustomAddressExpanded: true });
        onAddressSelect({});
    };

    renderNoAddresses() {
        return (
            <div>
                <p>{ __('You have no configured addresses.') }</p>
                <p>
                    <Link to={ `${ MY_ACCOUNT_URL }/${ ADDRESS_BOOK }` }>
                        { __('Go to Address Book to configure them!') }
                    </Link>
                </p>
            </div>
        );
    }

    renderLoading() {
        return (
            <Loader isLoading />
        );
    }

    renderAddress = (address, index) => {
        const { onAddressSelect, selectedAddressId } = this.props;
        const addressNumber = index + 1;
        const { id } = address;
        const postfix = getDefaultAddressLabel(address);

        return (
            <CheckoutAddressTable
              onClick={ onAddressSelect }
              isSelected={ selectedAddressId === id }
              title={ __('Address #%s%s', addressNumber, postfix) }
              address={ address }
              key={ id }
            />
        );
    };

    renderAddressList() {
        const { customer: { addresses } } = this.props;
        if (!addresses) {
            return this.renderLoading();
        }
        if (!addresses.length) {
            return this.renderNoAddresses();
        }

        return addresses.map(this.renderAddress);
    }

    renderHeading() {
        const { isBilling } = this.props;

        if (isBilling) {
            return null;
        }

        return (
            <h2 block="Checkout" elem="Heading">
                { __('Shipping address') }
            </h2>
        );
    }

    renderCustomAddress() {
        const { isBilling, onShippingEstimationFieldsChange, isSubmitted } = this.props;
        const formPortalId = isBilling ? BILLING_STEP : SHIPPING_STEP;

        return (
            <CheckoutAddressForm
              onShippingEstimationFieldsChange={ onShippingEstimationFieldsChange }
              address={ {} }
              id={ formPortalId }
              isSubmitted={ isSubmitted }
            />
        );
    }

    renderOptionalCustomAddress() {
        const { isCustomAddressExpanded } = this.state;

        return (
            <div
              block="CheckoutAddressBook"
              elem="CustomAddressWrapper"
            >
                <button
                  block="CheckoutAddressBook"
                  elem="Button"
                  mods={ { isCustomAddressExpanded } }
                  mix={ { block: 'Button', mods: { isHollow: true } } }
                  type="button"
                  onClick={ this.expandCustomAddress }
                >
                    { __('Use custom address') }
                </button>
                { isCustomAddressExpanded && this.renderCustomAddress() }
            </div>
        );
    }

    renderSignedInContent() {
        return (
            <>
                <div block="CheckoutAddressBook" elem="Wrapper">
                    { this.renderAddressList() }
                </div>
                { this.renderOptionalCustomAddress() }
            </>
        );
    }

    renderGuestContent() {
        return this.renderCustomAddress();
    }

    renderContent() {
        if (isSignedIn()) {
            return this.renderSignedInContent();
        }

        return this.renderGuestContent();
    }

    render() {
        return (
            <div block="CheckoutAddressBook">
                { this.renderHeading() }
                { this.renderContent() }
            </div>
        );
    }
}

export default CheckoutAddressBook;
