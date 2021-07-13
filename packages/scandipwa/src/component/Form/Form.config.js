/* eslint-disable max-len */

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

export const MIN_PASSWORD_LENGTH = 8;

/** @namespace Component/Form/Config/validateEmail */
export const validateEmail = ({ value }) => value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);

/** @namespace Component/Form/Config/validateEmails */
export const validateEmails = ({ value }) => value.split(',').every((email) => validateEmail({ value: email.trim() }));

/** @namespace Component/Form/Config/validatePassword */
export const validatePassword = ({ value }) => value.length >= MIN_PASSWORD_LENGTH;

/** @namespace Component/Form/Config/validateTelephone */
export const validateTelephone = ({ value }) => value.length > 0 && value.match(/^\+?(?:[0-9-] ?){6,14}[0-9]$/);

/** @namespace Component/Form/Config/isNotEmpty */
export const isNotEmpty = ({ value }) => value.trim().length > 0;

/** @namespace Component/Form/Config/validatePasswordMatch */
export const validatePasswordMatch = ({ value }, { password }) => {
    const { current: { value: passwordValue } } = password || { current: {} };

    return value === passwordValue;
};

/** @namespace Component/Form/Config */
export const formConfig = () => ({
    email: {
        validate: validateEmail,
        message: __('Email is invalid.')
    },
    emails: {
        validate: validateEmails,
        message: __('Email addresses are not valid')
    },
    password: {
        validate: validatePassword,
        message: __('Password should be at least 8 characters long')
    },
    telephone: {
        validate: validateTelephone,
        message: __('Phone number is invalid!')
    },
    notEmpty: {
        validate: isNotEmpty,
        message: __('This field is required!')
    },
    password_match: {
        validate: validatePasswordMatch,
        message: __('Password does not match.')
    }
});

export default formConfig();
