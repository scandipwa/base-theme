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

import TextPlaceholder from 'Component/TextPlaceholder';
import { ChildrenType, MixType } from 'Type/Common';
import { getFixedElementHeight } from 'Util/CSS';

import './ExpandableContent.style';
/** @namespace Component/ExpandableContent/Component */
export class ExpandableContent extends PureComponent {
    static propTypes = {
        isContentExpanded: PropTypes.bool,
        isArrow: PropTypes.bool,
        heading: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        children: ChildrenType.isRequired,
        mix: MixType.isRequired,
        mods: PropTypes.object,
        onClick: (props, propName, componentName) => {
            const propValue = props[propName];
            if (propValue === null) {
                return;
            }
            if (typeof propValue === 'function') {
                return;
            }
            throw new Error(`${componentName} only accepts null or string`);
        }
    };

    static defaultProps = {
        heading: '',
        isContentExpanded: false,
        isArrow: false,
        onClick: null,
        mods: {}
    };

    expandableContentRef = createRef();

    __construct(props) {
        super.__construct(props);
        const { isContentExpanded } = this.props;
        this.state = {
            isContentExpanded,
            // eslint-disable-next-line react/no-unused-state
            prevIsContentExpanded: isContentExpanded
        };
    }

    static getDerivedStateFromProps({ isContentExpanded }, { prevIsContentExpanded }) {
        if (isContentExpanded !== prevIsContentExpanded) {
            return {
                prevIsContentExpanded: isContentExpanded,
                isContentExpanded
            };
        }

        return null;
    }

    scrollToExpandedContent() {
        const { isContentExpanded } = this.state;
        const elem = this.expandableContentRef && this.expandableContentRef.current;

        if (isContentExpanded && !elem) {
            return;
        }

        const elemToWindowTopDist = elem.getBoundingClientRect().top;
        const windowToPageTopDist = document.body.getBoundingClientRect().top;
        const topToElemDistance = elemToWindowTopDist - windowToPageTopDist;
        const {
            total: totalFixedElementHeight,
            bottom: bottomFixedElementHeight
        } = getFixedElementHeight();

        const elemMaxOffsetHeight = screen.height > elem.offsetHeight + bottomFixedElementHeight
            ? elem.offsetHeight
            : screen.height - totalFixedElementHeight;
        const scrollTo = topToElemDistance - (screen.height - bottomFixedElementHeight - elemMaxOffsetHeight);

        // checking if button is in a view-port
        if (-windowToPageTopDist >= scrollTo) {
            return;
        }

        window.scrollTo({ behavior: 'smooth', top: scrollTo });
    }

    toggleExpand = () => {
        const { onClick } = this.props;
        if (onClick) {
            onClick();

            return;
        }
        this.setState(
            ({ isContentExpanded }) => ({ isContentExpanded: !isContentExpanded }),
            () => this.scrollToExpandedContent()
        );
    };

    renderButton() {
        const { isContentExpanded } = this.state;
        const {
            heading,
            mix,
            isArrow
        } = this.props;

        return (
            <div
              role="button"
              tabIndex={ 0 }
              block="ExpandableContent"
              elem="Button"
              mods={ { isContentExpanded } }
              mix={ { ...mix, elem: 'ExpandableContentButton' } }
              onClick={ this.toggleExpand }
              onKeyDown={ this.toggleExpand }
            >
                <div
                  block="ExpandableContent"
                  elem="Heading"
                  mix={ { ...mix, elem: 'ExpandableContentHeading' } }
                >
                    { typeof heading === 'string' ? (
                        <TextPlaceholder content={ heading } length="medium" />
                    ) : (
                        heading
                    ) }
                </div>
                <div
                  block="ExpandableContent"
                  elem={ isArrow ? 'ToggleArrow' : 'ToggleButton' }
                  mods={ { isContentExpanded } }
                />
            </div>
        );
    }

    renderContent() {
        const { children, mix } = this.props;
        const { isContentExpanded } = this.state;
        const mods = { isContentExpanded };

        return (
            <div
              block="ExpandableContent"
              elem="Content"
              mods={ mods }
              mix={ { ...mix, elem: 'ExpandableContentContent', mods } }
            >
                { children }
            </div>
        );
    }

    render() {
        const { mix, mods } = this.props;

        return (
            <article
              block="ExpandableContent"
              mix={ mix }
              mods={ mods }
              ref={ this.expandableContentRef }
            >
                { this.renderButton() }
                { this.renderContent() }
            </article>
        );
    }
}
export default ExpandableContent;
