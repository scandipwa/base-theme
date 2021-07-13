/* eslint-disable react/forbid-dom-props */
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

import CategoryConfigurableAttributes from 'Component/CategoryConfigurableAttributes';
import CategoryPagination from 'Component/CategoryPagination';
import CategorySort from 'Component/CategorySort';
import ContentWrapper from 'Component/ContentWrapper';
import Field from 'Component/Field';
import Image from 'Component/Image';
import Notification from 'Component/Notification';
import ProductCard from 'Component/ProductCard';
import SearchItem from 'Component/SearchItem';
import gridFilled from 'Style/icons/grid-filled.svg';
import heartSelected from 'Style/icons/heart-selected.svg';
import heart from 'Style/icons/heart.svg';
import list from 'Style/icons/list.svg';
import lockWhite from 'Style/icons/lock-white.svg';
import userSelected from 'Style/icons/user-selected.svg';
import user from 'Style/icons/user.svg';
import { ProductType } from 'Type/ProductList';

import configurableOptions from './configurableOptions.json';
import {
    ADDITIONAL_ELEMENTS,
    BUTTONS, ICONS,
    ICONS_LIST,
    INPUTS,
    MENU_ITEMS_AND_LINKS,
    NOTIFICATION_ERROR_DATA,
    NOTIFICATION_INFO_DATA,
    NOTIFICATION_SUCCESS_DATA,
    PRODUCT_POD,
    TEXT_STYLES
} from './StyleGuidePage.config';

import './StyleGuidePage.style';

/** @namespace Base/Route/StyleGuide/Component/StyleGuideComponent */
export class StyleGuidePageComponent extends PureComponent {
    static propTypes = {
        product: ProductType.isRequired,
        fakeFunction: PropTypes.func.isRequired
    };

    renderMap = {
        [BUTTONS]: () => this.renderButtons(),
        [TEXT_STYLES]: () => this.renderTextStyles(),
        [MENU_ITEMS_AND_LINKS]: () => this.renderMenuItemsAndLinks(),
        [INPUTS]: () => this.renderInputs(),
        [ICONS]: () => this.renderIcons(),
        [PRODUCT_POD]: () => this.renderProductPod(),
        [ADDITIONAL_ELEMENTS]: () => this.renderAdditionalElements()
    };

    renderButtons() {
        return (
            <div block="StyleGuidePage" elem="Buttons">
                <h4 block="StyleGuidePage" elem="SubHeading">{ __('Transactional [default state + hover]') }</h4>
                <div>
                    <button block="Button" id="buttons">
                        { __('Button text') }
                    </button>
                    <button block="Button" id="hoverButtons" mods={ { isHovered: true } }>
                        { __('Button text') }
                    </button>
                </div>
                <div>
                    <button block="Button">
                        <Image src={ lockWhite } alt="lock" mix={ { block: 'StyleGuidePage', elem: 'Icon' } } />
                        { __('Button text') }
                    </button>
                    <button block="Button" mods={ { isHovered: true } }>
                        <Image src={ lockWhite } alt="lock" mix={ { block: 'StyleGuidePage', elem: 'Icon' } } />
                        { __('Button text') }
                    </button>
                </div>
                <h4 block="StyleGuidePage" elem="SubHeading">{ __('Supportive [default state + hover]') }</h4>
                <button block="Button" id="hollowButtons" mods={ { isHollow: true } }>
                    { __('Secondary button') }
                </button>
                <button block="Button" id="hollowHoverButtons" mods={ { isHollow: true, isHovered: true } }>
                    { __('Secondary button') }
                </button>
            </div>
        );
    }

    renderTextStyles() {
        return (
            <>
                <div block="StyleGuidePage" elem="DesktopTextStyles">
                    <h4 block="StyleGuidePage" elem="SubHeading">{ __('Desktop') }</h4>
                    <h1 id="h1">{ __('Heading 1') }</h1>
                    <h2 id="h2">{ __('Heading 2') }</h2>
                    <h3 id="h3">{ __('Heading 3') }</h3>
                    <p id="paragraph">
                        { __('The ') }
                        <a block="Link" href="/">{ __('website') }</a>
                        { __(' aims to achieve') }
                        <strong>{ __(' following ') }</strong>
                        { __('business goals:') }
                    </p>
                    <p block="caption" id="caption">
                        { __('The ') }
                        <a block="Link" href="/">{ __('website') }</a>
                        { __(' aims to achieve') }
                        <strong>{ __(' following ') }</strong>
                        { __('business goals:') }
                    </p>
                </div>
                <div block="StyleGuidePage" elem="MobileTextStyles">
                    <h4 block="StyleGuidePage" elem="SubHeading">{ __('Mobile') }</h4>
                    <h1 id="h1Mobile">{ __('Heading 1') }</h1>
                    <h2 id="h2Mobile">{ __('Heading 2') }</h2>
                    <h3 id="h3Mobile">{ __('Heading 3') }</h3>
                    <p id="paragraphMobile">
                        { __('The ') }
                        <a block="Link" href="/">{ __('website') }</a>
                        { __(' aims to achieve') }
                        <strong>{ __(' following ') }</strong>
                        { __('business goals:') }
                    </p>
                    <p block="caption" id="captionMobile">
                        { __('The ') }
                        <a block="Link" href="/">{ __('website') }</a>
                        { __(' aims to achieve') }
                        <strong>{ __(' following ') }</strong>
                        { __('business goals:') }
                    </p>
                </div>
            </>
        );
    }

    renderMenuItemsAndLinks() {
        return (
            <div block="StyleGuidePage" elem="MenuAndLinks">
                <h4 block="StyleGuidePage" elem="SubHeading">{ __('Default state + hover') }</h4>
                <div>
                    <span block="Menu" elem="ItemCaption" mods={ { type: 'main' } }>{ __('PRODUCTS') }</span>
                    <span block="Menu" elem="ItemCaption" mods={ { type: 'main', active: true } }>
                        { __('PRODUCTS') }
                    </span>
                </div>
                <div>
                    <a block="Link" href="/" id="link">
                        { __('CLICKABLE TEXT') }
                    </a>
                    <a block="StyleGuidePage" elem="ActiveLink" href="/" id="linkHover">
                        { __('CLICKABLE TEXT') }
                    </a>
                </div>
            </div>
        );
    }

    renderInputs() {
        return (
            <>
                <Field
                  type="select"
                  placeholder={ __('Select color') }
                  name="testSelect"
                />
                <Field
                  type="text"
                  id="input"
                  placeholder={ __('Your email address') }
                  validation={ ['notEmpty'] }
                />
            </>
        );
    }

    renderIcons() {
        return (
            <div block="StyleGuidePage" elem="Icons">
                { Object.entries(ICONS_LIST).map(
                    ([iconName, iconPath]) => (<Image src={ iconPath } alt={ iconName } key={ iconName } />)
                ) }
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Icons in header [default state + hover]') }
                </h4>
                <div>
                    <Image src={ user } alt="user" />
                    <Image src={ userSelected } alt="userSelected" />
                </div>
                <div>
                    <Image src={ heart } alt="heart" />
                    <Image src={ heartSelected } alt="heartSelected" />
                </div>
            </div>
        );
    }

    renderProductPod() {
        const { product } = this.props;

        return (
            <>
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Default state + hover') }
                </h4>
                <div block="StyleGuidePage" elem="ProductList">
                    <ProductCard product={ product } />
                </div>
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('In expanded search') }
                </h4>
                <SearchItem product={ product } />
            </>
        );
    }

    renderAdditionalElements() {
        const { fakeFunction } = this.props;

        const sortData = [
            {
                id: 'position',
                label: 'Position'
            },
            {
                id: 'name',
                label: 'Product Name'
            },
            {
                id: 'price',
                label: 'Price'
            }
        ];

        const isMatchingInfoFilter = true;

        return (
            <>
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Notification messages') }
                </h4>

                <Notification
                  onHideNotification={ fakeFunction }
                  lifeTime={ 9999999 }
                  notificationId="success"
                  notification={ NOTIFICATION_SUCCESS_DATA }
                  id="notificationSuccess"
                />
                <Notification
                  onHideNotification={ fakeFunction }
                  lifeTime={ 9999999 }
                  notificationId="error"
                  notification={ NOTIFICATION_ERROR_DATA }
                  id="notificationError"
                />
                <Notification
                  onHideNotification={ fakeFunction }
                  lifeTime={ 9999999 }
                  notificationId="info"
                  notification={ NOTIFICATION_INFO_DATA }
                  id="notificationInfo"
                />
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Pagination') }
                </h4>
                <CategoryPagination totalPages={ 10 } id="pagination" />
                <p>
                    { __('Product badges, also known as product labels or product stickers structuring'
                        + ' products in engaging categories e.g. sales, new, popular to initiate purchase journey'
                        + ' by highlighting key products.') }
                </p>
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Layered navigation') }
                </h4>
                <div block="StyleGuidePage" elem="LayeredNavigation">
                    <CategoryConfigurableAttributes
                      configurable_options={ configurableOptions }
                      getLink={ fakeFunction }
                      updateConfigurableVariant={ fakeFunction }
                      parameters={ {} }
                    />
                    <CategorySort
                      sortFields={ sortData }
                      onSortChange={ fakeFunction }
                      sortKey="name"
                      sortDirection="ASC"
                      isMatchingInfoFilter={ isMatchingInfoFilter }
                    />
                    <Image src={ gridFilled } alt="Grid Icon" />
                    <Image src={ list } alt="List Icon" />
                </div>
                <h4 block="StyleGuidePage" elem="SubHeading">
                    { __('Menu dropdown') }
                </h4>
            </>
        );
    }

    renderItem = (title, render) => (
        <div block="StyleGuidePage" elem="Component" key={ title }>
            <h1 block="StyleGuidePage" elem="Heading">{ __(title) }</h1>
            { render() }
        </div>
    );

    render() {
        return (
            <main block="StyleGuidePage">
                <ContentWrapper
                  wrapperMix={ { block: 'StyleGuidePage', elem: 'Wrapper' } }
                  label={ __('Style Guide page') }
                >
                    { Object.entries(this.renderMap).map(([key, item]) => this.renderItem(key, item)) }
                </ContentWrapper>
            </main>
        );
    }
}

export default StyleGuidePageComponent;
