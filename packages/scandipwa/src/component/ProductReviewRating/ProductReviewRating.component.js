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
import { createRef, PureComponent } from 'react';

import {
    ONE_STAR_SHARE,
    STARS_COUNT,
    STARS_GRANULARITY_PERCENT
} from 'Component/ProductReviewRating/ProductReviewRating.config';
import { MixType } from 'Type/Common';
import CSS from 'Util/CSS';

import './ProductReviewRating.style';

/**
 * @class ProductReviewRating
 * @namespace Component/ProductReviewRating/Component
 */
export class ProductReviewRating extends PureComponent {
    static propTypes = {
        summary: PropTypes.number,
        code: PropTypes.string,
        placeholder: PropTypes.bool,
        mix: MixType,
        count: PropTypes.number
    };

    static defaultProps = {
        summary: 0,
        code: '',
        placeholder: false,
        mix: {},
        count: 0
    };

    reviewRating = createRef();

    componentDidMount() {
        this.updateRating();
    }

    componentDidUpdate() {
        this.updateRating();
    }

    getAriaText(summary, code) {
        const ONE_FIFTH_OF_A_HUNDRED = 20;
        const rating = parseFloat(summary / ONE_FIFTH_OF_A_HUNDRED).toFixed(2);

        return code
            ? `Review's ${code} rating is ${rating} out of 5`
            : `Product's rating is ${rating} out of 5`;
    }

    updateRating() {
        const { summary } = this.props;

        CSS.setVariable(
            this.reviewRating,
            'percentage',
            `${summary}%`
        );
    }

    renderPlaceholder() {
        return (
            <div
              block="ProductReviewRating"
              ref={ this.reviewRating }
            />
        );
    }

    getStarCounts() {
        const { summary } = this.props;
        const percentRounded = Math.round(summary / STARS_GRANULARITY_PERCENT) * STARS_GRANULARITY_PERCENT;
        const fullCount = Math.floor(percentRounded / ONE_STAR_SHARE);
        const halfFullCount = percentRounded % ONE_STAR_SHARE === STARS_GRANULARITY_PERCENT ? 1 : 0;
        const emptyCount = STARS_COUNT - fullCount - halfFullCount;

        return [fullCount, halfFullCount, emptyCount];
    }

    renderStar(count, type) {
        return Array.from(Array(count), (_, i) => <span key={ i } block="ProductReviewRating" elem={ type } />);
    }

    render() {
        const {
            summary,
            code,
            placeholder,
            mix,
            count
        } = this.props;

        const [fullCount, halfFullCount, emptyCount] = this.getStarCounts();

        const ariaText = this.getAriaText(summary, code);

        if (placeholder) {
            return this.renderPlaceholder();
        }

        return (
            <div
              block="ProductReviewRating"
              title={ `${summary}%` }
              ref={ this.reviewRating }
              aria-label={ ariaText }
              mix={ mix }
            >
                { this.renderStar(fullCount, 'StarFull') }
                { this.renderStar(halfFullCount, 'StarHalfFull') }
                { this.renderStar(emptyCount, 'StarEmpty') }
                <span block="ProductReviewRating" elem="Counter">
                    { `(${count})` }
                </span>
            </div>
        );
    }
}

export default ProductReviewRating;
