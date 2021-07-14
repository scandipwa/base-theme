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

import Html from 'Component/Html';
import Image from 'Component/Image';
import TextPlaceholder from 'Component/TextPlaceholder';
import { CategoryTreeType } from 'Type/Category';

import './CategoryDetails.style';

/**
 * Category details
 * @class CategoryDetails
 * @namespace Component/CategoryDetails/Component
 */
export class CategoryDetails extends PureComponent {
    static propTypes = {
        category: CategoryTreeType.isRequired,
        isCurrentCategoryLoaded: PropTypes.bool
    };

    static defaultProps = {
        isCurrentCategoryLoaded: true
    };

    renderCategoryName() {
        const {
            category: { name, id },
            isCurrentCategoryLoaded
        } = this.props;

        if (id && !name) {
            return null;
        }

        return (
            <h1 block="CategoryDetails" elem="Heading">
                { isCurrentCategoryLoaded ? <TextPlaceholder content={ name } /> : <TextPlaceholder /> }
            </h1>
        );
    }

    renderCategoryDescription() {
        const {
            category: { description, id },
            isCurrentCategoryLoaded
        } = this.props;

        if (!id || !isCurrentCategoryLoaded) {
            return this.renderCategoryDescriptionPlaceholder();
        }

        if (!description) {
            return null;
        }

        return <Html content={ description } />;
    }

    renderCategoryDescriptionPlaceholder() {
        return (
            <p>
                <TextPlaceholder length="long" />
            </p>
        );
    }

    renderCategoryImagePlaceholder() {
        return (
            <Image
              mix={ { block: 'CategoryDetails', elem: 'Picture' } }
              objectFit="cover"
              ratio="custom"
              isPlaceholder
            />
        );
    }

    renderCategoryImage() {
        const {
            category: { image, id },
            isCurrentCategoryLoaded
        } = this.props;

        if (!id || !isCurrentCategoryLoaded) {
            return this.renderCategoryImagePlaceholder();
        }

        if (!image) {
            return null;
        }

        return (
            <Image
              mix={ { block: 'CategoryDetails', elem: 'Picture' } }
              src={ image || '' }
              ratio="custom"
              objectFit="cover"
            />
        );
    }

    render() {
        return (
            <article block="CategoryDetails">
                <div block="CategoryDetails" elem="Description">
                    { this.renderCategoryName() }
                    { this.renderCategoryDescription() }
                </div>
                { this.renderCategoryImage() }
            </article>
        );
    }
}

export default CategoryDetails;
