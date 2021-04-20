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

import Field from 'Component/Field/Field.container';

import './CategoryProductPerPage.style';

/** @namespace Component/CategoryProductPerPage/Component */
export class CategoryProductPerPageComponent extends PureComponent {
    static propTypes = {
        defaultListProductCount: PropTypes.string.isRequired,
        defaultGridProductCount: PropTypes.string.isRequired,
        gridCountOptions: PropTypes.string.isRequired,
        listCountOptions: PropTypes.string.isRequired,
        plpType: PropTypes.string.isRequired,
        handleChange: PropTypes.func.isRequired
    };

    render() {
        const {
            defaultListProductCount,
            defaultGridProductCount,
            gridCountOptions,
            handleChange,
            listCountOptions,
            plpType
        } = this.props;

        return (
            <div block="CategoryProductPerPage">
                { __('Show') }
                <Field
                  id="CategoryProductPerPage"
                  name="CategoryProductPerPage"
                  type="select"
                  selectOptions={ plpType === 'grid' ? gridCountOptions : listCountOptions }
                  value={ plpType === 'grid' ? defaultGridProductCount : defaultListProductCount }
                  onChange={ handleChange }
                />
                { __('per page') }
            </div>
        );
    }
}

export default CategoryProductPerPageComponent;
