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

import { REQUEST_SHIPPING_METHODS_FREQUENCY } from './CheckoutAddressForm.config';

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

    onChange = (key, value) => this.setState(() => ({ [key]: value }));

    __construct(props) {
        super.__construct(props);

        const {
            shippingFields: {
                city = '',
                region_id: regionId = null,
                region_string: region = '',
                country_id: countryId = '',
                postcode = ''
            }
        } = this.props;

        this.state = {
            ...this.state,
            region,
            regionId,
            city,
            countryId,
            postcode
        };
    }

    componentDidMount() {
        this.estimateShipping();
    }

    estimateShippingDebounced = debounce(
        this.estimateShipping.bind(this),
        REQUEST_SHIPPING_METHODS_FREQUENCY
    );

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
            postcode: prevpostcode
        } = prevState;

        if (
            countryId !== prevCountryId
            || regionId !== prevRegionId
            || city !== prevCity
            || region !== prevRegion
            || postcode !== prevpostcode
        ) {
            this.estimateShippingDebounced();
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
        const { shippingFields } = this.props;

        const {
            default_billing,
            default_shipping,
            city,
            postcode,
            vat_id,
            ...fieldMap
        } = super.fieldMap;

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

        // since object doesn't maintain the order of it's properties
        // and last modified property goes to the end of the property list,
        // move vat_id after postcode
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
