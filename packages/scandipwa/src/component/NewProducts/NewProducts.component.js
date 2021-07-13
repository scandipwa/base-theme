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
import { createRef, PureComponent } from 'react';

import ProductCard from 'Component/ProductCard';
import { ProductType } from 'Type/ProductList';
import CSS from 'Util/CSS';

import './NewProducts.style';

/** @namespace Component/NewProducts/Component */
export class NewProducts extends PureComponent {
    static propTypes = {
        products: PropTypes.arrayOf(ProductType),
        productsPerPage: PropTypes.number,
        productCardProps: PropTypes.object.isRequired,
        productCardFunctions: PropTypes.object.isRequired
    };

    static defaultProps = {
        products: Array.from({ length: 4 }, () => ({})),
        productsPerPage: 6
    };

    newProductsRef = createRef();

    renderProductCard = this.renderProductCard.bind(this);

    componentDidMount() {
        this.setStyles();
    }

    componentDidUpdate() {
        this.setStyles();
    }

    setStyles() {
        const { productsPerPage } = this.props;
        CSS.setVariable(this.newProductsRef, 'new-products-per-page-count', productsPerPage);
    }

    renderProductCard(product, i) {
        const {
            productCardProps,
            productCardFunctions
        } = this.props;

        return (
            <ProductCard
              key={ product.id || i }
              product={ product }
              { ...productCardProps }
              { ...productCardFunctions }
            />
        );
    }

    render() {
        const { products } = this.props;

        return (
            <section block="NewProducts" ref={ this.newProductsRef }>
                <h2>{ __('New Products') }</h2>
                <ul block="NewProducts" elem="Products">
                    { products.map(this.renderProductCard) }
                </ul>
            </section>
        );
    }
}

export default NewProducts;
