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
import debounceRender from 'react-debounce-render';

import { RENDER_PAGE_FREQUENCY } from 'Component/ProductList/ProductList.config';
import TextPlaceholder from 'Component/TextPlaceholder';

export class CategoryItemsCount extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        isOnlyPlaceholder: PropTypes.bool.isRequired,
        totalItems: PropTypes.number.isRequired
    };

    render() {
        const {
            isLoading: isProductsLoading,
            isOnlyPlaceholder,
            totalItems
        } = this.props;

        const isLoading = isOnlyPlaceholder || isProductsLoading;

        return (
            <p block="CategoryPage" elem="ItemsCount">
                <TextPlaceholder
                  content={ (isLoading
                      ? __('Products are loading...')
                      : __('%s items found', totalItems)
                  ) }
                />
            </p>
        );
    }
}

export default debounceRender(CategoryItemsCount, RENDER_PAGE_FREQUENCY, { leading: false });
