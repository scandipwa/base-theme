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
import ExpandableContent from 'Component/ExpandableContent';
import Html from 'Component/Html';
import TextPlaceholder from 'Component/TextPlaceholder';
import { ProductType } from 'Type/ProductList';

import './ProductInformation.style';

/** @namespace Component/ProductInformation/Component */
export class ProductInformation extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired
    };

    renderDescription() {
        const { product: { description: { html } = {} } } = this.props;

        if (!html) {
            return (
                <TextPlaceholder length="long" />
            );
        }

        const cleanDescription = html.replace(/<\/?[^>]+(>|$)/g, '');

        return (
            <div block="ProductInformation" elem="Description">
                <meta itemProp="description" content={ cleanDescription } />
                <Html content={ html } />
            </div>
        );
    }

    renderContent() {
        const { areDetailsLoaded } = this.props;
        const heading = areDetailsLoaded ? __('About') : '';

        return (
            <ExpandableContent
              // show placeholder if the details are not loaded
              heading={ heading }
              mix={ { block: 'ProductInformation', elem: 'Content' } }
            >
                { this.renderDescription() }
            </ExpandableContent>
        );
    }

    isHTMLWhiteSpaceOrUndefined(htmlString) {
        if (!htmlString || htmlString.trim() === '') {
            return true;
        }

        // creates a DOM object from string
        const parser = new DOMParser();
        const document = parser.parseFromString(htmlString.trim(), 'text/html');

        // handles the case of plain text
        if (document.body.children.length === 0) {
            return false;
        }

        // check if at least one HTML element has content
        const elementsWithContent = Array.from(document.body.children).filter((element) => element.innerText !== '');

        return elementsWithContent.length === 0;
    }

    render() {
        const {
            areDetailsLoaded,
            product: {
                description: { html } = {}
            }
        } = this.props;

        if (this.isHTMLWhiteSpaceOrUndefined(html) && areDetailsLoaded) {
            return null;
        }

        return (
            <ContentWrapper
              label="Product information"
              mix={ { block: 'ProductInformation' } }
              wrapperMix={ { block: 'ProductInformation', elem: 'Wrapper' } }
            >
                { this.renderContent() }
            </ContentWrapper>
        );
    }
}

export default ProductInformation;
