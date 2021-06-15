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

import { ENTER_KEY_CODE } from 'Component/Field/Field.config';
import { sortAlphabetically, sortBySortOrder } from 'Util/Product';

import FieldSelect from './FieldSelect.component';
import {
    A_KEY_CODE,
    a_KEY_CODE,
    Z_KEY_CODE,
    z_KEY_CODE
} from './FieldSelect.config';

/** @namespace Component/FieldSelect/Container */
export class FieldSelectContainer extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        selectOptions: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]),
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]),
            disabled: PropTypes.bool,
            label: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
        })),
        formRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) })
        ]),
        onChange: PropTypes.func
    };

    static defaultProps = {
        selectOptions: [],
        formRef: () => {},
        onChange: () => {}
    };

    state = {
        valueIndex: -1,
        searchString: 'a',
        isSelectExpanded: false
    };

    containerFunctions = {
        handleSelectExpand: this.handleSelectExpand.bind(this),
        handleSelectExpandedExpand: this.handleSelectExpandedExpand.bind(this),
        handleSelectListOptionClick: this.handleSelectListOptionClick.bind(this),
        handleSelectListKeyPress: this.handleSelectListKeyPress.bind(this)
    };

    containerProps = () => {
        const {
            valueIndex,
            searchString,
            isSelectExpanded
        } = this.state;

        return {
            selectOptions: this.sortSelectOptions(),
            isDisabled: this.isSelectDisabled(),
            valueIndex,
            searchString,
            isSelectExpanded
        };
    };

    sortSelectOptions() {
        const { selectOptions } = this.props;

        /**
         * Trim all null label values.
         * If options have `sort_order` property, sort by sort order.
         * Otherwise sort alphabetically.
         */
        const options = selectOptions.reduce((acc, a) => (a.label ? [...acc, a] : acc), []);
        const sortedOptions = options.every((option) => option.sort_order)
            ? sortBySortOrder(options)
            : sortAlphabetically(options, 'label');

        return sortedOptions;
    }

    isSelectDisabled() {
        const { selectOptions } = this.props;
        return selectOptions.length === 0;
    }

    handleSelectExpand() {
        if (!this.isSelectDisabled()) {
            this.setState(({ isSelectExpanded }) => ({ isSelectExpanded: !isSelectExpanded }));
        }
    }

    handleSelectExpandedExpand() {
        const { isSelectExpanded } = this.state;

        if (isSelectExpanded) {
            this.handleSelectExpand();
        }
    }

    handleSelectListOptionClick({ value }) {
        const { formRef, onChange } = this.props;

        if (typeof formRef !== 'function') {
            formRef.current.value = value;

            // TODO: investigate why this is required
            const event = new Event('change', { bubbles: true });
            formRef.current.dispatchEvent(event);
        } else {
            onChange(value);
        }
    }

    _getSelectedValueIndex(keyCode) {
        const { selectOptions } = this.props;
        const {
            searchString: prevSearchString,
            valueIndex: prevValueIndex
        } = this.state;

        const pressedKeyValue = String.fromCharCode(keyCode).toLowerCase();

        const searchString = (prevSearchString[prevSearchString.length - 1] !== pressedKeyValue)
            ? `${prevSearchString}${pressedKeyValue}`
            : pressedKeyValue;

        const nextValueIndex = selectOptions.findIndex(({ label }, i) => (
            label && label.toLowerCase().startsWith(searchString) && (
                i > prevValueIndex || prevSearchString !== searchString
            )
        ));

        if (nextValueIndex !== -1) {
            return { searchString, valueIndex: nextValueIndex };
        }

        // if no items were found, take only the latest letter of the search string
        const newSearchString = searchString[searchString.length - 1];

        const newValueIndex = selectOptions.findIndex(({ label }) => (
            label && label.toLowerCase().startsWith(newSearchString)
        ));

        if (newValueIndex !== -1) {
            return { searchString: newSearchString, valueIndex: newValueIndex };
        }

        // if there are no items starting with this letter
        return {};
    }

    handleSelectListKeyPress(event) {
        const { isSelectExpanded } = this.state;
        const { selectOptions, onChange, id: selectId } = this.props;
        const keyCode = event.which || event.keycode;

        // on Enter pressed
        if (keyCode === ENTER_KEY_CODE) {
            this.handleSelectExpand();
            return;
        }

        if (!isSelectExpanded
            || !keyCode
            || keyCode < A_KEY_CODE
            || keyCode > z_KEY_CODE
            || (keyCode > Z_KEY_CODE && keyCode < a_KEY_CODE)
        ) {
            return;
        }

        const { searchString, valueIndex } = this._getSelectedValueIndex(keyCode);

        // valueIndex can be 0, so !valueIndex === true
        if (!searchString || valueIndex === null) {
            return;
        }

        this.setState({ searchString, valueIndex }, () => {
            const { id, value } = selectOptions[valueIndex];
            // converting to string for avoiding the error with the first select option
            onChange(value.toString());
            const selectedElement = document.querySelector(`#${selectId} + ul #o${id}`);
            selectedElement.focus();
        });
    }

    render() {
        const { selectOptions } = this.containerProps();

        if (!selectOptions) {
            throw new Error('Prop `selectOptions` is required for Field type `select`');
        }

        return (
            <FieldSelect
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default FieldSelectContainer;
