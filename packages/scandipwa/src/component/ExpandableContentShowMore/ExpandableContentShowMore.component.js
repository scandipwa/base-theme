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

import { ChildrenType } from 'Type/Common';

import './ExpandableContentShowMore.style';

/** @namespace Component/ExpandableContentShowMore/Component */
export class ExpandableContentShowMore extends PureComponent {
    static propTypes = {
        showElemCount: PropTypes.number,
        children: ChildrenType.isRequired,
        isMobile: PropTypes.bool.isRequired
    };

    static defaultProps = {
        showElemCount: 3
    };

    __construct(props) {
        super.__construct(props);

        this.ref = createRef();

        const { showElemCount, children: { length } } = this.props;

        this.expandableRef = createRef();
        this.expandableContentHeight = 'auto';

        this.state = {
            isOpen: length > showElemCount,
            isExpanding: false
        };
    }

    componentDidMount() {
        const { isOpen } = this.state;

        if (isOpen) {
            if (this.expandableRef.current) {
                this.expandableContentHeight = this.expandableRef.current.getBoundingClientRect().height;
            }
            this.setState({ isOpen: false });
        }
    }

    componentDidUpdate(prevProps) {
        const { children: { length: prevChildrenLength } } = prevProps;
        const { children: { length: currentChildrenLength } } = this.props;

        if (prevChildrenLength !== currentChildrenLength) {
            if (this.expandableRef.current) {
            // eslint-disable-next-line react/no-did-update-set-state
                this.setState({ isOpen: true }, () => {
                    this.expandableRef.current.style.height = 'auto';
                });
            }
        }

        const { isExpanding } = this.state;

        if (isExpanding) {
            const ONE_SECOND_IN_MS = 1000;
            const transitionDurationCSStoMS = window
                .getComputedStyle(this.expandableRef.current)
                .getPropertyValue('transition-duration')
                .slice(0, -1) * ONE_SECOND_IN_MS;

            setTimeout(() => this.setState({ isExpanding: false }),
                transitionDurationCSStoMS);
        }

        const { children: { length } } = this.props;
        const { children: { length: prevLength } } = prevProps;

        if (length !== prevLength) {
            this.getExpandableContentHeight();
        }
    }

    getExpandableContentHeight() {
        const { isOpen } = this.state;
        const { showElemCount, children: { length } } = this.props;

        if (isOpen && length <= showElemCount) {
            this.setState({ isOpen: false });

            return;
        }

        this.expandableContentHeight = 'auto';
        this.setState({ isOpen: true }, () => {
            if (this.expandableRef.current) {
                this.expandableContentHeight = this.expandableRef.current.getBoundingClientRect().height;
            }
            this.setState({ isOpen: false });
        });
    }

    handleShowAllButtonClick = () => {
        const { isExpanding } = this.state;

        if (!isExpanding) {
            this.setState(({ isOpen }) => ({ isOpen: !isOpen, isExpanding: true }));
        }
    };

    renderShowAllButton() {
        const { showElemCount, children: { length } } = this.props;

        if (length <= showElemCount) {
            return null;
        }

        const { isOpen } = this.state;

        const mods = isOpen ? { state: 'isOpen' } : {};

        return (
            <button
              onClick={ this.handleShowAllButtonClick }
              mix={ { block: 'Button', mods: { likeLink: true } } }
              block="ExpandableContentShowMore"
              elem="ShowAllButton"
              mods={ mods }
            >
                { isOpen ? __('Show less') : __('Show more') }
            </button>
        );
    }

    renderExpandableChildren() {
        const { isOpen, isExpanding } = this.state;
        const { children, showElemCount } = this.props;

        const child = (isOpen || isExpanding) ? children.slice(showElemCount) : null;
        const style = {
            height: isOpen ? this.expandableContentHeight : 0
        };

        return (
            <div
              ref={ this.expandableRef }
              block="ExpandableContentShowMore"
              elem="ExpandableChildren"
              style={ style }
            >
                { child }
            </div>
        );
    }

    renderContent() {
        const { children, showElemCount } = this.props;

        const child = children.slice(0, showElemCount);

        return (
            <>
                { child }
                { this.renderExpandableChildren() }
                { this.renderShowAllButton() }
            </>
        );
    }

    render() {
        const { children, isMobile } = this.props;

        if (isMobile) {
            return children;
        }

        return (
            <div block="ExpandableContentShowMore" ref={ this.ref }>
                { this.renderContent() }
            </div>
        );
    }
}
export default ExpandableContentShowMore;
