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

import OrderQuery from 'Query/Order.query';
import { showNotification } from 'Store/Notification/Notification.action';
import { DeviceType } from 'Type/Device';
import { fetchQuery } from 'Util/Request';

import MyAccountDownloadable from './MyAccountDownloadable.component';

export const OrderDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Order/Order.dispatcher'
);

/** @namespace Component/MyAccountDownloadable/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    orderList: state.OrderReducer.orderList,
    device: state.ConfigReducer.device
});

/** @namespace Component/MyAccountDownloadable/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    showErrorNotification: (message) => dispatch(showNotification('error', message)),
    showSuccessNotification: (message) => dispatch(showNotification('success', message)),
    getOrderList: () => OrderDispatcher.then(
        ({ default: dispatcher }) => dispatcher.requestOrders(dispatch)
    )
});

/** @namespace Component/MyAccountDownloadable/Container */
export class MyAccountDownloadableContainer extends PureComponent {
    static propTypes = {
        device: DeviceType.isRequired,
        showErrorNotification: PropTypes.func.isRequired,
        showSuccessNotification: PropTypes.func.isRequired,
        getOrderList: PropTypes.func.isRequired
    };

    state = {
        items: [],
        isLoading: false
    };

    componentDidMount() {
        const { getOrderList } = this.props;

        getOrderList();
        this.requestDownloadable();
    }

    containerProps = () => {
        const { device } = this.props;
        const { isLoading } = this.state;

        return {
            device,
            isLoading,
            items: this._prepareDownloadableProps()
        };
    };

    _prepareDownloadableProps() {
        const { items } = this.state;

        if (!items?.length) {
            return [];
        }

        return items.reduce((acc, item, index) => {
            acc.push({
                id: index,
                order_id: item.order_increment_id,
                status_label: item.status,
                created_at: item.date,
                download_url: item.download_url,
                downloads: item.remaining_downloads,
                title: item.title,
                link_title: item.link_title
            });

            return acc;
        }, []);
    }

    requestDownloadable() {
        const { showErrorNotification } = this.props;

        this.setState({ isLoading: true });

        fetchQuery(
            OrderQuery.getDownloadableQuery()
        ).then(
            /** @namespace Component/MyAccountDownloadable/Container/requestDownloadable/success */
            (data) => {
                const { customerDownloadableProducts: { items = [] } = {} } = data;
                this.setState({ items, isLoading: false });
            },
            /** @namespace Component/MyAccountDownloadable/Container/requestDownloadable/error */
            (err) => {
                const { message = __('Something went wrong!') } = err;
                showErrorNotification(message);
                this.setState({ isLoading: false });
            }
        );
    }

    render() {
        return (
            <MyAccountDownloadable
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountDownloadableContainer);
