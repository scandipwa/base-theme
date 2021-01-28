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

import { updateProductQuantity } from 'Store/Product/Product.action';
import { ProductType } from 'Type/ProductList';
import {
    CONFIGURABLE,
    GROUPED
} from 'Util/Product';

import ProductAddToCart from './ProductAddToCart.component';

// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({
    setQuantity: (quantity) => dispatch(updateProductQuantity(quantity))
});

export const mapStateToProps = (state) => ({
    groupedProductQuantity: state.ProductReducer.groupedProductQuantity,
    device: state.ConfigReducer.device,
    quantity: state.ProductReducer.quantity
});

export class ProductAddToCardContainer extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        productOrVariant: PropTypes.object.isRequired,
        configurableVariantIndex: PropTypes.number.isRequired,
        areDetailsLoaded: PropTypes.bool.isRequired,
        parameters: PropTypes.objectOf(PropTypes.string).isRequired,
        selectedBundlePrice: PropTypes.number.isRequired,
        getLink: PropTypes.func.isRequired,
        quantity: PropTypes.number
    };

    static defaultProps = {
        quantity: 1
    };

    state = {
        groupedProductQuantity: {}
    };

    containerFunctions = {
        onProductValidationError: this.onProductValidationError.bind(this)
    };

    // static getDerivedStateFromProps(props) {
    //     const { quantity } = props;
    //     const minQty = ProductAddToCardContainer.getMinQuantity(props);
    //     const maxQty = ProductAddToCardContainer.getMaxQuantity(props);

    //     if (quantity < minQty) {
    //         return { quantity: minQty };
    //     }
    //     if (quantity > maxQty) {
    //         return { quantity: maxQty };
    //     }

    //     return null;
    // }

    onConfigurableProductError = this.onProductError.bind(this, this.configurableOptionsRef);

    onGroupedProductError = this.onProductError.bind(this, this.groupedProductsRef);

    onProductError(ref) {
        if (!ref) {
            return;
        }
        const { current } = ref;

        current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        current.classList.remove('animate');
        // eslint-disable-next-line no-unused-expressions
        current.offsetWidth; // trigger a DOM reflow
        current.classList.add('animate');
    }

    onProductValidationError(type) {
        switch (type) {
        case CONFIGURABLE:
            this.onConfigurableProductError();
            break;
        case GROUPED:
            this.onGroupedProductError();
            break;
        default:
            break;
        }
    }

    containerProps = () => ({
        groupedProductQuantity: this._getGroupedProductQuantity()
    });

    _getGroupedProductQuantity() {
        const { groupedProductQuantity } = this.state;
        return groupedProductQuantity;
    }

    render() {
        return (
            <ProductAddToCart
              { ...this.props }
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions }
            />
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProductAddToCardContainer);
