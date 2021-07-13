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

import ProductReviewRating from 'Component/ProductReviewRating';

import './ProductReviewItem.style';

/**
 * @class ProductReviewItem
 * @namespace Component/ProductReviewItem/Component
 */
export class ProductReviewItem extends PureComponent {
    static propTypes = {
        reviewItem: PropTypes.object.isRequired
    };

    getFormattedDate(created_at) {
        // Safari bug
        const fixedDate = created_at.replace(/-/g, '/');
        const date = new Date(fixedDate);

        return date ? date.toDateString() : created_at;
    }

    renderReviewListItemRating = (ratingVoteItem, i) => {
        const {
            rating_code,
            percent
        } = ratingVoteItem;

        return (
            <div
              key={ i }
              block="ProductReviewItem"
              elem="RatingSummaryItem"
              itemType="http://schema.org/Rating"
              itemScope
              itemProp="reviewRating"
            >
                <p itemProp="name" block="ProductReviewItem" elem="RatingItem">{ rating_code }</p>
                <meta itemProp="ratingValue" content={ percent } />
                <meta itemProp="worstRating" content={ 0 } />
                <meta itemProp="bestRating" content={ 100 } />
                <ProductReviewRating
                  summary={ percent }
                  code={ rating_code }
                />
            </div>
        );
    };

    renderAuthor(reviewItem) {
        const { nickname, created_at } = reviewItem;

        return (
            <p block="ProductReviewItem" elem="ReviewAuthor">
                { __('Written by ') }
                <strong itemProp="author">{ nickname }</strong>
                <meta itemProp="datePublished" content={ this.getFormattedDate(created_at) } />
                { __(', written at %s', this.getFormattedDate(created_at)) }
            </p>
        );
    }

    render() {
        const {
            reviewItem,
            reviewItem: {
                title,
                detail,
                rating_votes
            }
        } = this.props;

        return (
            <li
              block="ProductReviewItem"
              itemType="http://schema.org/Review"
              itemProp="review"
              itemScope
            >
                <h4 block="ProductReviewItem" elem="ReviewTitle" itemProp="name">
                    { title }
                </h4>
                <div block="ProductReviewItem" elem="RatingSummary">
                    { rating_votes.map(this.renderReviewListItemRating) }
                </div>
                <div block="ProductReviewItem" elem="Content">
                    <p block="ProductReviewItem" elem="ReviewDetails" itemProp="reviewBody">
                        { detail }
                    </p>
                    { this.renderAuthor(reviewItem) }
                </div>
            </li>
        );
    }
}

export default ProductReviewItem;
