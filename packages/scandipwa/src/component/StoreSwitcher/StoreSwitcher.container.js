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
import { connect } from 'react-redux';

import ConfigQuery from 'Query/Config.query';
import { showNotification } from 'Store/Notification/Notification.action';
import BrowserDatabase from 'Util/BrowserDatabase/BrowserDatabase';
import DataContainer from 'Util/Request/DataContainer';

import StoreSwitcher from './StoreSwitcher.component';
import { STORE_CONFIG_KEY } from './StoreSwitcher.config';

/** @namespace Component/StoreSwitcher/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    device: state.ConfigReducer.device,
    currentStoreCode: state.ConfigReducer.code
});

/** @namespace Component/StoreSwitcher/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showErrorNotification: (message) => dispatch(showNotification('error', message))
});

/** @namespace Component/StoreSwitcher/Container */
export class StoreSwitcherContainer extends DataContainer {
    static propTypes = {
        showErrorNotification: PropTypes.func.isRequired,
        currentStoreCode: PropTypes.string
    };

    static defaultProps = {
        currentStoreCode: 'default'
    };

    state = {
        storeList: [],
        isOpened: false,
        storeLabel: ''
    };

    containerFunctions = {
        handleStoreSelect: this._handleStoreSelect.bind(this),
        onStoreSwitcherClick: this.onStoreSwitcherClick.bind(this),
        onStoreSwitcherOutsideClick: this.onStoreSwitcherOutsideClick.bind(this)
    };

    componentDidMount() {
        this._getStoreList();
    }

    componentDidUpdate(prevProps) {
        const { currentStoreCode } = this.props;
        const { prevStoreCode } = prevProps;
        const { storeLabel, storeList } = this.state;

        if (!storeList.length) {
            this._getStoreList();
        }

        if (currentStoreCode && (!storeLabel || (prevStoreCode !== currentStoreCode))) {
            this.getCurrentLabel(currentStoreCode);
        }
    }

    containerProps = () => {
        const { currentStoreCode, device } = this.props;

        return { currentStoreCode, device };
    };

    onStoreSwitcherClick() {
        const { isOpened } = this.state;

        this.setState({ isOpened: !isOpened });
    }

    onStoreSwitcherOutsideClick() {
        this.setState({ isOpened: false });
    }

    _getStoreList() {
        this.fetchData(
            [ConfigQuery.getStoreListField()],
            ({ storeList }) => this.setState({
                storeList: this._formatStoreList(storeList)
            })
        );
    }

    _formatStoreList(storeList) {
        return storeList.reduce((acc, {
            name, code, is_active, base_url, base_link_url
        }) => {
            if (!is_active) {
                return acc;
            }

            return [
                ...acc,
                {
                    id: `store_${ code }`,
                    value: code,
                    storeUrl: base_url,
                    storeLinkUrl: base_link_url,
                    label: name
                }
            ];
        }, []);
    }

    getCurrentLabel(storeCode) {
        const { storeList } = this.state;

        const store = storeList.find(
            ({ value }) => value === storeCode
        );

        if (!store) {
            return;
        }

        const { label } = store;

        this.setState({ storeLabel: label });
    }

    _handleStoreSelect(storeCode) {
        const { showErrorNotification } = this.props;
        const { storeList } = this.state;

        const store = storeList.find(
            ({ value }) => value === storeCode
        );

        if (!store) {
            showErrorNotification(__('This store can not be opened!'));

            return;
        }

        BrowserDatabase.deleteItem(STORE_CONFIG_KEY);
        window.location = store.storeLinkUrl;
    }

    render() {
        return (
            <StoreSwitcher
              { ...this.containerFunctions }
              { ...this.containerProps() }
              { ...this.state }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreSwitcherContainer);
