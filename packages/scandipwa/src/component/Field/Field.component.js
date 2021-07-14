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
/* eslint-disable react/jsx-no-bind */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import FieldInput from 'Component/FieldInput';
import FieldSelect from 'Component/FieldSelect';
import FieldTextarea from 'Component/FieldTextarea';
import Image from 'Component/Image';
import add from 'Style/icons/add.svg';
import minus from 'Style/icons/minus.svg';
import { MixType } from 'Type/Common';

import {
    CHECKBOX_TYPE,
    EMAIL_TYPE,
    FILE_TYPE,
    NUMBER_TYPE,
    PASSWORD_TYPE,
    RADIO_TYPE,
    SELECT_TYPE,
    TEXTAREA_TYPE
} from './Field.config';
import upload from './icons/upload.svg';

import './Field.style';

/**
 * Input fields component
 * @class Field
 * @namespace Component/Field/Component
 */
export class Field extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        handleChange: PropTypes.func.isRequired,
        onChangeCheckbox: PropTypes.func.isRequired,
        onFocus: PropTypes.func.isRequired,
        onKeyPress: PropTypes.func.isRequired,
        onKeyEnterDown: PropTypes.func.isRequired,
        onClick: PropTypes.func.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        message: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool
        ]),
        validation: PropTypes.arrayOf(PropTypes.string).isRequired,
        validationStatus: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        checked: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        mix: MixType,
        min: PropTypes.number,
        max: PropTypes.number,
        filename: PropTypes.string,
        fileExtensions: PropTypes.string,
        subLabel: PropTypes.number,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        min: 1,
        max: 99,
        checked: false,
        mix: {},
        label: '',
        value: null,
        message: '',
        validationStatus: null,
        filename: '',
        fileExtensions: '',
        subLabel: null,
        disabled: false
    };

    renderTextarea() {
        return (
            <FieldTextarea
              { ...this.props }
            />
        );
    }

    /**
     * Render Type Text, default value is passed from parent
     * handleToUpdate used to pass child data to parent
     */
    renderTypeText() {
        return (
            <FieldInput
              { ...this.props }
              type="text"
            />
        );
    }

    renderTypeEmail() {
        return (
            <FieldInput
              { ...this.props }
              type="email"
            />
        );
    }

    renderTypePassword() {
        return (
            <FieldInput
              { ...this.props }
              type="password"
            />
        );
    }

    renderTypeNumber() {
        const {
            min,
            max,
            value,
            onKeyEnterDown,
            handleChange
        } = this.props;

        return (
            <>
                <FieldInput
                  { ...this.props }
                  type="number"
                  readOnly
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={ (e) => handleChange(e.target.value, false) }
                  onKeyDown={ onKeyEnterDown }
                  aria-label={ __('Value') }
                />
                <button
                  disabled={ +value === max }
                  // eslint-disable-next-line react/jsx-no-bind
                  onClick={ () => handleChange(+value + 1) }
                  aria-label={ __('Add') }
                >
                    <Image src={ add } alt="add" mix={ { block: 'AddButton' } } />
                </button>
                <button
                  disabled={ +value === min }
                  // eslint-disable-next-line react/jsx-no-bind
                  onClick={ () => handleChange(+value - 1) }
                  aria-label={ __('Subtract') }
                >
                    <Image src={ minus } alt="subtract" mix={ { block: 'SubtractButton' } } />
                </button>
            </>
        );
    }

    renderCheckbox() {
        const {
            id,
            onChangeCheckbox,
            label,
            subLabel,
            disabled
        } = this.props;

        return (
            <label htmlFor={ id } block="Field" elem="CheckboxLabel">
                <FieldInput
                  { ...this.props }
                  type="checkbox"
                  onChange={ onChangeCheckbox }
                  isDisabled={ disabled }
                />
                <div block="input-control" />
                <span>
                    { label }
                    { subLabel && (
                        <strong block="Field" elem="SubLabel">
                        { ` (${subLabel})` }
                        </strong>
                    ) }
                </span>
            </label>
        );
    }

    renderFile() {
        const {
            filename,
            id,
            onChange,
            fileExtensions
        } = this.props;

        return (
            <>
                <FieldInput
                  { ...this.props }
                  type="file"
                  onChange={ onChange }
                />
                { this.renderLabelForFile(id, filename) }
                <p>
                    { __('Compatible file extensions to upload: ') }
                    <b>{ fileExtensions }</b>
                </p>
            </>
        );
    }

    renderRadioButton() {
        const {
            id,
            label,
            onClick
        } = this.props;

        return (
            <label htmlFor={ id }>
                <FieldInput
                  { ...this.props }
                  type="radio"
                  onChange={ onClick }
                />
                <div block="input-control" />
                { label }
            </label>
        );
    }

    renderSelectWithOptions() {
        return (
            <FieldSelect
              { ...this.props }
            />
        );
    }

    renderInputOfType(type) {
        switch (type) {
        case CHECKBOX_TYPE:
            return this.renderCheckbox();
        case RADIO_TYPE:
            return this.renderRadioButton();
        case NUMBER_TYPE:
            return this.renderTypeNumber();
        case TEXTAREA_TYPE:
            return this.renderTextarea();
        case PASSWORD_TYPE:
            return this.renderTypePassword();
        case SELECT_TYPE:
            return this.renderSelectWithOptions();
        case EMAIL_TYPE:
            return this.renderTypeEmail();
        case FILE_TYPE:
            return this.renderFile();
        default:
            return this.renderTypeText();
        }
    }

    renderLabelForFile(id, filename = '') {
        if (filename) {
            return (
                <label htmlFor={ id }>
                    <p>{ filename }</p>
                </label>
            );
        }

        return (
            <label htmlFor={ id }>
                <Image src={ upload } alt="Upload icon" ratio="square" height="50px" />
                <p>{ __('Drop files here or') }</p>
                <span>{ __('Select files') }</span>
            </label>
        );
    }

    renderLabel() {
        const {
            id,
            label,
            validation,
            type
        } = this.props;
        const isRequired = validation.includes('notEmpty');
        const noRenderLabel = type === CHECKBOX_TYPE || type === RADIO_TYPE;

        if (!label || noRenderLabel) {
            return null;
        }

        return (
            <label
              block="Field"
              elem="Label"
              mods={ { isRequired } }
              htmlFor={ id }
            >
                { label }
            </label>
        );
    }

    renderMessage() {
        const { message } = this.props;

        if (!message) {
            return null;
        }

        return (
            <p block="Field" elem="Message">
                { message }
            </p>
        );
    }

    render() {
        const {
            mix,
            type,
            message,
            validationStatus
        } = this.props;

        return (
            <div
              block="Field"
              mods={ {
                  type,
                  hasError: validationStatus === false || !!message,
                  isValid: validationStatus === true
              } }
              mix={ mix }
            >
                { this.renderLabel() }
                { this.renderInputOfType(type) }
                { this.renderMessage() }
            </div>
        );
    }
}

export default Field;
