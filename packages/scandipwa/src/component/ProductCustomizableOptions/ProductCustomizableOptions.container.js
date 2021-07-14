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

import { OptionsType } from 'Type/ProductList';

import ProductCustomizableOptions from './ProductCustomizableOptions.component';

/** @namespace Component/ProductCustomizableOptions/Container */
export class ProductCustomizableOptionsContainer extends PureComponent {
    static propTypes = {
        options: OptionsType,
        getSelectedCustomizableOptions: PropTypes.func.isRequired
    };

    static defaultProps = {
        options: []
    };

    state = {
        isLoading: true,
        selectedCheckboxValues: [],
        selectedDropdownOptions: [],
        textFieldValues: [],
        fileFieldValues: []
    };

    containerFunctions = {
        setSelectedDropdownValue: this.setSelectedDropdownValue.bind(this),
        setSelectedCheckboxValues: this.setSelectedCheckboxValues.bind(this),
        setCustomizableOptionTextFieldValue: this.setCustomizableOptionTextFieldValue.bind(this),
        setCustomizableOptionFileFieldValue: this.setCustomizableOptionFileFieldValue.bind(this)
    };

    componentDidMount() {
        const { options } = this.props;

        if (options) {
            this.stopLoading();
        }
    }

    componentDidUpdate(_, prevState) {
        const { options } = this.props;
        const {
            selectedCheckboxValues,
            selectedDropdownOptions,
            textFieldValues,
            fileFieldValues,
            isLoading
        } = this.state;

        const {
            selectedCheckboxValues: prevSelectedCheckboxValues,
            selectedDropdownOptions: prevSelectedDropdownOptions,
            textFieldValues: prevTextFieldValues,
            fileFieldValues: prevFileFieldValues
        } = prevState;

        if (options && isLoading) {
            this.stopLoading();
        }

        if (selectedCheckboxValues !== prevSelectedCheckboxValues) {
            this.updateSelectedOptionsArray();
        }

        if (textFieldValues !== prevTextFieldValues
            || selectedDropdownOptions !== prevSelectedDropdownOptions
        ) {
            this.updateSelectedOptions();
        }

        if (fileFieldValues !== prevFileFieldValues) {
            this.updateSelectedOptions();
        }
    }

    stopLoading() {
        this.setState({ isLoading: false });
    }

    updateSelectedOptionsArray() {
        const { getSelectedCustomizableOptions } = this.props;
        const { selectedCheckboxValues } = this.state;
        getSelectedCustomizableOptions(selectedCheckboxValues, true);
    }

    updateSelectedOptions() {
        const { getSelectedCustomizableOptions } = this.props;
        const {
            selectedDropdownOptions,
            textFieldValues,
            fileFieldValues
        } = this.state;
        const customizableOptions = [];

        customizableOptions.push(
            ...customizableOptions,
            ...textFieldValues,
            ...selectedDropdownOptions,
            ...fileFieldValues
        );

        getSelectedCustomizableOptions(customizableOptions);
    }

    setCustomizableOptionTextFieldValue(option_id, option_value) {
        const { textFieldValues } = this.state;

        if (!option_value) {
            const filteredOptions = textFieldValues.filter((item) => item.option_id !== option_id);

            return this.setState({ textFieldValues: filteredOptions });
        }

        const textFieldValue = { option_id, option_value };

        if (textFieldValues.some(({ option_id: val }) => option_id === val)) {
            const filteredItems = textFieldValues.filter((value) => value.option_id !== option_id);

            return this.setState({ textFieldValues: filteredItems.concat(textFieldValue) });
        }

        return this.setState({ textFieldValues: [...textFieldValues, textFieldValue] });
    }

    setCustomizableOptionFileFieldValue(value, option, filename) {
        const { option_id } = option;

        return this.setState({ fileFieldValues: [{ option_id, option_value: value, option_filename: filename }] });
    }

    setSelectedDropdownValue(value, option) {
        const { selectedDropdownOptions } = this.state;
        const { option_id } = option;

        if (!value) {
            const filteredOptions = selectedDropdownOptions.filter((item) => item.option_id !== option_id);

            return this.setState({ selectedDropdownOptions: filteredOptions });
        }

        const optionData = { option_id, option_value: value };

        if (selectedDropdownOptions.some(({ option_id: val }) => option_id === val)) {
            const filteredItems = selectedDropdownOptions.filter((value) => value.option_id !== option_id);

            return this.setState({ selectedDropdownOptions: filteredItems.concat(optionData) });
        }

        return this.setState({
            selectedDropdownOptions:
                [...selectedDropdownOptions, optionData]
        });
    }

    setSelectedCheckboxValues(option_id, option_value) {
        const { selectedCheckboxValues } = this.state;
        const selectedValue = { option_id, option_value };

        if (selectedCheckboxValues.some(({ option_value: val }) => option_value === val)) {
            this.setState({
                selectedCheckboxValues: selectedCheckboxValues.filter(
                    (value) => value.option_value !== option_value
                ) || []
            });

            return;
        }

        this.setState({
            selectedCheckboxValues: [...selectedCheckboxValues, selectedValue]
        });
    }

    render() {
        return (
            <ProductCustomizableOptions
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default ProductCustomizableOptionsContainer;
