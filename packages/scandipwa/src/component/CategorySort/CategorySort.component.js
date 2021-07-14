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

import Field from 'Component/Field';
import TextPlaceholder from 'Component/TextPlaceholder';

import './CategorySort.style';

/**
 * Product Sort
 * @class CategorySort
 * @namespace Component/CategorySort/Component
 */
export class CategorySort extends PureComponent {
    static propTypes = {
        onSortChange: PropTypes.func.isRequired,
        sortKey: PropTypes.string.isRequired,
        sortDirection: PropTypes.string.isRequired,
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
            label: PropTypes.string
        })).isRequired,
        isMatchingInfoFilter: PropTypes.bool
    };

    static defaultProps = {
        isMatchingInfoFilter: false
    };

    onChange = (value) => {
        const { onSortChange } = this.props;
        const [direction, ...key] = value.split(' ');

        onSortChange(direction, key);
    };

    renderPlaceholder() {
        return (
            <p block="CategorySort" elem="Placeholder">
                <TextPlaceholder length="short" />
            </p>
        );
    }

    renderSortField() {
        const {
            sortKey,
            sortDirection,
            selectOptions,
            isMatchingInfoFilter
        } = this.props;

        if (!isMatchingInfoFilter) {
            return this.renderPlaceholder();
        }

        return (
            <Field
              id="category-sort"
              name="category-sort"
              type="select"
              label={ __('SORT') }
              mix={ { block: 'CategorySort', elem: 'Select' } }
              selectOptions={ selectOptions }
              value={ `${sortDirection} ${sortKey}` }
              onChange={ this.onChange }
            />
        );
    }

    render() {
        return (
            <div block="CategorySort">
                { this.renderSortField() }
            </div>
        );
    }
}

export default CategorySort;
