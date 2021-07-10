/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/scandipwa
 * @link https://github.com/scandipwa/scandipwa
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import Html from 'Component/Html';

import './StoreInPickUpStore.style';

/** @namespace Component/StoreInPickUpStore/Component */
export class StoreInPickUpStoreComponent extends PureComponent {
    static propTypes = {
        store: PropTypes.shape({
            city: PropTypes.string,
            country: PropTypes.string,
            description: PropTypes.string,
            name: PropTypes.string,
            phone: PropTypes.string,
            pickup_location_code: PropTypes.string,
            postcode: PropTypes.string,
            region: PropTypes.string,
            street: PropTypes.string
        }).isRequired,
        handleSelectStore: PropTypes.func.isRequired,
        isSelectedStore: PropTypes.bool.isRequired
    };

    renderActions() {
        const { isSelectedStore, handleSelectStore } = this.props;

        if (isSelectedStore) {
            return null;
        }

        return (
            <div block="StoreInPickUpStore" elem="StoreActions">
                <button
                  block="Button"
                  onClick={ handleSelectStore }
                  type="button"
                >
                    { __('Ship here') }
                </button>
            </div>
        );
    }

    render() {
        const {
            store: {
                city,
                country,
                description,
                name,
                phone,
                postcode,
                region,
                street
            }
        } = this.props;

        return (
            <div block="StoreInPickUpStore" elem="Store">
                <div block="StoreInPickUpStore" elem="StoreData">
                    <h3>{ name }</h3>
                    <p>{ street }</p>
                    <p>{ `${city}, ${region} ${postcode}` }</p>
                    <p>{ country }</p>
                    <a href={ `tel:${phone}` }>{ phone }</a>
                    <p>
                        <Html content={ description || '' } />
                    </p>
                </div>
                <div block="StoreInPickUpStore" elem="StoreActions">
                    { this.renderActions() }
                </div>
            </div>
        );
    }
}

export default StoreInPickUpStoreComponent;
