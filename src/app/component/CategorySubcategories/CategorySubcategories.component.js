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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './CategorySubcategories.style';

class CategorySubcategories extends PureComponent {
    static propTypes = {
        handleCategoryClick: PropTypes.func.isRequired,
        option: PropTypes.shape({
            value_string: PropTypes.string,
            label: PropTypes.string
        }).isRequired
    };

    render() {
        const {
            handleCategoryClick,
            option: {
                value_string,
                label
            }
        } = this.props;

        return (
            <a
              href={ value_string }
              block="ProductAttributeValue"
              mix={ { block: 'CategorySubcategories' } }
              onClick={ handleCategoryClick }
            >
                <span
                  title="EU 36"
                  block="ProductAttributeValue"
                  elem="Text"
                  mix={ {
                      block: 'CategorySubcategories',
                      elem: 'Label'
                  } }
                >
                    { label }
                </span>
            </a>
        );
    }
}

export default CategorySubcategories;
