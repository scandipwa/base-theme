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
import { connect } from 'react-redux';

import { MyAccountMyWishlistContainer } from 'Component/MyAccountMyWishlist/MyAccountMyWishlist.container';
import WishlistQuery from 'Query/Wishlist.query';
import { toggleBreadcrumbs } from 'Store/Breadcrumbs/Breadcrumbs.action';
import { updateNoMatch } from 'Store/NoMatch/NoMatch.action';
import { showNotification } from 'Store/Notification/Notification.action';
import { MatchType } from 'Type/Common';
import { getIndexedProduct } from 'Util/Product';
import { prepareQuery } from 'Util/Query';
import { executeGet } from 'Util/Request';
import { FIVE_MINUTES_IN_SECONDS } from 'Util/Request/QueryDispatcher';

import WishlistShared from './WishlistSharedPage.component';

export const BreadcrumbsDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Breadcrumbs/Breadcrumbs.dispatcher'
);
export const WishlistDispatcher = import(
    /* webpackMode: "lazy", webpackChunkName: "dispatchers" */
    'Store/Wishlist/Wishlist.dispatcher'
);

/** @namespace Route/WishlistSharedPage/Container/mapDispatchToProps */
export const mapDispatchToProps = (dispatch) => ({
    clearWishlist: () => WishlistDispatcher.then(
        ({ default: dispatcher }) => dispatcher.clearWishlist(dispatch)
    ),
    moveWishlistToCart: (sharingCode) => WishlistDispatcher.then(
        ({ default: dispatcher }) => dispatcher.moveWishlistToCart(dispatch, sharingCode)
    ),
    showNotification: (message) => dispatch(showNotification('success', message)),
    showError: (message) => dispatch(showNotification('error', message)),
    showNoMatch: () => dispatch(updateNoMatch(true)),
    toggleBreadcrumbs: (visibility) => dispatch(toggleBreadcrumbs(visibility))
});

/** @namespace Route/WishlistSharedPage/Container/wishlistSharedContainer */
export class WishlistSharedPageContainer extends MyAccountMyWishlistContainer {
    static propTypes = {
        match: MatchType.isRequired,
        showError: PropTypes.func.isRequired,
        showNoMatch: PropTypes.func.isRequired,
        toggleBreadcrumbs: PropTypes.func.isRequired
    };

    state = {
        creatorsName: '',
        wishlistItems: {},
        isWishlistLoading: true,
        isLoading: false
    };

    componentDidMount() {
        this.requestWishlist();
        this.toggleBreadcrumbs(false);
    }

    toggleBreadcrumbs(visibility) {
        const { toggleBreadcrumbs } = this.props;
        toggleBreadcrumbs(visibility);
    }

    componentDidUpdate(prevProps) {
        const { match: { params: { code } } } = prevProps;

        if (this.getCode() !== code) {
            this.requestWishlist();
        }
    }

    setLoading(isLoading = true) {
        this.setState({ isWishlistLoading: isLoading, isLoading });
    }

    addAllToCart = () => {
        const { showError, moveWishlistToCart } = this.props;
        const sharingCode = this.getCode();

        this.setState({ isLoading: true });

        return moveWishlistToCart(sharingCode).then(
            /** @namespace Route/WishlistSharedPage/Container/moveWishlistToCartThen */
            () => this.showNotificationAndRemoveLoading('Wishlist moved to cart'),
            /** @namespace Route/WishlistSharedPage/Container/moveWishlistToCartCatch */
            ([{ message }]) => showError(message)
        );
    };

    requestWishlist() {
        const { showError, showNoMatch } = this.props;

        const code = this.getCode();
        const query = prepareQuery([WishlistQuery.getWishlistQuery(code)]);

        this.setLoading();

        executeGet(query, 'SharedWishlist', FIVE_MINUTES_IN_SECONDS).then(
            /** @namespace Route/WishlistSharedPage/Container/requestWishlistExecuteGetThen */
            ({ wishlist, wishlist: { items_count, creators_name: creatorsName } = {} }) => {
                if (!items_count) {
                    this.setLoading(false);
                    return;
                }

                const wishlistItems = wishlist.items.reduce((prev, wishlistItem) => {
                    const {
                        id,
                        sku,
                        product,
                        description,
                        qty: quantity
                    } = wishlistItem;

                    const indexedProduct = getIndexedProduct(product);

                    return {
                        ...prev,
                        [id]: {
                            quantity,
                            wishlist: {
                                id,
                                sku,
                                quantity,
                                description
                            },
                            ...indexedProduct
                        }
                    };
                }, {});

                this.setState({
                    creatorsName,
                    wishlistItems,
                    isLoading: false,
                    isWishlistLoading: false
                });
            },
            /** @namespace Route/WishlistSharedPage/Container/executeGetCatch */
            ([{ message }]) => {
                showError(message);
                showNoMatch();
            }
        );
    }

    _getIsWishlistEmpty = () => {
        const { wishlistItems } = this.state;
        return Object.entries(wishlistItems).length <= 0;
    };

    getCode() {
        const { match: { params: { code } } } = this.props;
        return code;
    }

    render() {
        return (
            <WishlistShared
              { ...this.props }
              { ...this.state }
              { ...this.containerProps() }
              { ...this.containerFunctions() }
            />
        );
    }
}

/** @namespace Route/WishlistSharedPage/Container/mapStateToProps */
// eslint-disable-next-line no-unused-vars
export const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(WishlistSharedPageContainer);
