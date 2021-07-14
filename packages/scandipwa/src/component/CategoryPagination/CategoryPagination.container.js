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

import { UTMOST_PAGES_COUNT } from 'Component/CategoryPagination/CategoryPagination.config';
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
        totalPages: PropTypes.number.isRequired,
        paginationFrame: PropTypes.number,
        paginationFrameSkip: PropTypes.number
    };

    static defaultProps = {
        isLoading: false,
        onPageSelect: () => {},
        paginationFrame: 5,
        paginationFrameSkip: null
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
        currentPage: this._getCurrentPage(),
        prevPageJump: this._getPrevPageJump(),
        nextPageJump: this._getNextPageJump(),
        firstFramePage: this._getFirstFramePage(),
        lastFramePage: this._getLastFramePage(),
        shouldRenderNextJump: this._shouldRenderNextJump(),
        shouldRenderPreviousJump: this._shouldRenderPreviousJump(),
        shouldRenderJumps: this._shouldRenderJumps()
    });

    _getCurrentPage() {
        const { location } = this.props;

        return +(getQueryParam('page', location) || 1);
    }

    // e.g. 5 for pagination like 1 ... 5 6 7 ... 14
    _getFirstFramePage() {
        const { paginationFrame, totalPages } = this.props;
        const maxFirstPage = this._getCurrentPage() - Math.ceil(paginationFrame / 2) + 1;
        const minFirstPage = totalPages - paginationFrame + 1;

        return Math.max(1, Math.min(maxFirstPage, minFirstPage));
    }

    // e.g. 7 for pagination like 1 ... 5 6 7 ... 14
    _getLastFramePage() {
        const { paginationFrame, totalPages } = this.props;
        return Math.min(totalPages, this._getFirstFramePage() + paginationFrame - 1);
    }

    // i.e. what page you go to on click on first '...'
    _getPrevPageJump() {
        const { paginationFrameSkip } = this.props;

        return Math.max(UTMOST_PAGES_COUNT, this._getFirstFramePage() - paginationFrameSkip);
    }

    // i.e. what page you go to on click on second '...'
    _getNextPageJump() {
        const { paginationFrameSkip, totalPages } = this.props;

        return Math.min(totalPages - 1, this._getLastFramePage() + paginationFrameSkip);
    }

    _shouldRenderJumps() {
        const { paginationFrameSkip } = this.props;

        return !(!paginationFrameSkip || paginationFrameSkip < 2);
    }

    _shouldRenderNextJump() {
        const { totalPages } = this.props;

        if (!this._shouldRenderJumps()) {
            return false;
        }

        return totalPages - this._getLastFramePage() >= UTMOST_PAGES_COUNT;
    }

    _shouldRenderPreviousJump() {
        if (!this._shouldRenderJumps()) {
            return false;
        }

        return this._getFirstFramePage() > UTMOST_PAGES_COUNT;
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
