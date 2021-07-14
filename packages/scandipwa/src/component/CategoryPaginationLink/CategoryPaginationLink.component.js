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
import { ChildrenType } from 'Type/Common';

import './CategoryPaginationLink.style';

/** @namespace Component/CategoryPaginationLink/Component */
export class CategoryPaginationLink extends PureComponent {
    static propTypes = {
        children: ChildrenType,
        getPage: PropTypes.func.isRequired,
        label: PropTypes.string.isRequired,
        isCurrent: PropTypes.bool.isRequired,
        url_path: PropTypes.string.isRequired,
        pageNumber: PropTypes.number.isRequired,
        getSearchQueryForPage: PropTypes.func.isRequired
    };

    static defaultProps = {
        children: []
    };

    getPage = () => {
        const { getPage, pageNumber } = this.props;
        getPage(pageNumber);
    };

    getSearchQueryForPage = () => {
        const { getSearchQueryForPage, pageNumber } = this.props;

        return getSearchQueryForPage(pageNumber);
    };

    render() {
        const {
            label,
            url_path: pathname,
            isCurrent,
            children
        } = this.props;

        const search = this.getSearchQueryForPage();

        const { state = {} } = history.state || {};

        return (
            <Link
              to={ {
                  search,
                  pathname,
                  state
              } }
              aria-label={ label }
              block="CategoryPaginationLink"
              mods={ { isCurrent, isArrow: typeof children !== 'string' } }
              aria-current={ isCurrent ? 'page' : 'false' }
              onClick={ this.getPage }
            >
                { children }
            </Link>
        );
    }
}

export default CategoryPaginationLink;
