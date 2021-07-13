/* eslint-disable react/jsx-no-bind */
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

import { getFiltersCount } from 'Util/Category';

import './ResetAttributes.style';

/** @namespace Component/ResetButton/Component */
export class ResetAttributes extends PureComponent {
    static propTypes = {
        toggleCustomFilter: PropTypes.func.isRequired,
        filtersData: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            attribute_code: PropTypes.string.isRequired
        }))).isRequired
    };

    renderSelectedOption(selectedOption) {
        const { toggleCustomFilter } = this.props;
        const { attribute_code, attribute_label, value_string } = selectedOption;
        const onRemove = () => toggleCustomFilter(attribute_code, value_string);

        return (
            <div block="ResetAttributes" elem="AttributeValue" key={ value_string }>
                <div
                  block="ResetAttributes"
                  elem="CloseIcon"
                  role="button"
                  tabIndex="0"
                  onKeyDown={ onRemove }
                  onClick={ onRemove }
                  aria-label={ __('Close') }
                />
                <div block="ResetAttributes" elem="AttributeText">
                    { `${attribute_label}: ${selectedOption.label}` }
                </div>
            </div>
        );
    }

    renderResetItem(title, selectedOptions) {
        return (
            <div key={ title }>
                { selectedOptions.map((o) => this.renderSelectedOption(o)) }
            </div>
        );
    }

    renderDesktopTitle() {
        return (
            <h3 block="ResetAttributes" elem="Title">
                { __('Now shopping by:') }
            </h3>
        );
    }

    renderMobileTitle() {
        const { filtersData = {} } = this.props;

        const count = getFiltersCount(filtersData);

        return (
            <div block="ResetAttributes" elem="MobileTitle">
                { count === 1 ? __('1 filter selected') : getFiltersCount(filtersData) + __(' filters selected') }
            </div>
        );
    }

    render() {
        const { filtersData = {} } = this.props;

        if (!Object.keys(filtersData).length) {
            return null;
        }

        return (
            <>
                { this.renderDesktopTitle() }
                { this.renderMobileTitle() }
                <div block="ResetAttributes">
                    { Object.entries(filtersData).map(
                        ([attrName, attrData]) => this.renderResetItem(attrName, attrData)
                    ) }
                </div>
            </>
        );
    }
}

export default ResetAttributes;
