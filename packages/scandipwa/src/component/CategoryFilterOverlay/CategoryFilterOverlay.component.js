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

import CategoryConfigurableAttributes from 'Component/CategoryConfigurableAttributes';
import Loader from 'Component/Loader';
import Overlay from 'Component/Overlay';
import ResetAttributes from 'Component/ResetAttributes';
import ResetButton from 'Component/ResetButton';

import { CATEGORY_FILTER_OVERLAY_ID } from './CategoryFilterOverlay.config';

import './CategoryFilterOverlay.style';

/** @namespace Component/CategoryFilterOverlay/Component */
export class CategoryFilterOverlay extends PureComponent {
    static propTypes = {
        availableFilters: PropTypes.objectOf(PropTypes.shape).isRequired,
        areFiltersEmpty: PropTypes.bool.isRequired,
        isContentFiltered: PropTypes.bool.isRequired,
        isMatchingInfoFilter: PropTypes.bool,
        isInfoLoading: PropTypes.bool.isRequired,
        isProductsLoading: PropTypes.bool.isRequired,
        onSeeResultsClick: PropTypes.func.isRequired,
        onVisible: PropTypes.func.isRequired,
        onHide: PropTypes.func.isRequired,
        customFiltersValues: PropTypes.objectOf(PropTypes.array).isRequired,
        toggleCustomFilter: PropTypes.func.isRequired,
        getFilterUrl: PropTypes.func.isRequired,
        totalPages: PropTypes.number.isRequired,
        isCategoryAnchor: PropTypes.bool
    };

    static defaultProps = {
        isCategoryAnchor: true,
        isMatchingInfoFilter: false
    };

    renderFilters() {
        const {
            availableFilters,
            customFiltersValues,
            toggleCustomFilter,
            isMatchingInfoFilter,
            getFilterUrl
        } = this.props;

        return (
            <CategoryConfigurableAttributes
              mix={ { block: 'CategoryFilterOverlay', elem: 'Attributes' } }
              isReady={ isMatchingInfoFilter }
              configurable_options={ availableFilters }
              getLink={ getFilterUrl }
              parameters={ customFiltersValues }
              updateConfigurableVariant={ toggleCustomFilter }
            />
        );
    }

    renderSeeResults() {
        const { onSeeResultsClick } = this.props;

        return (
            <div
              block="CategoryFilterOverlay"
              elem="SeeResults"
            >
                <button
                  block="CategoryFilterOverlay"
                  elem="Button"
                  mix={ { block: 'Button' } }
                  onClick={ onSeeResultsClick }
                >
                    { __('SEE RESULTS') }
                </button>
            </div>
        );
    }

    renderResetButton() {
        const { onSeeResultsClick } = this.props;

        return (
            <ResetButton
              onClick={ onSeeResultsClick }
              mix={ { block: 'CategoryFilterOverlay', elem: 'ResetButton' } }
            />
        );
    }

    renderResetAttributes() {
        const { customFiltersValues, availableFilters, toggleCustomFilter } = this.props;

        return (
            <ResetAttributes
              customFiltersValues={ customFiltersValues }
              availableFilters={ availableFilters }
              toggleCustomFilter={ toggleCustomFilter }
            />
        );
    }

    renderHeading() {
        const { isContentFiltered } = this.props;

        return (
            <h3 block="CategoryFilterOverlay" elem="Heading" mods={ { isContentFiltered } }>
                { __('Shopping Options') }
            </h3>
        );
    }

    renderNoResults() {
        return (
            <p block="CategoryFilterOverlay" elem="NoResults">
                { __(`The selected filter combination returned no results.
                Please try again, using a different set of filters.`) }
            </p>
        );
    }

    renderEmptyFilters() {
        return (
            <>
                { this.renderNoResults() }
                { this.renderResetButton() }
                { this.renderSeeResults() }
            </>
        );
    }

    renderMinimalFilters() {
        return this.renderSeeResults();
    }

    renderDefaultFilters() {
        return (
            <>
                { this.renderHeading() }
                <div block="CategoryFilterOverlay" elem="ResetSection">
                    { this.renderResetAttributes() }
                    { this.renderResetButton() }
                </div>
                { this.renderFilters() }
            </>
        );
    }

    renderContent() {
        const {
            totalPages,
            areFiltersEmpty,
            isProductsLoading
        } = this.props;

        if (!isProductsLoading && totalPages === 0) {
            return this.renderEmptyFilters();
        }

        if (areFiltersEmpty) {
            return this.renderMinimalFilters();
        }

        return (
            <>
                { this.renderDefaultFilters() }
                { this.renderSeeResults() }
            </>
        );
    }

    renderLoader() {
        const {
            isInfoLoading,
            availableFilters
        } = this.props;

        const isLoaded = availableFilters && !!Object.keys(availableFilters).length;

        if (!isLoaded) { // hide loader if filters were not yet loaded (even once!)
            return null;
        }

        return (
            <Loader isLoading={ isInfoLoading } />
        );
    }

    render() {
        const {
            onVisible,
            onHide,
            totalPages,
            isProductsLoading,
            isContentFiltered,
            isCategoryAnchor
        } = this.props;

        if ((!isProductsLoading && totalPages === 0 && !isContentFiltered) || !isCategoryAnchor) {
            return (
                <div block="CategoryFilterOverlay" />
            );
        }

        return (
            <Overlay
              onVisible={ onVisible }
              onHide={ onHide }
              mix={ { block: 'CategoryFilterOverlay' } }
              id={ CATEGORY_FILTER_OVERLAY_ID }
              isRenderInPortal={ false }
            >
                <div block="CategoryFilterOverlay" elem="Wrapper">
                    { this.renderContent() }
                    { this.renderLoader() }
                </div>
            </Overlay>
        );
    }
}

export default CategoryFilterOverlay;
