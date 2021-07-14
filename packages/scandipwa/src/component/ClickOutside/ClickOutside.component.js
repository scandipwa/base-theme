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
import {
    Children,
    cloneElement,
    createRef,
    PureComponent
} from 'react';

import { ChildrenType } from 'Type/Common';

/** @namespace Component/ClickOutside/Component */
export class ClickOutside extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        children: ChildrenType
    };

    static defaultProps = {
        onClick: () => {},
        children: []
    };

    __construct(props) {
        super.__construct(props);

        const { children } = this.props;

        this.childrenRefs = Children.map(
            children,
            () => createRef()
        );
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick);
    }

    handleClick = ({ target }) => {
        const { onClick } = this.props;

        if (this.childrenRefs.every(
            (ref) => {
                const elementRef = ref.current?.overlayRef?.current || ref.current;

                return !elementRef.contains(target);
            }
        )) {
            onClick();
        }
    };

    render() {
        const { children } = this.props;

        return Children.map(children, (element, idx) => (
            cloneElement(element, { ref: this.childrenRefs[idx] })
        ));
    }
}

export default ClickOutside;
