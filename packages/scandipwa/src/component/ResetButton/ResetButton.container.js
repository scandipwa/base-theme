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

import { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';

import { HistoryType, LocationType } from 'Type/Common';
import { setQueryParams } from 'Util/Url';

import ResetButton from './ResetButton.component';

/** @namespace Component/ResetButton/Container */
export class ResetButtonContainer extends PureComponent {
    static propTypes = {
        history: HistoryType.isRequired,
        location: LocationType.isRequired
    };

    containerProps = () => ({
        isContentFiltered: this.isContentFiltered()
    });

    containerFunctions = () => ({
        resetFilters: this.resetFilters
    });

    resetFilters = () => {
        const { location, history } = this.props;

        setQueryParams({
            customFilters: '',
            priceMin: '',
            priceMax: '',
            page: ''
        }, location, history);
    };

    isContentFiltered() {
        const { customFilters, priceMin, priceMax } = this.urlStringToObject();

        return !!(customFilters || priceMin || priceMax);
    }

    urlStringToObject() {
        const { location: { search = '' } } = this.props;

        return search.substr(1).split('&').reduce((acc, part) => {
            const [key, value] = part.split('=');

            return { ...acc, [key]: value };
        }, {});
    }

    render() {
        return (
            <ResetButton
              { ...this.props }
              { ...this.containerProps() }
              { ...this.containerFunctions() }
            />
        );
    }
}

export default withRouter(
    ResetButtonContainer
);
