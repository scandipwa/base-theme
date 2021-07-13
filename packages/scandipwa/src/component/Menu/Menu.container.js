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

import { connect } from 'react-redux';

import MenuQuery from 'Query/Menu.query';
import { DeviceType } from 'Type/Device';
import history from 'Util/History';
import MenuHelper from 'Util/Menu';
import DataContainer from 'Util/Request/DataContainer';

import Menu from './Menu.component';

/** @namespace Component/Menu/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device
});

/** @namespace Component/Menu/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

/** @namespace Component/Menu/Container */
export class MenuContainer extends DataContainer {
    static propTypes = {
        device: DeviceType.isRequired
    };

    containerFunctions = {
        handleSubcategoryClick: this.handleSubcategoryClick.bind(this),
        closeMenu: this.closeMenu.bind(this),
        onCategoryHover: this.onCategoryHover.bind(this)
    };

    __construct(props) {
        super.__construct(props);

        const {
            stack: activeMenuItemsStack = []
        } = history.location.state || {};

        this.state = {
            activeMenuItemsStack,
            menu: {}
        };
    }

    componentDidMount() {
        const { device: { isMobile } } = this.props;

        this._getMenu();

        if (isMobile) {
            window.addEventListener('popstate', this.historyBackHook);
        }
    }

    historyBackHook = () => {
        const { activeMenuItemsStack } = this.state;

        if (activeMenuItemsStack.length) {
            this.setState({ activeMenuItemsStack: activeMenuItemsStack.slice(1) });
        }
    };

    componentWillUnmount() {
        window.removeEventListener('popstate', this.historyBackHook);
    }

    _getMenuOptions() {
        const { header_content: { header_menu } = {} } = window.contentConfiguration;

        return {
            identifier: header_menu || 'new-main-menu'
        };
    }

    _getMenu() {
        this.fetchData(
            [MenuQuery.getQuery(this._getMenuOptions())],
            ({ menu }) => this.setState({
                menu: MenuHelper.reduce(menu)
            })
        );
    }

    getNewActiveMenuItemsStack(activeMenuItemsStack, item_id) {
        if (activeMenuItemsStack.includes(item_id)) {
            return activeMenuItemsStack.filter((id) => id !== item_id);
        }

        return [item_id, ...activeMenuItemsStack];
    }

    handleSubcategoryClick(e, activeSubcategory) {
        const { activeMenuItemsStack } = this.state;
        const { item_id } = activeSubcategory;

        e.stopPropagation();

        const newActiveMenuItemsStack = this.getNewActiveMenuItemsStack(activeMenuItemsStack, item_id);
        this.setState({ activeMenuItemsStack: newActiveMenuItemsStack });
    }

    onCategoryHover(activeSubcategory) {
        const { device } = this.props;
        const { activeMenuItemsStack } = this.state;

        if (device.isMobile) {
            return;
        }

        const { item_id } = activeSubcategory;

        if (activeMenuItemsStack.includes(item_id)) {
            return;
        }

        this.setState({ activeMenuItemsStack: [item_id] });
    }

    closeMenu() {
        const { device } = this.props;
        if (device.isMobile) {
            return;
        }

        this.setState({ activeMenuItemsStack: [] });
    }

    render() {
        return (
            <Menu
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuContainer);
