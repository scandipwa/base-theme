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

    state = {
        isPlaceholderVisible: true,
        showSearch: false
    };

    static getDerivedStateFromProps(props) {
        const { isActive } = props;
        if (isActive) {
            return null;
        }

        return { isPlaceholderVisible: true };
    }

    componentDidUpdate() {
        const { showSearch } = this.state;

        if (showSearch) {
            this.onIconClick();
        }
    }

    onClearSearchButtonClick(isFocusOnSearchBar = true) {
        const { onClearSearchButtonClick } = this.props;
        if (isFocusOnSearchBar) {
            this.searchBarRef.current.focus();
        }
        onClearSearchButtonClick();
    }

    onSearchEnterPress = (e) => {
        const { searchCriteria, hideActiveOverlay, onSearchBarChange } = this.props;
        const search = searchCriteria.trim().replace(/\s\s+/g, '%20');
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
        this.setState({ showSearch: true });
    };

    closeSearch = () => {
        const { onSearchOutsideClick } = this.props;

        onSearchOutsideClick();
        this.setState({ showSearch: false });
    };

    handleChange = (e) => {
        const { target: { value } } = e;
        const { onSearchBarChange } = this.props;
        onSearchBarChange(e);

        this.setState({ isPlaceholderVisible: value === '' });
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
            isActive
        } = this.props;

        const { showSearch } = this.state;

        if (!showSearch) {
            return null;
        }

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
                  autoComplete="off"
                  aria-label={ __('Search') }
                />
                { /* eslint-disable-next-line jsx-a11y/interactive-supports-focus */ }
                <div
                  block="SearchField"
                  elem="SearchIcon"
                  role="button"
                  onClick={ this.onIconClick }
                  aria-label={ __('Search') }
                />
                <Suspense fallback={ this.renderOverlayFallback() }>
                    <SearchOverlay
                      isHideOverlay
                      clearSearch={ this.clearSearch }
                      searchCriteria={ searchCriteria }
                    />
                </Suspense>
            </div>
        );
    }

    renderSearchIcon() {
        const { showSearch } = this.state;

        if (showSearch) {
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

    renderDesktopContent() {
        const { device } = this.props;
        const { showSearch } = this.state;

        if (device.isMobile) {
            return null;
        }

        return (
            <>
                { this.renderSearchIcon() }
                <div
                  block="SearchField"
                  elem="SearchWrapper"
                  mods={ { isVisible: showSearch } }
                >
                    { this.renderSearch() }
                </div>
            </>
        );
    }

    renderMobileContent() {
        const {
            searchCriteria,
            onSearchBarFocus,
            isActive,
            device
        } = this.props;

        if (!device.isMobile) {
            return null;
        }

        const { isPlaceholderVisible } = this.state;

        return (
            <>
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
                  autoComplete="off"
                  aria-label={ __('Search') }
                />
                <div
                  block="SearchField"
                  elem="Placeholder"
                  mods={ {
                      isActive,
                      isPlaceholderVisible
                  } }
                >
                    <span>{ __('Search') }</span>
                </div>
                <Suspense fallback={ this.renderOverlayFallback() }>
                    <SearchOverlay clearSearch={ this.clearSearch } searchCriteria={ searchCriteria } />
                </Suspense>
            </>
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
                        { this.renderMobileContent() }
                        { this.renderDesktopContent() }
                    </div>
                </ClickOutside>
            </div>
        );
    }
}

export default SearchField;
