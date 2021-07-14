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

import FormPortal from 'Component/FormPortal';
import MyAccountAddressForm from 'Component/MyAccountAddressForm/MyAccountAddressForm.component';
import { getCityAndRegionFromZipcode } from 'Util/Address';
import { debounce } from 'Util/Request';

import { UPDATE_STATE_FREQUENCY } from './CheckoutAddressForm.config';

/** @namespace Component/CheckoutAddressForm/Component */
export class CheckoutAddressForm extends MyAccountAddressForm {
    static propTypes = {
        ...MyAccountAddressForm.propTypes,
        id: PropTypes.string.isRequired,
        onShippingEstimationFieldsChange: PropTypes.func
    };

    static defaultProps = {
        ...MyAccountAddressForm.defaultProps,
        onShippingEstimationFieldsChange: () => {}
    };

    onChange = debounce((key, value) => {
        this.setState(() => ({ [key]: value }));
    }, UPDATE_STATE_FREQUENCY);

    __construct(props) {
        super.__construct(props);

        const {
            address: { region: { region = '' } = {} },
            default_country,
            country_id
        } = this.props;

        const countryId = country_id || default_country;

        // TODO: get from region data
        this.state = {
            ...this.state,
            countryId,
            region,
            city: '',
            postcode: ''
        };

        this.estimateShipping();
    }

    componentDidUpdate(_, prevState) {
        const {
            countryId,
            regionId,
            region,
            city,
            postcode
        } = this.state;

        const {
            countryId: prevCountryId,
            regionId: prevRegionId,
            region: prevRegion,
            city: prevCity,
            postcode: prevPostcode
        } = prevState;

        if (
            countryId !== prevCountryId
            || regionId !== prevRegionId
            || city !== prevCity
            || region !== prevRegion
            || postcode !== prevPostcode
        ) {
            this.estimateShipping();
        }
    }

    estimateShipping() {
        const { onShippingEstimationFieldsChange } = this.props;

        const {
            countryId,
            regionId,
            region,
            city,
            postcode
        } = this.state;

        onShippingEstimationFieldsChange({
            country_id: countryId,
            region_id: regionId,
            region,
            city,
            postcode
        });
    }

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

    get fieldMap() {
        // country_id, region, region_id, city - are used for shipping estimation
        const { shippingFields, countries } = this.props;

        const {
            default_billing,
            default_shipping,
            city,
            postcode,
            vat_id,
            country_id,
            telephone,
            region_string,
            region_id,
            ...fieldMap
        } = super.fieldMap;

        // since object doesn't maintain the order of it's properties
        // and last modified property goes to the end of the property list,
        // move some of field into correct order.
        fieldMap.country_id = {
            ...country_id,
            selectOptions: countries.map(({ id, label }) => ({ id, label, value: id }))
        };

        if (region_id) {
            fieldMap.region_id = region_id;
        }

        if (region_string) {
            fieldMap.region_string = region_string;
        }

        fieldMap.city = {
            ...city,
            onChange: (value) => this.onChange('city', value),
            value: this.state.city
        };

        fieldMap.postcode = {
            ...postcode,
            onChange: (value) => this.onChange('postcode', value),
            onBlur: this.onZipcodeChange
        };

        // Make phone the last field
        if (telephone) {
            fieldMap.telephone = telephone;
        }

        if (vat_id) {
            fieldMap.vat_id = vat_id;
        }

        // Preserve values from global state
        Object.entries(fieldMap).forEach(([key]) => {
            if (Object.hasOwnProperty.call(shippingFields, key)) {
                fieldMap[key].value = shippingFields[key];

                // Handle setting dropdown/input depending on regions existance
                if (key === 'country_id') {
                    this.handleInitialCountryValue(shippingFields[key]);
                }
            }
        });

        return fieldMap;
    }

    handleInitialCountryValue(initialValue) {
        if (this.handledInitialCountry) {
            return;
        }

        this.onCountryChange(initialValue);
        this.handledInitialCountry = true;
    }

    getRegionFields() {
        const { regionDisplayAll } = this.props;
        const regionFieldData = super.getRegionFields();

        if (!regionDisplayAll && !regionFieldData) {
            return null;
        }

        const { region_string } = regionFieldData;

        if (region_string) {
            regionFieldData.region_string.onChange = (v) => this.onChange('region', v);
        }

        return regionFieldData;
    }

    render() {
        const { id } = this.props;

        return (
            <FormPortal
              id={ id }
              name="CheckoutAddressForm"
            >
                <div
                  block="FieldForm"
                  mix={ { block: 'CheckoutAddressForm' } }
                >
                    { this.renderFields() }
                </div>
            </FormPortal>
        );
    }
}

export default CheckoutAddressForm;
