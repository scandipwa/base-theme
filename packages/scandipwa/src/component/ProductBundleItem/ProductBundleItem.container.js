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
import { connect } from 'react-redux';

import { PRICE_TYPE_PERCENT } from 'Component/ProductBundleItem/ProductBundleItem.config';
import {
    mapDispatchToProps,
    mapStateToProps,
    ProductCustomizableOptionContainer
} from 'Component/ProductCustomizableOption/ProductCustomizableOption.container';

import ProductBundleItem from './ProductBundleItem.component';

/** @namespace Component/ProductBundleItem/Container */
export class ProductBundleItemContainer extends ProductCustomizableOptionContainer {
    static propTypes = {
        ...ProductCustomizableOptionContainer.propTypes,
        setCustomizableOptionTextFieldValue: PropTypes.func,
        updateQuantity: PropTypes.func.isRequired
    };

    static defaultProps = {
        ...ProductCustomizableOptionContainer.defaultProps,
        setCustomizableOptionTextFieldValue: () => {}
    };

    containerFunctions = {
        ...this.containerFunctions,
        setDropdownItemQuantity: this.setDropdownItemQuantity.bind(this)
    };

    componentDidMount() {
        this.getDefaultValues();
    }

    getDefaultValues() {
        const { optionType } = this.containerProps();

        switch (optionType) {
        case 'select':
        case 'radio': // handle radio as select
            this.setDefaultDropdownValue();
            break;
        case 'checkbox':
        case 'multi': // handle multi-select as checkbox
            this.setDefaultCheckboxValue();
            break;
        default:
            return null;
        }

        return null;
    }

    setDefaultDropdownValue() {
        const {
            setSelectedDropdownValue,
            option: { option_id, options }
        } = this.props;

        return options.reduce((acc, { is_default, id, quantity }) => {
            if (is_default) {
                const value = id.toString();
                setSelectedDropdownValue(option_id, { value, quantity });
                this.setState({ selectedDropdownValue: id });
            }

            return acc;
        }, []);
    }

    setDefaultCheckboxValue() {
        const { option: { option_id, options }, setSelectedCheckboxValues } = this.props;

        return options.reduce((acc, { is_default, id, quantity }) => {
            if (is_default) {
                const value = id.toString();
                setSelectedCheckboxValues(option_id, { value, quantity });
            }

            return acc;
        }, []);
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

        const isRequiredSelected = selectedItems.reduce((acc, { id }) => {
            if (isRequired[0] === id) {
                acc.push(id);
            }

            return acc;
        }, []);

        return !!isRequiredSelected.length;
    }

    getSelectedCheckboxValue(value) {
        const {
            option: { option_id },
            setSelectedCheckboxValues
        } = this.props;
        const selectedValue = this.getSelectedOptionData(value);

        setSelectedCheckboxValues(option_id, selectedValue);
    }

    setDropdownItemQuantity(quantity) {
        const { setSelectedDropdownValue, option: { option_id } } = this.props;
        const { selectedDropdownValue } = this.state;
        const value = selectedDropdownValue.toString();
        const selectedValue = { value, quantity };

        setSelectedDropdownValue(option_id, selectedValue);
    }

    setDropdownValue(value) {
        const { setSelectedDropdownValue, option, option: { option_id } } = this.props;
        const { selectedDropdownValue } = this.state;

        if (selectedDropdownValue === value) {
            setSelectedDropdownValue(null, option);
            this.setState({ selectedDropdownValue: 0 });
        } else {
            this.setState({ selectedDropdownValue: parseInt(value, 10) });
            const selectedValue = this.getSelectedOptionData(value.toString());
            setSelectedDropdownValue(option_id, selectedValue);
        }
    }

    getSelectedOptionData(optionId) {
        const { option: { options } } = this.props;

        return options.reduce(
            (parameters, { id, quantity }) => {
                const value = id.toString();

                if (optionId === value) {
                    return { value, quantity };
                }

                return parameters;
            }, {}
        );
    }

    getDropdownOptions(values) {
        const {
            currencyCode
        } = this.props;

        return values.reduce((acc, {
            id,
            label,
            price_type,
            quantity,
            can_change_quantity,
            finalOptionPrice,
            price,
            position
        }) => {
            const finalPrice = price_type === PRICE_TYPE_PERCENT ? price : finalOptionPrice;

            const dropdownLabel = !can_change_quantity
                ? `${ quantity } x ${ label } + ${ this.renderOptionLabel(price_type, finalPrice, currencyCode) }`
                : `${ label } + ${ this.renderOptionLabel(price_type, finalPrice, currencyCode) }`;

            acc.push({
                id,
                name: label,
                value: id,
                label: dropdownLabel,
                sort_order: position
            });

            return acc;
        }, []);
    }

    render() {
        return (
            <ProductBundleItem
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductBundleItemContainer);
