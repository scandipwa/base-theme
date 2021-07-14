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

import ProductDownloadableLinks from './ProductDownloadableLinks.component';

/** @namespace Component/ProductDownloadableLinks/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isOpenInNewTab: state.ConfigReducer.downloadable_links_target_new_window
});

/** @namespace Component/ProductDownloadableLinks/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

/** @namespace Component/ProductDownloadableLinks/Container */
export class ProductDownloadableLinksContainer extends PureComponent {
    static propTypes = {
        title: PropTypes.string,
        isRequired: PropTypes.bool,
        links: PropTypes.array,
        setLinkedDownloadables: PropTypes.func.isRequired,
        setLinkedDownloadablesPrice: PropTypes.func.isRequired
    };

    static defaultProps = {
        title: '',
        links: [],
        isRequired: false
    };

    state = {
        isLoading: true,
        selectedLinks: []
    };

    containerFunctions = {
        setSelectedCheckboxValues: this.setSelectedCheckboxValues.bind(this)
    };

    componentDidMount() {
        const { links } = this.props;

        if (links) {
            this.stopLoading();
        }
    }

    componentDidUpdate(_, prevState) {
        const { links } = this.props;
        const {
            selectedLinks,
            isLoading
        } = this.state;

        const {
            selectedLinks: prevSelectedLinks
        } = prevState;

        if (links && isLoading) {
            this.stopLoading();
        }

        if (selectedLinks !== prevSelectedLinks) {
            this.updateSelectedOptionsArray();
        }
    }

    stopLoading() {
        this.setState({ isLoading: false });
    }

    updateSelectedOptionsArray() {
        const { setLinkedDownloadables, setLinkedDownloadablesPrice } = this.props;
        const { selectedLinks } = this.state;

        setLinkedDownloadables(selectedLinks);

        const price = this.getTotalPrice();
        setLinkedDownloadablesPrice(price);
    }

    getTotalPrice() {
        const { selectedLinks } = this.state;
        const { links } = this.props;

        return selectedLinks.reduce(
            (base, { link_id }) => {
                const link = links.find(({ id }) => id === link_id);

                return base + link.price;
            },
            0
        );
    }

    setSelectedCheckboxValues(option_id, option_value) {
        const { selectedLinks } = this.state;

        const optionIdInt = parseInt(option_id, 10);

        if (option_value) {
            if (selectedLinks.some(({ link_id: id }) => optionIdInt === id)) {
                return;
            }
            this.setState({
                selectedLinks: [...selectedLinks, { link_id: optionIdInt }]
            });

            return;
        }

        if (selectedLinks.some(({ link_id: id }) => optionIdInt === id)) {
            this.setState({
                selectedLinks: selectedLinks.filter(
                    (link) => link.link_id !== optionIdInt
                )
            });
        }
    }

    render() {
        return (
            <ProductDownloadableLinks
              { ...this.props }
              { ...this.state }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDownloadableLinksContainer);
