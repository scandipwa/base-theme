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

import Link from 'Component/Link';
import TextPlaceholder from 'Component/TextPlaceholder';

import './Breadcrumb.style';

/** @namespace Component/Breadcrumb/Component */
export class Breadcrumb extends PureComponent {
    static propTypes = {
        index: PropTypes.number.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        url: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({})
        ]),
        name: PropTypes.string
    };

    static defaultProps = {
        url: '',
        name: ''
    };

    getLinkUrl() {
        const {
            url = ''
        } = this.props;

        if (typeof url === 'string' || !url) {
            return {
                pathname: url || '',
                search: '',
                state: {
                    ...this.state
                }
            };
        }

        return url;
    }

    renderLink() {
        const {
            index,
            isDisabled
        } = this.props;

        const url = this.getLinkUrl() || {};

        return (
            <Link
              block="Breadcrumb"
              elem="Link"
              to={ url }
              tabIndex={ isDisabled ? '-1' : '0' }
            >
                <meta itemProp="item" content={ window.location.origin + url.pathname } />
                <span itemProp="name">
                    { this.renderName() }
                </span>
                <span block="Breadcrumb" elem="Arrow" />
                <meta itemProp="position" content={ index } />
            </Link>
        );
    }

    renderName() {
        const { name } = this.props;

        return (
            <TextPlaceholder content={ name } />
        );
    }

    render() {
        const { index } = this.props;

        return (
            <li
              block="Breadcrumb"
              key={ index }
              itemProp="itemListElement"
              itemScope
              itemType="http://schema.org/ListItem"
            >
                { this.renderLink() }
            </li>
        );
    }
}

export default Breadcrumb;
