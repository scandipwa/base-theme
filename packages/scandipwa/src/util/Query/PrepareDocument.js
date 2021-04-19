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

export const MUTATION_TYPE = 'mutation';
export const QUERY_TYPE = 'query';

/**
 * Prepare request body string from query list (all entries must be instances of Query).
 * @param  {Array<Field>} queries
 * @return {String} JSON String, format: `{"query":"{alias: queryName (attr:key) { field1, field2 }}"}`
 * @namespace Util/Query/PrepareDocument/prepareFieldString
 */
export const prepareFieldString = (rootField, accArgs = {}) => {
    const {
        alias, name, args, children
    } = rootField;

    const resolvedArgs = args.reduce((acc, arg) => {
        const { name, type, value } = arg;

        if (!accArgs[name]) {
            // eslint-disable-next-line no-param-reassign
            accArgs[name] = [];
        }

        // add type and value of the argument into argument accumulator,
        // we will need this value when building the query doc and variables
        const index = accArgs[name].push([type, value]);

        // join each argument as "name:$var_1"
        return [...acc, `${name}:$${name}_${index}`];
    }, []);

    // join arguments, wrap into "()" and join with ","
    const formattedArgs = resolvedArgs.length ? `(${resolvedArgs.join(',')})` : '';

    // join child fields with ","
    const formattedChildren = children.map((field) => prepareFieldString(field, accArgs)).join(',');

    // wrap body with "{}"
    const body = children.length ? `{${formattedChildren}}` : '';

    // format like "alias:name(arg: $var){field1,field2}"
    return `${alias}${name}${formattedArgs}${body}`;
};

/** @namespace Util/Query/PrepareDocument/prepareRequest */
export const prepareRequest = (fields, type) => {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];

    if (type !== MUTATION_TYPE && type !== QUERY_TYPE) {
        // we only support Mutation and Query types
        throw new Error(`GraphQL document type "${type}" is not supported.`);
    }

    const variables = {};
    const accArgs = {};

    // prepare fields from each field passed
    const fieldStrings = fieldsArray.map((field) => prepareFieldString(field, accArgs)).join(',');

    // go through argument accumulator collected in "prepareFieldString", join values
    // into the format "$var:Type" and append variable value to variables field
    const resolvedArgs = Object.entries(accArgs).reduce((acc, [name, dataArray]) => {
        dataArray.forEach(([type, value], i) => {
            const variable = `${name}_${i + 1}`;
            acc.push(`$${variable}:${type}`);
            variables[variable] = value;
        });

        return acc;
    }, []);

    // Wrap arguments with "()" and join using ","
    const formattedArgs = resolvedArgs.length ? `(${resolvedArgs.join(',')})` : '';

    return {
        // format like "query($var_1:String){test(arg: $var_1){id}}"
        query: `${type}${formattedArgs}{${fieldStrings}}`,
        variables
    };
};

/** @namespace Util/Query/PrepareDocument/prepareMutation */
export const prepareMutation = (mutations) => prepareRequest(mutations, MUTATION_TYPE);

/** @namespace Util/Query/PrepareDocument/prepareQuery */
export const prepareQuery = (queries) => prepareRequest(queries, QUERY_TYPE);
