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

import { PRICE_TYPE_PERCENT } from 'Component/ProductBundleItem/ProductBundleItem.config';
import { showNotification } from 'Store/Notification/Notification.action';
import { PriceType } from 'Type/ProductList';
import { formatPrice } from 'Util/Price';

import ProductCustomizableOption from './ProductCustomizableOption.component';

/** @namespace Component/ProductCustomizableOption/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showNotification: (type, message) => dispatch(showNotification(type, message))
});

/** @namespace Component/ProductCustomizableOption/Container/mapStateToProps */
// eslint-disable-next-line no-unused-vars
export const mapStateToProps = () => ({});

/** @namespace Component/ProductCustomizableOption/Container */
export class ProductCustomizableOptionContainer extends PureComponent {
    static propTypes = {
        option: PropTypes.object.isRequired,
        productOptionsData: PropTypes.object.isRequired,
        setSelectedCheckboxValues: PropTypes.func.isRequired,
        setCustomizableOptionTextFieldValue: PropTypes.func.isRequired,
        setCustomizableOptionFileFieldValue: PropTypes.func,
        setSelectedDropdownValue: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
        price_range: PriceType.isRequired,
        type_id: PropTypes.string.isRequired
    };

    static defaultProps = {
        setCustomizableOptionFileFieldValue: () => null
    };

    state = {
        textValue: '',
        selectedDropdownValue: 0,
        textFieldValid: null
    };

    containerFunctions = {
        getDropdownOptions: this.getDropdownOptions.bind(this),
        getSelectedCheckboxValue: this.getSelectedCheckboxValue.bind(this),
        updateTextFieldValue: this.updateTextFieldValue.bind(this),
        setDropdownValue: this.setDropdownValue.bind(this),
        processFileUpload: this.processFileUpload.bind(this),
        renderOptionLabel: this.renderOptionLabel.bind(this)
    };

    containerProps = () => ({
        optionType: this.getOptionType(),
        requiredSelected: this.getIsRequiredSelected()
    });

    getOptionType() {
        const { option } = this.props;
        const { type } = option;

        return type;
    }

    getIsRequiredSelected() {
        const {
            productOptionsData,
            productOptionsData: {
                requiredOptions,
                productOptions,
                productOptionsMulti
            },
            option: {
                option_id
            }
        } = this.props;

        if (Object.keys(productOptionsData).length < 1 || !requiredOptions) {
            return true;
        }

        const selectedItems = [...productOptions || [], ...productOptionsMulti || []];
        const isRequired = requiredOptions.reduce((acc, item) => {
            if (item === option_id) {
                acc.push(item);
            }

            return acc;
        }, []);

        if (!isRequired.length) {
            return true;
        }

        const isRequiredSelected = selectedItems.reduce((acc, { option_id }) => {
            if (isRequired[0] === option_id) {
                acc.push(option_id);
            }

            return acc;
        }, []);

        return !!isRequiredSelected.length;
    }

    renderPercent(priceType, price) {
        if (priceType !== PRICE_TYPE_PERCENT) {
            return '';
        }

        return ` (${ price }%)`;
    }

    renderOptionLabel(priceType, priceInclTax, price, currency) {
        return (price === 0 && priceInclTax === 0)
            ? ''
            : `+ ${formatPrice(priceInclTax, currency)}${this.renderPercent(priceType, price)}`;
    }

    getSelectedCheckboxValue(value) {
        const { option, setSelectedCheckboxValues } = this.props;
        const { option_id } = option;

        setSelectedCheckboxValues(option_id, value);
    }

    updateTextFieldValue(value) {
        const { option, setCustomizableOptionTextFieldValue } = this.props;
        const { option_id, required } = option;

        setCustomizableOptionTextFieldValue(option_id, value);
        this.setState({
            fieldValue: value,
            textFieldValid: required ? value.length > 0 : true
        });
    }

    setDropdownValue(value) {
        const { setSelectedDropdownValue, option } = this.props;
        const { selectedDropdownValue } = this.state;

        if (selectedDropdownValue === value) {
            setSelectedDropdownValue(null, option);
            this.setState({ selectedDropdownValue: 0 });
        } else {
            setSelectedDropdownValue(value, option);
            this.setState({ selectedDropdownValue: parseInt(value, 10) });
        }
    }

    getDropdownOptions(values) {
        return values.reduce((acc, {
            option_type_id,
            title,
            priceInclTax,
            price,
            price_type,
            currency
        }) => {
            acc.push({
                id: option_type_id,
                name: title,
                value: option_type_id,
                label: `${title} `,
                subLabel: this.renderOptionLabel(price_type, priceInclTax, price, currency)
            });

            return acc;
        }, []);
    }

    processFileUpload(values) {
        const {
            option,
            option: { data: { file_extension = '' } },
            setCustomizableOptionFileFieldValue,
            showNotification
        } = this.props;
        const { type = '', name } = values;

        if (file_extension && !file_extension.split(', ').some((fileType) => type.includes(fileType))) {
            showNotification('error', __('File type is incorrect'));

            return false;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCustomizableOptionFileFieldValue(reader.result, option, name);
        };

        reader.readAsDataURL(values);

        return true;
    }

    render() {
        return (
            <ProductCustomizableOption
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductCustomizableOptionContainer);
