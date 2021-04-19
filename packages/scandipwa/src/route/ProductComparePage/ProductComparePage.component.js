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

import ContentWrapper from 'Component/ContentWrapper';
import Loader from 'Component/Loader';
import ProductCompare from 'Component/ProductCompare';

import './ProductComparePage.style';

/** @namespace Route/ProductComparePage/Component/ProductComparePage */
export class ProductComparePage extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool
    };

    static defaultProps = {
        isLoading: false
    };

    render() {
        const { isLoading } = this.props;

        return (
            <main block="ProductComparePage">
                <Loader isLoading={ isLoading } />
                <ContentWrapper label={ __('Product Compare Page') }>
                    <ProductCompare />
                </ContentWrapper>
            </main>
        );
    }
}

export default ProductComparePage;
