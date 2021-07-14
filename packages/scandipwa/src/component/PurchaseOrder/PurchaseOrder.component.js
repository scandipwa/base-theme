/* eslint-disable no-console */
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

import Field from 'Component/Field/Field.container';
import FormPortal from 'Component/FormPortal/FormPortal.component';

import './PurchaseOrder.style';

/** @namespace Component/PurchaseOrder/Component */
export class PurchaseOrder extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired
    };

    render() {
        const { id } = this.props;

        return (
            <FormPortal
              id={ id }
              name="PurchaseOrder"
            >
                <Field
                  type="text"
                  id="purchaseOrderNumber"
                  name="purchaseOrderNumber"
                  validation={ ['notEmpty'] }
                  placeholder={ __('Purchase Order Number') }
                  mix={ { block: 'PurchaseOrderNumber', elem: 'Input' } }
                  aria-label={ __('Purchase Order Number') }
                />
            </FormPortal>
        );
    }
}

export default PurchaseOrder;
