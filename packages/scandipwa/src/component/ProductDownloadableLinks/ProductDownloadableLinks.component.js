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

import ExpandableContent from 'Component/ExpandableContent';
import Field from 'Component/Field';
import Link from 'Component/Link';
import { formatPrice } from 'Util/Price';

import './ProductDownloadableLinks.style.scss';

/** @namespace Component/ProductDownloadableLinks/Component */
export class ProductDownloadableLinks extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        isRequired: PropTypes.bool.isRequired,
        links: PropTypes.array,
        title: PropTypes.string.isRequired,
        setSelectedCheckboxValues: PropTypes.func.isRequired,
        isOpenInNewTab: PropTypes.bool.isRequired,
        selectedLinks: PropTypes.array
    };

    static defaultProps = {
        links: [],
        selectedLinks: []
    };

    getLabel(link) {
        const { title, price } = link;
        const { isRequired } = this.props;

        if (!isRequired) {
            return (
            <span block="ProductDownloadableLink" elem="SampleTitle">
                { title }
            </span>
            );
        }

        return (
            <span block="ProductDownloadableLink" elem="SampleTitle">
                { title }
                { `(+${ formatPrice(price) })` }
            </span>
        );
    }

    renderLabel(link) {
        const { isOpenInNewTab } = this.props;
        const { sample_url } = link;

        if (!sample_url) {
            return this.getLabel(link);
        }

        return (
            <>
                { this.getLabel(link) }
                <Link
                  to={ sample_url }
                  isOpenInNewTab={ isOpenInNewTab }
                  block="ProductDownloadableLink"
                  elem="SampleLink"
                >
                    { __('Sample') }
                </Link>
            </>
        );
    }

    renderCheckBox(link) {
        const { setSelectedCheckboxValues, isRequired } = this.props;
        const { id } = link;

        if (!isRequired) {
            return null;
        }

        return (
            <Field
              type="checkbox"
              key={ id }
              id={ `link-${ id }` }
              name={ `link-${ id }` }
              value={ id }
              onChange={ setSelectedCheckboxValues }
            />
        );
    }

    renderLink = (link) => {
        const { id } = link;

        return (
            <div block="ProductDownloadableLink" key={ id }>
                { this.renderCheckBox(link) }
                <span block="ProductDownloadableLink" elem="SampleLabel">
                    { this.renderLabel(link) }
                </span>
            </div>
        );
    };

    renderRequired(isRequired) {
        const { selectedLinks } = this.props;

        if (isRequired !== true || selectedLinks.length > 0) {
            return null;
        }

        return (
            <div
              block="ProductDownloadableLink"
              elem="Required"
            >
                { __('This field is required!') }
            </div>
        );
    }

    renderLinks() {
        const { links, isRequired } = this.props;

        return (
            <>
                { links.map(this.renderLink) }
                { this.renderRequired(isRequired) }
            </>
        );
    }

    renderTitle() {
        const { title } = this.props;

        return (
            <p block="ProductDownloadableLinks" elem="Title">
                { title }
            </p>
        );
    }

    renderContent() {
        return (
            <>
            { this.renderTitle() }
            { this.renderLinks() }
            </>
        );
    }

    renderPlaceholder() {
        const { isLoading } = this.props;

        return (
            <div
              block="ProductDownloadableLinks"
              mods={ { isLoading, isPlaceholder: true } }
            />
        );
    }

    render() {
        const { isLoading, title } = this.props;

        if (isLoading) {
            return this.renderPlaceholder();
        }

        return (
            <ExpandableContent
              block="ProductDownloadableLinks"
              heading={ title }
              mix={ { block: 'ProductDownloadableLinks' } }
            >
                { this.renderContent() }
            </ExpandableContent>
        );
    }
}

export default ProductDownloadableLinks;
