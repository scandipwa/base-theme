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
    TERMS_AND_CONDITIONS_POPUP_ID
} from 'Component/CheckoutTermsAndConditionsPopup/CheckoutTermsAndConditionsPopup.config';
import { setAgreementsStatus } from 'Store/Checkout/Checkout.action';
import { showPopup } from 'Store/Popup/Popup.action';

import CheckoutAgreements from './CheckoutAgreements.component';

/** @namespace Component/CheckoutAgreements/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    setAgreementsStatus: (isAllRequiredTermsSelected) => dispatch(setAgreementsStatus(isAllRequiredTermsSelected)),
    showPopup: (payload) => dispatch(showPopup(TERMS_AND_CONDITIONS_POPUP_ID, payload))
});

/** @namespace Component/CheckoutAgreements/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    termsAreEnabled: state.ConfigReducer.terms_are_enabled,
    termsAndConditions: state.ConfigReducer.checkoutAgreements
});

/**
 * @class CheckoutAgreementsContainer
 * @namespace Component/CheckoutAgreements/Container
 */
export class CheckoutAgreementsContainer extends PureComponent {
    static propTypes = {
        showPopup: PropTypes.func.isRequired,
        termsAndConditions: PropTypes.arrayOf(PropTypes.shape({
            checkbox_text: PropTypes.string,
            content: PropTypes.string,
            name: PropTypes.string
        })).isRequired
    };

    containerFunctions = {
        showAgreementPopup: this.showAgreementPopup.bind(this)
    };

    showAgreementPopup(agreementId) {
        const { showPopup, termsAndConditions } = this.props;

        const {
            name: title = __('Terms and Conditions'),
            content: text = __('There are no Terms and Conditions configured.')
        } = termsAndConditions.find((term) => term.agreement_id === agreementId) || {};

        return showPopup({
            title, text
        });
    }

    render() {
        return (
            <CheckoutAgreements
              { ...this.props }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutAgreementsContainer);
