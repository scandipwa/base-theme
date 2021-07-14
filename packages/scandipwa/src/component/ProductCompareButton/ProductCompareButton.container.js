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

import ProductCompareButton from './ProductCompareButton.component';

export const ProductCompareDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/ProductCompare/ProductCompare.dispatcher'
);

/** @namespace Component/ProductCompareButton/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    comparedProducts: state.ProductCompareReducer.productIds
});

/** @namespace Component/ProductCompareButton/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    addProductToCompare: (productId) => ProductCompareDispatcher.then(
        ({ default: dispatcher }) => dispatcher.addProductToCompare(productId, dispatch)
    ),
    removeComparedProduct: (productId) => ProductCompareDispatcher.then(
        ({ default: dispatcher }) => dispatcher.removeComparedProduct(productId, dispatch)
    )
});

/** @namespace Component/ProductCompareButton/Container */
export class ProductCompareButtonContainer extends PureComponent {
    static propTypes = {
        productId: PropTypes.number,
        addProductToCompare: PropTypes.func.isRequired,
        removeComparedProduct: PropTypes.func.isRequired,
        comparedProducts: PropTypes.arrayOf(PropTypes.number).isRequired
    };

    static defaultProps = {
        productId: null
    };

    containerFunctions = {
        handleClick: this.handleClick.bind(this)
    };

    containerProps = () => ({
        isActive: this.isActive()
    });

    isActive() {
        const { comparedProducts, productId } = this.props;

        return comparedProducts.indexOf(productId) !== -1;
    }

    async handleClick(e) {
        const {
            productId,
            addProductToCompare,
            removeComparedProduct
        } = this.props;

        e.preventDefault();

        this.setState({ isLoading: true });

        if (this.isActive()) {
            await removeComparedProduct(productId);
        } else {
            await addProductToCompare(productId);
        }

        this.setState({ isLoading: false });
    }

    render() {
        return (
            <ProductCompareButton
              { ...this.props }
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductCompareButtonContainer);
