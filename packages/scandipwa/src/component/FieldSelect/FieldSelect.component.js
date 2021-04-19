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

import ClickOutside from 'Component/ClickOutside';

import './FieldSelect.style';

/** @namespace Component/FieldSelect/Component */
export class FieldSelect extends PureComponent {
    static propTypes = {
        handleSelectListOptionClick: PropTypes.func.isRequired,
        handleSelectExpand: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        handleSelectListKeyPress: PropTypes.func.isRequired,
        handleSelectExpandedExpand: PropTypes.func.isRequired,
        isSelectExpanded: PropTypes.bool.isRequired,
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
        })).isRequired,
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        formRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) })
        ]),
        placeholder: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool
        ]),
        autocomplete: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),
        isDisabled: PropTypes.bool,
        skipValue: PropTypes.bool
    };

    static defaultProps = {
        formRef: () => {},
        placeholder: '',
        value: null,
        isDisabled: false,
        autocomplete: 'off',
        skipValue: false
    };

    renderNativeSelect() {
        const {
            name,
            id,
            onChange,
            selectOptions,
            formRef,
            value,
            isDisabled,
            isSelectExpanded: isExpanded,
            autocomplete,
            skipValue
        } = this.props;

        return (
            <select
              block="FieldSelect"
              elem="Select"
              autoComplete={ autocomplete }
              mods={ { isExpanded } }
              ref={ formRef }
              name={ name }
              id={ id }
              disabled={ isDisabled }
              value={ value || '' }
              onChange={ onChange }
              data-skip-value={ skipValue }
              aria-label={ __('Select drop-down') }
            >
                { this.renderPlaceholder() }
                { selectOptions.map(this.renderNativeOption) }
            </select>
        );
    }

    renderNativeOption = (option) => {
        const {
            id,
            value,
            disabled,
            label
        } = option;

        return (
            <option
              key={ id }
              id={ id }
              value={ value }
              disabled={ disabled }
            >
                { label }
            </option>
        );
    };

    renderPlaceholder() {
        const { placeholder } = this.props;

        if (!placeholder) {
            return null;
        }

        return (
            <option value="" label={ placeholder } />
        );
    }

    renderOption = (option) => {
        const {
            id,
            label
        } = option;

        const {
            isSelectExpanded: isExpanded,
            handleSelectListOptionClick
        } = this.props;

        return (
            <li
              block="FieldSelect"
              elem="Option"
              mods={ { isExpanded } }
              key={ id }
              /**
               * Added 'o' as querySelector does not work with
               * ids, that consist of numbers only
               */
              id={ `o${id}` }
              role="menuitem"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={ () => handleSelectListOptionClick(option) }
              // eslint-disable-next-line react/jsx-no-bind
              onKeyPress={ () => handleSelectListOptionClick(option) }
              tabIndex={ isExpanded ? '0' : '-1' }
            >
                { label }
            </li>
        );
    };

    renderOptions() {
        const {
            selectOptions,
            isSelectExpanded: isExpanded
        } = this.props;

        return (
            <ul
              block="FieldSelect"
              elem="Options"
              role="menu"
              mods={ { isExpanded } }
            >
                { selectOptions.map(this.renderOption) }
            </ul>
        );
    }

    render() {
        const {
            isSelectExpanded: isExpanded,
            handleSelectExpand,
            handleSelectListKeyPress,
            handleSelectExpandedExpand
        } = this.props;

        return (
            <ClickOutside onClick={ handleSelectExpandedExpand }>
                { /* eslint-disable-next-line jsx-a11y/interactive-supports-focus */ }
                <div
                  block="FieldSelect"
                  onClick={ handleSelectExpand }
                  onKeyPress={ handleSelectListKeyPress }
                  role="button"
                  aria-label="Select drop-down"
                  aria-expanded={ isExpanded }
                >
                    { this.renderNativeSelect() }
                    { this.renderOptions() }
                </div>
            </ClickOutside>
        );
    }
}

export default FieldSelect;
