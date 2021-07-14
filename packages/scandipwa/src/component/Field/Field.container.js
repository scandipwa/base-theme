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

import validationConfig from 'Component/Form/Form.config';

import Field from './Field.component';
import {
    CHECKBOX_TYPE,
    ENTER_KEY_CODE,
    FILE_TYPE,
    NUMBER_TYPE,
    PASSWORD_TYPE,
    RADIO_TYPE,
    SELECT_TYPE,
    TEXT_TYPE,
    TEXTAREA_TYPE
} from './Field.config';

/** @namespace Component/Field/Container */
export class FieldContainer extends PureComponent {
    static propTypes = {
        isControlled: PropTypes.bool,
        checked: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool
        ]),
        type: PropTypes.oneOf([
            TEXT_TYPE,
            NUMBER_TYPE,
            TEXTAREA_TYPE,
            PASSWORD_TYPE,
            RADIO_TYPE,
            CHECKBOX_TYPE,
            SELECT_TYPE,
            FILE_TYPE
        ]).isRequired,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onClick: PropTypes.func,
        onKeyPress: PropTypes.func,
        min: PropTypes.number,
        max: PropTypes.number,
        validation: PropTypes.arrayOf(PropTypes.string),
        message: PropTypes.string,
        customValidationStatus: PropTypes.bool,
        id: PropTypes.string,
        formRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({ current: PropTypes.instanceOf(Element) })
        ]),
        formRefMap: PropTypes.object,
        validateSeparately: PropTypes.bool,
        isSubmitted: PropTypes.bool,
        disabled: PropTypes.bool
    };

    static defaultProps = {
        min: 1,
        max: 99,
        checked: false,
        value: null,
        onChange: () => {},
        onFocus: () => {},
        onBlur: () => {},
        onClick: () => {},
        onKeyPress: () => {},
        formRef: () => {},
        isControlled: false,
        validation: [],
        message: '',
        customValidationStatus: null,
        id: '',
        formRefMap: {},
        validateSeparately: false,
        isSubmitted: false,
        disabled: false
    };

    containerFunctions = {
        onChange: this.onChange.bind(this),
        handleChange: this.handleChange.bind(this),
        onChangeCheckbox: this.onChangeCheckbox.bind(this),
        onFocus: this.onFocus.bind(this),
        onKeyPress: this.onKeyPress.bind(this),
        onKeyEnterDown: this.onKeyEnterDown.bind(this),
        onClick: this.onClick.bind(this)
    };

    __construct(props) {
        super.__construct(props);

        const { checked } = props;
        const value = this.getInitialPropsValue();

        this.state = {
            value,
            checked,
            validationMessage: '',
            validationStatus: null,
            eventId: ''
        };
    }

    componentDidUpdate(prevProps) {
        const { value: prevValue, checked: prevChecked, isSubmitted: prevSubmitted } = prevProps;
        const {
            value: currentValue,
            checked: currChecked,
            type,
            id,
            validateSeparately,
            isSubmitted
        } = this.props;
        const { eventId } = this.state;

        if (prevValue !== currentValue) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ value: currentValue });
        }
        if (type === CHECKBOX_TYPE && currChecked !== prevChecked) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ checked: currChecked });
        }

        // prevents validating all fields when entering data in only one of them
        if (eventId === id || prevSubmitted !== isSubmitted || !validateSeparately) {
            this.updateValidationStatus();
            this.setValidationMessage(prevProps);
        }
    }

    setValidationMessage(prevProps) {
        const { message: prevMessage = {} } = prevProps;
        const { message = {} } = this.props;
        const { validationMessage = {} } = this.state;

        if (message !== validationMessage && !prevMessage && message) {
            this.setState({ validationMessage: message });
        }
    }

    getInitialPropsValue() {
        const { type, value } = this.props;

        if (value) {
            return value;
        }

        switch (type) {
        case NUMBER_TYPE:
            return 0;
        case CHECKBOX_TYPE:
            return false;
        default:
            return '';
        }
    }

    containerProps = () => {
        const {
            checked: propsChecked,
            customValidationStatus,
            disabled
        } = this.props;

        const {
            type,
            checked,
            value,
            validationStatus,
            validationMessage,
            filename
        } = this.state;

        return {
            checked: type === CHECKBOX_TYPE ? propsChecked : checked,
            value,
            validationStatus: customValidationStatus ?? validationStatus,
            message: validationMessage,
            filename,
            disabled
        };
    };

    validateField() {
        const {
            validation,
            id,
            formRef: refMap,
            formRefMap
        } = this.props;

        if (!validation || !id || !refMap || !refMap.current) {
            return {};
        }

        const { current: inputNode } = refMap || {};

        if (!inputNode) {
            return {};
        }

        // we are looking for validation and executing it
        const rule = validation.find((rule) => {
            if (!validationConfig[rule]) {
                return false;
            }

            const validationRules = validationConfig[rule];
            const isValid = validationRules.validate(inputNode, formRefMap);

            return !isValid;
        });

        return validationConfig[rule] || {};
    }

    updateValidationStatus() {
        const validationRule = this.validateField();

        this.setState({
            validationStatus: !validationRule.validate,
            validationMessage: validationRule.message
        });
    }

    onChange(event) {
        const { type } = this.props;
        this.setState({ eventId: event?.target?.name });

        if (typeof event === 'string' || typeof event === 'number') {
            return this.handleChange(event);
        }

        if (event.currentTarget.value.length <= 0) {
            this.setState({
                validationStatus: null
            });
        }

        this.updateValidationStatus();

        if (type === FILE_TYPE) {
            return this.handleChange(event.target.value, false, event.target.files[0]);
        }

        return this.handleChange(event.target.value);
    }

    onChangeCheckbox(event) {
        const { onChange } = this.props;
        const { target: { checked, value } } = event;

        if (onChange) {
            onChange(value, checked);
        }

        this.setState({ checked });
    }

    onFocus(event) {
        const { onFocus } = this.props;

        if (onFocus) {
            onFocus(event);
        }
    }

    onBlur(event) {
        const { onBlur } = this.props;

        if (onBlur) {
            onBlur(event);
        }
    }

    onKeyPress(event) {
        const { onKeyPress } = this.props;

        if (onKeyPress) {
            onKeyPress(event);
        }
    }

    onKeyEnterDown(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            const value = event.target.value || 1;
            this.handleChange(value);
        }
    }

    onClick(event, selectValue = false) {
        const { onClick } = this.props;

        if (selectValue) {
            event.target.select();
        }
        if (onClick) {
            onClick(event);
        }
    }

    handleChange(value, shouldUpdate = true, fileValue = false) {
        const {
            isControlled,
            onChange,
            type,
            min,
            max
        } = this.props;

        switch (type) {
        case NUMBER_TYPE:
            const isValueNaN = Number.isNaN(parseInt(value, 10));
            if (min > value || value > max || isValueNaN) {
                break;
            }
            if (onChange && shouldUpdate) {
                onChange(value);
            }
            if (!isControlled) {
                this.setState({ value });
            }
            break;
        case FILE_TYPE:
            if (value) {
                const result = onChange && onChange(fileValue);

                this.setState({
                    value: result ? value : '',
                    filename: result ? value.substr(value.lastIndexOf('\\') + 1) : ''
                });
            }

            break;
        default:
            if (onChange) {
                onChange(value);
            }
            if (!isControlled) {
                this.setState({ value });
            }
        }
    }

    render() {
        const { customValidationStatus, ...otherProps } = this.props;

        return (
            <Field
              { ...otherProps }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default FieldContainer;
