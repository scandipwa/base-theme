/* eslint-disable react/jsx-no-useless-fragment */
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

/* eslint-disable consistent-return */
// Disabled due `domToReact` internal logic
import parser from 'html-react-parser';
import attributesToProps from 'html-react-parser/lib/attributes-to-props';
import domToReact from 'html-react-parser/lib/dom-to-react';
import PropTypes from 'prop-types';
import { lazy, PureComponent, Suspense } from 'react';

import Image from 'Component/Image';
import Link from 'Component/Link';
import Loader from 'Component/Loader/Loader.component';
import { hash } from 'Util/Request/Hash';

export const WidgetFactory = lazy(() => import(
    /* webpackMode: "lazy", webpackChunkName: "widget" */
    'Component/WidgetFactory'
));

/**
 * Html content parser
 * Component converts HTML strings to React components
 * @class Html
 * @namespace Component/Html/Component
 */
export class Html extends PureComponent {
    static propTypes = {
        content: PropTypes.string.isRequired
    };

    createdOutsideElements = {};

    rules = [
        {
            query: { name: ['widget'] },
            replace: this.replaceWidget
        },
        {
            query: { name: ['a'] },
            replace: this.replaceLinks
        },
        {
            query: { name: ['img'] },
            replace: this.replaceImages
        },
        {
            query: { name: ['input'] },
            replace: this.replaceInput
        },
        {
            query: { name: ['script'] },
            replace: this.replaceScript
        },
        {
            query: { name: ['style'] },
            replace: this.replaceStyle
        },
        {
            query: { name: ['table'] },
            replace: this.wrapTable
        }
    ];

    parserOptions = {
        replace: (domNode) => {
            const { data, name: domName, attribs: domAttrs } = domNode;

            // Let's remove empty text nodes
            if (data && !data.replace(/\u21b5/g, '').replace(/\s/g, '').length) {
                return <></>;
            }

            const rule = this.rules.find((rule) => {
                const { query: { name, attribs } } = rule;

                if (name && domName && name.indexOf(domName) !== -1) {
                    return true;
                } if (attribs && domAttrs) {
                    // eslint-disable-next-line fp/no-loops, fp/no-let
                    for (let i = 0; i < attribs.length; i++) {
                        const attrib = attribs[i];

                        if (typeof attrib === 'object') {
                            const queryAttrib = Object.keys(attrib)[0];

                            if (Object.prototype.hasOwnProperty.call(domAttrs, queryAttrib)) {
                                return domAttrs[queryAttrib].match(Object.values(attrib)[0]);
                            }
                        } else if (Object.prototype.hasOwnProperty.call(domAttrs, attrib)) {
                            return true;
                        }
                    }
                }

                return false;
            });

            if (rule) {
                const { replace } = rule;

                return replace.call(this, domNode);
            }
        }
    };

    attributesToProps(attribs) {
        const toCamelCase = (string) => string.replace(/_[a-z]/g, (match) => match.substr(1).toUpperCase());

        const convertPropertiesToValidFormat = (properties) => Object.entries(properties)
            .reduce((validProps, [key, value]) => {
                // eslint-disable-next-line no-restricted-globals
                if (!isNaN(value)) {
                    return { ...validProps, [toCamelCase(key)]: +value };
                }

                return { ...validProps, [toCamelCase(key)]: value };
            }, {});

        const properties = convertPropertiesToValidFormat(attribs);

        return attributesToProps(properties);
    }

    /**
     * Replace links to native React Router links
     * @param  {{ attribs: Object, children: Array }}
     * @return {void|JSX} Return JSX if link is allowed to be replaced
     * @memberof Html
     */
    replaceLinks({ attribs, children }) {
        const { href, ...attrs } = attribs;

        if (href) {
            const isAbsoluteUrl = (value) => new RegExp('^(?:[a-z]+:)?//', 'i').test(value);
            const isSpecialLink = (value) => new RegExp('^(sms|tel|mailto):', 'i').test(value);

            if (!isAbsoluteUrl(href) && !isSpecialLink(href)) {
                return (
                    <Link { ...attributesToProps({ ...attrs, to: href }) }>
                        { domToReact(children, this.parserOptions) }
                    </Link>
                );
            }
        }
    }

    /**
     * Replace img to React Images
     * @param  {{ attribs: Object }}
     * @return {void|JSX} Return JSX with image
     * @memberof Html
     */
    replaceImages({ attribs }) {
        const attributes = attributesToProps(attribs);

        if (attribs.src) {
            return <Image { ...attributes } />;
        }
    }

    /**
     * Replace input.
     * @param  {{ attribs: Object }}
     * @return {void|JSX} Return JSX with image
     * @memberof Html
     */
    replaceInput({ attribs }) {
        return <input { ...attributesToProps(attribs) } />;
    }

    /**
     * Wrap table in container
     *
     * @param attribs
     * @param children
     * @returns {*}
     */
    wrapTable({ attribs, children }) {
        return (
            <div block="Table" elem="Wrapper">
                <table { ...attributesToProps(attribs) }>
                    { domToReact(children, this.parserOptions) }
                </table>
            </div>
        );
    }

    /**
     * Insert corresponding widget
     *
     * @param {{ attribs: Object }} { attribs }
     * @returns {null|JSX} Return Widget
     * @memberof Html
     */
    replaceWidget({ attribs }) {
        return (
            <Suspense fallback={ <Loader isLoading /> }>
                <WidgetFactory { ...this.attributesToProps(attribs) } />
            </Suspense>
        );
    }

    replaceStyle(elem) {
        const { children } = elem;
        const elemHash = hash(elem);

        if (this.createdOutsideElements[elemHash]) {
            return <></>;
        }

        const style = document.createElement('style');

        if (children && children[0]) {
            style.appendChild(document.createTextNode(children[0].data));
        }

        document.head.appendChild(style);
        this.createdOutsideElements[elemHash] = true;

        return <></>;
    }

    replaceScript(elem) {
        const { attribs, children } = elem;
        const elemHash = hash(elem);

        if (this.createdOutsideElements[elemHash]) {
            return <></>;
        }

        const script = document.createElement('script');

        Object.entries(attribs).forEach(([attr, value]) => script.setAttribute(attr, value));

        if (children && children[0]) {
            script.appendChild(document.createTextNode(children[0].data));
        }

        document.head.appendChild(script);
        this.createdOutsideElements[elemHash] = true;

        return <></>;
    }

    render() {
        const { content } = this.props;

        return parser(content, this.parserOptions);
    }
}

export default Html;
