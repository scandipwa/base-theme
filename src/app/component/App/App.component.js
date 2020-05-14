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

import { Provider } from 'react-redux';
import { Provider as UnstatedProvider } from 'unstated';

import store from 'Store';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import Router from 'Component/Router';
import SomethingWentWrong from 'Route/SomethingWentWrong';
import SharedTransition from 'Component/SharedTransition';

export const history = createBrowserHistory({ basename: '/' });

export class App extends ExtensiblePureComponent {
    productionFunctions = [
        this.disableReactDevTools.bind(this),
        this.injectComment.bind(this)
    ];

    developmentFunctions = [
        this.enableHotReload.bind(this)
    ];

    rootComponents = [
        this.renderRouter.bind(this),
        this.renderSharedTransition.bind(this)
    ];

    contextProviders = [
        this.renderRedux.bind(this),
        this.renderUnStated.bind(this)
    ];

    state = {
        isSomethingWentWrong: false,
        errorDetails: {}
    };

    renderRedux(children) {
        return (
            <Provider store={ store } key="redux">
                { children }
            </Provider>
        );
    }

    renderUnStated(children) {
        return (
            <UnstatedProvider key="unstated">
                { children }
            </UnstatedProvider>
        );
    }

    enableHotReload() {
        module.hot.accept();
    }

    injectComment() {
        const comment = document.createComment('Powered by ScandiPWA (scandipwa.com)');
        document.querySelector('html').appendChild(comment);
    }

    /**
     * Disable react-dev-tools
     * @link https://github.com/facebook/react-devtools/issues/191#issuecomment-367905536
     */
    disableReactDevTools() {
        if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
            // eslint-disable-next-line no-restricted-syntax, fp/no-loops
            for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
                window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
            }
        }
    }

    configureAppBasedOnEnvironment() {
        const functionsToRun = process.env.NODE_ENV === 'production'
            ? this.productionFunctions
            : this.developmentFunctions;

        functionsToRun.forEach(func => func());
    }

    constructor(props) {
        super(props);

        this.configureAppBasedOnEnvironment();
    }

    handleErrorReset = () => {
        this.setState({ isSomethingWentWrong: false });
    };

    componentDidCatch(err, info) {
        this.setState({
            isSomethingWentWrong: true,
            errorDetails: { err, info }
        });
    }

    renderSharedTransition() {
        return (
            <SharedTransition key="transition" />
        );
    }

    renderRouter() {
        return (
            <Router key="router" />
        );
    }

    renderRootComponents = () => this.rootComponents.map(render => render());

    renderContextProviders() {
        const { isSomethingWentWrong } = this.state;

        const child = isSomethingWentWrong
            ? this.renderSomethingWentWrong
            : this.renderRootComponents;

        return this.contextProviders.reduce(
            (acc, render) => render(acc),
            [child()]
        );
    }

    renderSomethingWentWrong = () => {
        const { errorDetails } = this.state;

        return (
            <SomethingWentWrong
              onClick={ this.handleErrorReset }
              errorDetails={ errorDetails }
            />
        );
    };

    render() {
        return this.renderContextProviders();
    }
}

export default middleware(App, 'Component/App/Component');
