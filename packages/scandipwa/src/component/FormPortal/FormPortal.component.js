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

import Form from 'Component/Form/Form.component';

/** @namespace Component/FormPortal/Component */
export class FormPortal extends Form {
    static propTypes = {
        ...Form.propTypes,
        name: PropTypes.string.isRequired
    };

    componentDidUpdate(prevProps) {
        const { id: prevId } = prevProps;
        const { id, name } = this.props;

        if (id !== prevId) {
            this.unsubscribeToFormPortalCollector(prevId, name);
            this.subscribeToFormPortalCollector(id, name);
        }
    }

    subscribeToFormPortalCollector(id, name) {
        if (window.formPortalCollector) {
            window.formPortalCollector.subscribe(id, this.collectFieldsInformation, name);
        }
    }

    unsubscribeToFormPortalCollector(id, name) {
        if (window.formPortalCollector) {
            window.formPortalCollector.unsubscribe(id, name);
        }
    }

    componentWillUnmount() {
        const { id, name } = this.props;
        this.unsubscribeToFormPortalCollector(id, name);
    }

    componentDidMount() {
        const { id, name } = this.props;
        if (!id) {
            throw new Error('Can not create a FormPortal without assignment to the Form ID!');
        }
        this.subscribeToFormPortalCollector(id, name);
    }

    render() {
        const { children } = this.state;

        return children;
    }
}

export default FormPortal;
