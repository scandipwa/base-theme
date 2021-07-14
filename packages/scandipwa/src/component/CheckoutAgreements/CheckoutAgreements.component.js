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

import Field from 'Component/Field';

import './CheckoutAgreements.style.scss';

/**
 * @class CheckoutAgreements
 * @namespace Component/CheckoutAgreements/Component
 */
export class CheckoutAgreements extends PureComponent {
    static propTypes = {
        termsAreEnabled: PropTypes.bool.isRequired,
        termsAndConditions: PropTypes.array.isRequired,
        setAgreementsStatus: PropTypes.func.isRequired,
        showAgreementPopup: PropTypes.func.isRequired
    };

    state = {
        isTermsAndConditionsAccepted: false,
        selectedAgreementsList: [],
        requiredAgreementsList: []
    };

    componentDidMount() {
        const { termsAreEnabled } = this.props;

        if (termsAreEnabled) {
            this.setRequiredAgreements();
        } else {
            this.setState({ isTermsAndConditionsAccepted: true });
        }
    }

    setRequiredAgreements = () => {
        const { termsAndConditions } = this.props;
        const requiredAgreementsList = [];

        termsAndConditions.map(({ agreement_id }) => requiredAgreementsList.push(agreement_id));
        this.setState({ requiredAgreementsList });
    };

    checkTermsAndConditions = () => {
        const { setAgreementsStatus } = this.props;
        const { requiredAgreementsList, selectedAgreementsList } = this.state;
        const allRequiredSelected = requiredAgreementsList.every((elem) => selectedAgreementsList.indexOf(elem) > -1);

        setAgreementsStatus(allRequiredSelected);
        this.setState({ isTermsAndConditionsAccepted: allRequiredSelected });
    };

    updateAgreementsList = (agreementId, isChecked) => {
        const { selectedAgreementsList } = this.state;

        if (isChecked) {
            const agreements = selectedAgreementsList.concat(+agreementId);

            this.setState({
                selectedAgreementsList: agreements
            }, () => this.checkTermsAndConditions());
        } else {
            const agreements = selectedAgreementsList.filter((val) => val !== +agreementId);

            this.setState({
                selectedAgreementsList: agreements
            }, () => this.checkTermsAndConditions());
        }
    };

    handleReadMoreClick = (agreementId) => {
        const { showAgreementPopup } = this.props;

        showAgreementPopup(agreementId);
    };

    render() {
        const {
            termsAreEnabled,
            termsAndConditions
        } = this.props;

        const { isTermsAndConditionsAccepted } = this.state;

        if (!termsAreEnabled) {
            return null;
        }

        return (
            <div block="CheckoutAgreements">
                { termsAndConditions.map((item) => {
                    const {
                        checkbox_text, agreement_id, is_required = true
                    } = item;

                    return (
                        <div
                          key={ agreement_id }
                          block="CheckoutAgreements"
                          elem="TermsAndConditions"
                        >
                            <Field
                              id={ `termsAndConditions-${ agreement_id }` }
                              name="agreement"
                              type="checkbox"
                              value={ agreement_id }
                              mix={ { block: 'CheckoutAgreements', elem: 'TermsAndConditions-Checkbox' } }
                              checked={ isTermsAndConditionsAccepted[agreement_id] }
                              onChange={ this.updateAgreementsList }
                            />
                            <label
                              block="CheckoutAgreements"
                              elem="TACLabel"
                              mods={ { required: is_required } }
                              htmlFor={ `termsAndConditions-${ agreement_id }` }
                            >
                                { checkbox_text }
                            </label>
                            <button
                              block="CheckoutAgreements"
                              elem="TACLink"
                              type="button"
                              // TODO: break down to smaller components
                              /* eslint-disable-next-line react/jsx-no-bind */
                              onClick={ () => this.handleReadMoreClick(agreement_id) }
                            >
                                { __('read more') }
                            </button>
                        </div>
                    );
                }) }
            </div>
        );
    }
}

export default CheckoutAgreements;
