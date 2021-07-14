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

import ContentWrapper from 'Component/ContentWrapper';
import ProductTab from 'Component/ProductTab';
import { isMobile } from 'Util/Mobile';

import './ProductTabs.style';

/** @namespace Component/ProductTabs/Component */
export class ProductTabs extends PureComponent {
    static propTypes = {
        tabs: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            render: PropTypes.func.isRequired
        })).isRequired,
        defaultTab: PropTypes.number.isRequired
    };

    __construct(props) {
        super.__construct(props);

        const { defaultTab } = this.props;

        this.state = {
            activeTab: defaultTab
        };
    }

    componentDidUpdate(prevProps) {
        const { defaultTab } = this.props;

        if (defaultTab !== prevProps.defaultTab) {
            this.handleChangeTab(defaultTab);
        }
    }

    onTabClick = (tab) => {
        const { tabs } = this.props;
        const { activeTab } = this.state;

        const currentTab = tabs.findIndex(({ name }) => name === tab);

        if (activeTab !== currentTab) {
            this.handleChangeTab(currentTab);
        }
    };

    handleChangeTab(tab) {
        this.setState({
            activeTab: tab
        });
    }

    renderActiveTab() {
        const { tabs } = this.props;
        const { activeTab } = this.state;

        return tabs[activeTab].render();
    }

    renderAllTabs() {
        const { tabs } = this.props;

        return tabs.map(({ render }) => render());
    }

    renderTab = (item, i) => {
        const { activeTab } = this.state;

        return (
            <ProductTab
              tabName={ item.name }
              key={ i }
              onClick={ this.onTabClick }
              isActive={ i === activeTab }
            />
        );
    };

    renderTabs() {
        const { tabs } = this.props;

        return (
            <>
                <ul block="ProductTabs">
                    { tabs.map(this.renderTab) }
                </ul>
                { isMobile.any() ? this.renderAllTabs() : this.renderActiveTab() }
            </>
        );
    }

    render() {
        return (
            <ContentWrapper
              wrapperMix={ { block: 'ProductTabs', elem: 'Wrapper' } }
              label={ __('Product tabs') }
            >
                { this.renderTabs() }
            </ContentWrapper>
        );
    }
}

export default ProductTabs;
