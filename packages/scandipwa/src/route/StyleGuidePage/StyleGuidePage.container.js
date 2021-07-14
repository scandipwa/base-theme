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

import { updateProductDetails } from 'Store/Product/Product.action';
import { ProductType } from 'Type/ProductList';

import product from './product.json';
import StyleGuide from './StyleGuidePage.component';

export const ProductDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Product/Product.dispatcher'
);

/** @namespace Route/StyleGuide/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    product: state.ProductReducer.product
});

/** @namespace Route/StyleGuide/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    updateProductDetails: (product) => dispatch(updateProductDetails(product))
});

/** @namespace Route/StyleGuide/Container/StyleGuidePageContainer */
export class StyleGuidePageContainer extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        updateProductDetails: PropTypes.func.isRequired
    };

    containerFunctions = {
        fakeFunction: this.fakeFunction.bind(this)
    };

    componentDidMount() {
        const { updateProductDetails } = this.props;

        updateProductDetails(product);
    }

    containerProps = () => {
        const { product } = this.props;

        return {
            product
        };
    };

    fakeFunction() {
        return 'fake';
    }

    render() {
        return (
            <StyleGuide
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StyleGuidePageContainer);
