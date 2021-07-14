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

import { MixType } from 'Type/Common';

import './ResetButton.style';

/** @namespace Component/ResetButton/Component */
export class ResetButton extends PureComponent {
    static propTypes = {
        mix: MixType,
        resetFilters: PropTypes.func.isRequired,
        onClick: PropTypes.func.isRequired,
        isContentFiltered: PropTypes.bool.isRequired
    };

    static defaultProps = {
        mix: {}
    };

    onClick = () => {
        const { onClick, resetFilters } = this.props;

        onClick();
        resetFilters();
    };

    render() {
        const { mix, isContentFiltered } = this.props;

        if (!isContentFiltered) {
            return null;
        }

        return (
            <div
              block="ResetButton"
              mix={ mix }
            >
                <button
                  onClick={ this.onClick }
                  block="ResetButton"
                  elem="Button"
                  mix={ {
                      block: 'Button',
                      mods: { isHollow: true }
                  } }
                >
                    { __('Reset all') }
                </button>
            </div>
        );
    }
}

export default ResetButton;
