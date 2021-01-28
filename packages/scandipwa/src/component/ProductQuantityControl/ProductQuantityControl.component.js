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

import Field from 'Component/Field';

import './ProductQuantityControl.style.scss';

export class ProductQuantityControl extends PureComponent {
    static propTypes = {
        quantity: PropTypes.number,
        maxQuantity: PropTypes.number.isRequired,
        minQuantity: PropTypes.number.isRequired,
        setQuantity: PropTypes.func.isRequired
    };

    static defaultProps = {
        quantity: 1
    };

    render() {
        const {
            quantity,
            maxQuantity,
            minQuantity,
            setQuantity
        } = this.props;

        return (
            <div block="ProductQuantityControl">
                <Field
                  id="item_qty"
                  name="item_qty"
                  type="number"
                  value={ quantity }
                  max={ maxQuantity }
                  min={ minQuantity }
                  onChange={ setQuantity }
                />
            </div>
        );
    }
}

export default ProductQuantityControl;
