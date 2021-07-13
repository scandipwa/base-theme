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

import ProductReviewItem from 'Component/ProductReviewItem';
import { ProductType } from 'Type/ProductList';

import './ProductReviewList.style';

/**
 * @class ProductReviewList
 * @namespace Component/ProductReviewList/Component
 */
export class ProductReviewList extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired
    };

    renderReviews() {
        const { product: { reviews } } = this.props;

        return reviews.map((reviewItem, i) => (
            <ProductReviewItem
              reviewItem={ reviewItem }
              // eslint-disable-next-line react/no-array-index-key
              key={ i }
            />
        ));
    }

    render() {
        const { product } = this.props;
        const hasReviews = product.reviews && Object.keys(product.reviews).length > 0;
        if (!hasReviews) {
            return null;
        }

        return (
            <ul block="ProductReviewList">
                { this.renderReviews() }
            </ul>
        );
    }
}

export default ProductReviewList;
