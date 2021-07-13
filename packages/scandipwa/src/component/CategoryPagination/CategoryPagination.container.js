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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { HistoryType } from 'Type/Common';
import { LocationType } from 'Type/Router';
import { generateQuery, getQueryParam } from 'Util/Url';

import CategoryPagination from './CategoryPagination.component';

/** @namespace Component/CategoryPagination/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    paginationFrame: state.ConfigReducer.pagination_frame,
    paginationFrameSkip: state.ConfigReducer.pagination_frame_skip,
    anchorTextPrevious: state.ConfigReducer.anchor_text_for_previous,
    anchorTextNext: state.ConfigReducer.anchor_text_for_next
});

/** @namespace Component/CategoryPagination/Container */
export class CategoryPaginationContainer extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        onPageSelect: PropTypes.func,
        history: HistoryType.isRequired,
        location: LocationType.isRequired,
        totalPages: PropTypes.number.isRequired
    };

    static defaultProps = {
        isLoading: false,
        onPageSelect: () => {}
    };

    containerFunctions = () => ({
        getSearchQuery: this.getSearchQuery
    });

    getSearchQuery = (pageNumber) => {
        const { history, location } = this.props;
        const page = pageNumber !== 1 ? pageNumber : '';

        return generateQuery({ page }, location, history);
    };

    containerProps = () => ({
        currentPage: this._getCurrentPage()
    });

    _getCurrentPage() {
        const { location } = this.props;

        return +(getQueryParam('page', location) || 1);
    }

    render() {
        const { location: { pathname } } = this.props;

        return (
            <CategoryPagination
              pathname={ pathname }
              { ...this.props }
              { ...this.containerFunctions() }
              { ...this.containerProps() }
            />
        );
    }
}

/** @namespace Component/CategoryPagination/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CategoryPaginationContainer)
);
