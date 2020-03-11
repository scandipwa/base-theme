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

import {
    Children,
    createRef,
    cloneElement
} from 'react';
import PropTypes from 'prop-types';
import { ChildrenType } from 'Type/Common';

export class ClickOutside extends ExtensiblePureComponent {
    static propTypes = {
        onClick: PropTypes.func,
        children: ChildrenType
    };

    static defaultProps = {
        onClick: () => {},
        children: []
    };

    constructor(props) {
        super(props);

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
            ({ current }) => !current.contains(target)
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

export default middleware(ClickOutside, 'Component/ClickOutside/Component');
