/* eslint-disable jsx-a11y/click-events-have-key-events */
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
import {
    createRef,
    lazy,
    PureComponent,
    Suspense
} from 'react';

import ClickOutside from 'Component/ClickOutside';
import Loader from 'Component/Loader';
import { DeviceType } from 'Type/Device';
import history from 'Util/History';
import { appendWithStoreCode } from 'Util/Url';

import './SearchField.style';

export const SearchOverlay = lazy(
    () => import(
        /* webpackMode: "lazy", webpackChunkName: "category" */
        'Component/SearchOverlay'
    )
);

/** @namespace Component/SearchField/Component */
export class SearchField extends PureComponent {
    static propTypes = {
        searchCriteria: PropTypes.string,
        onSearchBarFocus: PropTypes.func.isRequired,
        onSearchBarChange: PropTypes.func.isRequired,
        onSearchOutsideClick: PropTypes.func.isRequired,
        onClearSearchButtonClick: PropTypes.func.isRequired,
        isVisible: PropTypes.bool,
        isActive: PropTypes.bool,
        hideActiveOverlay: PropTypes.func,
        device: DeviceType.isRequired
    };

    static defaultProps = {
        isVisible: true,
        isActive: true,
        searchCriteria: '',
        hideActiveOverlay: () => {}
    };

    searchBarRef = createRef();

    onClearSearchButtonClick(isFocusOnSearchBar = true) {
        const { onClearSearchButtonClick } = this.props;
        if (isFocusOnSearchBar) {
            this.searchBarRef.current.focus();
        }
        onClearSearchButtonClick();
    }

    onSearchEnterPress = (e) => {
        const { searchCriteria, hideActiveOverlay, onSearchBarChange } = this.props;
        const search = searchCriteria.trim().replace(/\s/g, '+');
        const trimmedSearch = searchCriteria.trim();

        if (e.key === 'Enter' && trimmedSearch !== '') {
            history.push(appendWithStoreCode(`/search/${ search }`));
            hideActiveOverlay();
            onSearchBarChange({ target: { value: '' } });
            this.searchBarRef.current.blur();
            this.closeSearch();
        }
    };

    onIconClick = () => {
        this.searchBarRef.current.focus();
    };

    openSearch = () => {
        const { onSearchBarFocus } = this.props;

        onSearchBarFocus();
    };

    closeSearch = () => {
        const { onSearchOutsideClick } = this.props;

        onSearchOutsideClick();
    };

    handleChange = (e) => {
        const { onSearchBarChange } = this.props;
        onSearchBarChange(e);
    };

    clearSearch = () => {
        this.onClearSearchButtonClick(false);
    };

    renderClearSearch() {
        const { isVisible } = this.props;

        return (
            <button
              block="Header"
              elem="Button"
              onClick={ this.onClearSearchButtonClick }
              mods={ {
                  type: 'searchClear',
                  isVisible
              } }
              aria-label="Clear search"
            />
        );
    }

    renderOverlayFallback() {
        return <Loader isLoading />;
    }

    renderSearch() {
        const {
            searchCriteria,
            onSearchBarFocus,
            isActive,
            device
        } = this.props;

        return (
            <div
              block="SearchField"
              elem="SearchInnerWrapper"
            >
                <input
                  id="search-field"
                  ref={ this.searchBarRef }
                  block="SearchField"
                  elem="Input"
                  onFocus={ onSearchBarFocus }
                  onChange={ this.handleChange }
                  onKeyDown={ this.onSearchEnterPress }
                  value={ searchCriteria }
                  mods={ { isActive } }
                  placeholder={ __('Search products') }
                  autoComplete="off"
                  aria-label={ __('Search') }
                />
                { this.renderSearchIcon() }
                <Suspense fallback={ this.renderOverlayFallback() }>
                    <SearchOverlay
                      isHideOverlay={ !device.isMobile }
                      clearSearch={ this.clearSearch }
                      searchCriteria={ searchCriteria }
                    />
                </Suspense>
            </div>
        );
    }

    renderSearchIcon() {
        const { isActive } = this.props;

        if (isActive) {
            return (
                <div
                  block="SearchField"
                  elem="CloseIcon"
                  role="button"
                  tabIndex="0"
                  onClick={ this.closeSearch }
                  aria-label={ __('Close') }
                />
            );
        }

        return (
            <div
              block="SearchField"
              elem="SearchIcon"
              role="button"
              tabIndex="0"
              onClick={ this.openSearch }
              aria-label={ __('Search') }
            />
        );
    }

    render() {
        const {
            isVisible,
            isActive
        } = this.props;

        return (
            <div block="SearchField" mods={ { isVisible, isActive } }>
                <ClickOutside onClick={ this.closeSearch }>
                    <div block="SearchField" elem="Wrapper">
                        { this.renderSearch() }
                    </div>
                </ClickOutside>
            </div>
        );
    }
}

export default SearchField;
