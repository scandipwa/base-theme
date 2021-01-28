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
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';

import { ProductType } from 'Type/ProductList';

import {
    BOTTOM_SHEET_BORDER_RADIUS,
    BOTTOM_SHEET_BOTTOM_MARGIN,
    BOTTOM_SHEET_OVERFLOW_HEIGHT
} from './ProductBottomSheet.config';

import './ProductBottomSheet.style.scss';

export class ProductBottomSheet extends PureComponent {
    static propTypes = {
        children: PropTypes.any.isRequired,
        product: ProductType.isRequired,
        isBottomSheetOpen: PropTypes.bool.isRequired,
        setBottomSheetOpen: PropTypes.func.isRequired
    };

    closeBottomSheet = () => {
        const { isBottomSheetOpen, setBottomSheetOpen } = this.props;
        if (isBottomSheetOpen) {
            setBottomSheetOpen(false);
        }
    };

    render() {
        const {
            children, product, isBottomSheetOpen, setBottomSheetOpen
        } = this.props;

        const style = {
            zIndex: 99
        };
        const bodyStyle = {
            transition: 'border-top-left-radius,border-top-right-radius 0.5s ease',
            borderTopLeftRadius: isBottomSheetOpen ? 0 : BOTTOM_SHEET_BORDER_RADIUS,
            borderTopRightRadius: isBottomSheetOpen ? 0 : BOTTOM_SHEET_BORDER_RADIUS,
            marginBottom: BOTTOM_SHEET_BOTTOM_MARGIN,
            maxHeight: 'calc(var(--vh, 1vh) * 100 - 120px)'
        };

        return (
            <>
                <div block="ProductBottomSheet" elem="HeaderPlaceholder" mods={ { isBottomSheetOpen } } />
                <SwipeableBottomSheet
                  overflowHeight={ BOTTOM_SHEET_OVERFLOW_HEIGHT }
                  open={ isBottomSheetOpen }
                  onChange={ setBottomSheetOpen }
                  fullscreen
                  style={ style }
                  bodyStyle={ bodyStyle }
                >
                    <div block="ProductBottomSheet" elem="Wrapper">
                        <span block="ProductBottomSheet" elem="PillWrapper">
                            <span block="ProductBottomSheet" elem="Pill" />
                        </span>
                        <div ref={ this.titleRef } block="ProductBottomSheet" elem="Title">
                            { product.name }
                        </div>
                        { children }
                    </div>
                </SwipeableBottomSheet>
            </>
        );
    }
}

export default ProductBottomSheet;
