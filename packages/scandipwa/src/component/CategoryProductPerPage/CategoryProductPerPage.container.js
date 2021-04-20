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

import CategoryProductPerPage from './CategoryProductPerPage.component';

/** @namespace Component/CategoryProductPerPage/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    defaultListProductCount: state.ConfigReducer.list_per_page,
    defaultGridProductCount: state.ConfigReducer.grid_per_page,
    gridCountOptions: state.ConfigReducer.grid_per_page_values,
    listCountOptions: state.ConfigReducer.list_per_page_values
});

/** @namespace Component/CategoryProductPerPage/Container/mapDispatchToProps */
export const mapDispatchToProps = () => ({});

/** @namespace Component/CategoryProductPerPage/Container */
export class CategoryProductPerPageContainer extends PureComponent {
    static propTypes = {
        defaultListProductCount: PropTypes.string.isRequired,
        defaultGridProductCount: PropTypes.string.isRequired,
        gridCountOptions: PropTypes.string.isRequired,
        listCountOptions: PropTypes.string.isRequired,
        plpType: PropTypes.string.isRequired,
        onPageSizeChange: PropTypes.func.isRequired
    };

    containerFunctions = {
        handleChange: this.handleChange.bind(this)
    };

    containerProps = () => {
        const {
            defaultListProductCount,
            defaultGridProductCount,
            gridCountOptions,
            listCountOptions,
            plpType
        } = this.props;

        return {
            defaultListProductCount,
            defaultGridProductCount,
            gridCountOptions: this.createOptionsArray(gridCountOptions),
            listCountOptions: this.createOptionsArray(listCountOptions),
            plpType
        };
    };

    handleChange(value) {
        const { onPageSizeChange } = this.props;

        onPageSizeChange(value);
    }

    createOptionsArray(options = '') {
        return options.split(',').reduce(
            (acc, option) => {
                acc.push({
                    id: option,
                    name: option,
                    value: option,
                    label: option
                });

                return acc;
            },
            []
        );
    }

    render() {
        return (
            <CategoryProductPerPage
              { ...this.containerFunctions }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryProductPerPageContainer);
