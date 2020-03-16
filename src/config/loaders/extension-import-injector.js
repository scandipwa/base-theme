const { getOptions } = require('loader-utils');
const path = require('path');
const { extensions } = require('../../../extensions.json');

module.exports = function injectImports(source) {
    const { magentoRoot, importAggregator } = getOptions(this);

    const extensionConfigImports = Object.entries(extensions).reduce(
        (importChain, extension) => {
            const [, singlePluginConfigPathList] = extension;

            return importChain + singlePluginConfigPathList.reduce(
                (singlePluginImportChain, singlePluginConfigPath) => {
                    const pathToConfigFile = path.join(magentoRoot, singlePluginConfigPath);

                    return `${singlePluginImportChain}${importAggregator}.push(require('${pathToConfigFile}').default);\n`;
                }, ''
            );
        }, ''
    );

    return source.replace(/\/\/ \* ScandiPWA extension importing magic comment! \*\//, extensionConfigImports);
};
