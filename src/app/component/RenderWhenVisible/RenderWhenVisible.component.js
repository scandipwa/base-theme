import './RenderWhenVisible.style';

import { PureComponent } from 'react';
import VisibilitySensor from 'react-visibility-sensor';

import { ChildrenType } from 'Type/Common';

class RenderWhenVisible extends PureComponent {
    static propTypes = {
        children: ChildrenType.isRequired
    };

    state = {
        wasVisible: false
    };

    shouldRender(isVisible) {
        return isVisible || this.wasVisible;
    }

    handleVisibilityToggle = (isVisible) => {
        if (!this.wasVisible && isVisible) {
            this.setState({ wasVisible: true });
        }
    };

    renderVisibilitySensor() {
        return (
            <VisibilitySensor
              delayedCall
              partialVisibility={ ['top', 'bottom'] }
              minTopValue="1"
              onChange={ this.handleVisibilityToggle }
            >
                <div block="RenderWhenVisible" elem="Detector" />
            </VisibilitySensor>
        );
    }

    renderChildren() {
        const { children } = this.props;

        return children;
    }

    renderContent() {
        const { wasVisible } = this.state;

        if (!wasVisible) {
            return this.renderVisibilitySensor();
        }

        return this.renderChildren();
    }

    render() {
        return (
            <div block="RenderWhenVisible">
                { this.renderContent() }
            </div>
        );
    }
}

export default RenderWhenVisible;
