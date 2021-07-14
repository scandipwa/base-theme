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

import FieldForm from 'Component/FieldForm';
import { addressType } from 'Type/Account';
import { countriesType } from 'Type/Config';
import { getCityAndRegionFromZipcode, setAddressesInFormObject } from 'Util/Address';

/** @namespace Component/MyAccountAddressForm/Component */
export class MyAccountAddressForm extends FieldForm {
    static propTypes = {
        isSubmitted: PropTypes.bool,
        address: addressType.isRequired,
        countries: countriesType.isRequired,
        default_country: PropTypes.string,
        onSave: PropTypes.func,
        addressLinesQty: PropTypes.number.isRequired,
        showVatNumber: PropTypes.bool.isRequired,
        regionDisplayAll: PropTypes.bool.isRequired
    };

    static defaultProps = {
        default_country: 'US',
        isSubmitted: false,
        onSave: () => {}
    };

    __construct(props) {
        super.__construct(props);

        const {
            countries,
            address: {
                country_id,
                region: { region_id } = {},
                city = ''
            }
        } = props;

        const country = countries.find(({ id }) => id === country_id) || {};
        const countryId = Object.keys(country).length ? country_id : '';

        const {
            available_regions: availableRegions,
            is_state_required = false
        } = country;

        const regions = availableRegions || [{}];
        const regionId = region_id || regions[0].id;

        this.state = {
            countryId,
            availableRegions,
            regionId,
            isStateRequired: is_state_required,
            city
        };
    }

    onFormSuccess = (fields) => {
        const { onSave, addressLinesQty } = this.props;
        const { region_id = 0, region_string: region, ...newAddress } = addressLinesQty > 1
            ? setAddressesInFormObject(fields, addressLinesQty)
            : fields;

        newAddress.region = { region_id, region };
        onSave(newAddress);
    };

    getRegionFields() {
        const { address: { region: { region } = {} }, regionDisplayAll } = this.props;
        const { availableRegions, regionId, isStateRequired } = this.state;

        if (!regionDisplayAll && !isStateRequired) {
            return null;
        }

        if (!availableRegions || !availableRegions.length) {
            return {
                region_string: {
                    label: __('State / Province'),
                    value: region,
                    validation: isStateRequired ? ['notEmpty'] : []
                }
            };
        }

        return {
            region_id: {
                label: __('State / Province'),
                type: 'select',
                selectOptions: availableRegions.map(({ id, name }) => ({ id, label: name, value: id })),
                onChange: (regionId) => this.setState({ regionId }),
                value: regionId,
                validation: isStateRequired ? ['notEmpty'] : []
            }
        };
    }

    onCountryChange = (countryId) => {
        const { countries } = this.props;
        const country = countries.find(({ id }) => id === countryId);
        const { available_regions, is_state_required } = country;

        this.setState({
            countryId,
            isStateRequired: is_state_required,
            availableRegions: available_regions || []
        });
    };

    onZipcodeChange = async (e) => {
        const { value } = e.currentTarget;
        const { countryId, availableRegions } = this.state;

        const [city, regionCode] = await getCityAndRegionFromZipcode(countryId, value);
        if (city) {
            this.setState({
                city
            });
        }

        if (availableRegions.length > 0 && regionCode) {
            const { id: regionId } = availableRegions
                .find((r) => r.code.toUpperCase() === regionCode.toUpperCase());

            if (regionId) {
                this.setState({ regionId });
            }
        }
    };

    getStreetFields(label, placeholder, index) {
        const { address: { street = [] }, isSubmitted } = this.props;

        return {
            label,
            placeholder,
            value: street[index],
            validation: index === 0 ? ['notEmpty'] : [],
            validateSeparately: true,
            isSubmitted
        };
    }

    // returns the address fields in quantity equal to BE
    getAddressFields() {
        const { addressLinesQty } = this.props;

        if (addressLinesQty === 1) {
            return {
                street: this.getStreetFields(
                    __('Street address'),
                    __('Your street address'),
                    0
                )
            };
        }

        const streets = {};

        // eslint-disable-next-line fp/no-loops, fp/no-let
        for (let i = 0; i < addressLinesQty; i++) {
            streets[`street${i}`] = this.getStreetFields(
                __('Street address line %s', i + 1),
                __('Your street address line %s', i + 1),
                i
            );
        }

        return streets;
    }

    getVatField() {
        const { showVatNumber } = this.props;

        if (!showVatNumber) {
            return {};
        }

        return {
            vat_id: {
                label: __('VAT Number')
            }
        };
    }

    get fieldMap() {
        const { countryId, city } = this.state;
        const { countries: sourceCountries, address, isSubmitted } = this.props;
        const { default_billing, default_shipping } = address;

        /*
        * Map and push empty field to show in case
        * if no country selected instead of default for myaccount
        */
        const countries = sourceCountries.map(({ id, label }) => ({ id, label, value: id }));
        countries.push({ id: ' ', label: ' ', value: ' ' });

        return {
            default_billing: {
                type: 'checkbox',
                label: __('This is default Billing Address'),
                value: 'default_billing',
                checked: default_billing
            },
            default_shipping: {
                type: 'checkbox',
                label: __('This is default Shipping Address'),
                value: 'default_shipping',
                checked: default_shipping
            },
            firstname: {
                label: __('First name'),
                validation: ['notEmpty'],
                validateSeparately: true,
                isSubmitted,
                placeholder: __('Your first name')
            },
            lastname: {
                label: __('Last name'),
                validation: ['notEmpty'],
                validateSeparately: true,
                isSubmitted,
                placeholder: __('Your last name')
            },
            ...this.getAddressFields(),
            city: {
                label: __('City'),
                validation: ['notEmpty'],
                validateSeparately: true,
                isSubmitted,
                value: city,
                placeholder: __('Your city')
            },
            country_id: {
                type: 'select',
                label: __('Country'),
                validation: ['notEmpty'],
                validateSeparately: true,
                isSubmitted,
                value: countryId,
                selectOptions: countries,
                onChange: this.onCountryChange
            },
            ...this.getRegionFields(),
            postcode: {
                label: __('Zip / Postal code'),
                validation: ['notEmpty'],
                validateSeparately: true,
                isSubmitted,
                onBlur: this.onZipcodeChange,
                placeholder: __('Your zip / postal code')
            },
            ...this.getVatField(),
            telephone: {
                label: __('Phone number'),
                validation: ['notEmpty', 'telephone'],
                validateSeparately: true,
                isSubmitted
            }
            // Will be back with B2B update
            // company: {
            //     label: __('Company')
            // }
        };
    }

    getDefaultValues(fieldEntry) {
        const [key, { value }] = fieldEntry;
        const { address: { [key]: addressValue } } = this.props;

        return {
            ...super.getDefaultValues(fieldEntry),
            value: value !== undefined ? value : addressValue
        };
    }

    renderActions() {
        return (
            <button
              type="submit"
              block="Button"
              mix={ { block: 'MyAccount', elem: 'Button' } }
              mods={ { isHollow: true } }
            >
                { __('Save address') }
            </button>
        );
    }
}

export default MyAccountAddressForm;
