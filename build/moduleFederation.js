/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

// Takes package.json dependencies to share them all.
// const dependencies = require('../package.json').dependencies;
//
// // excludes some problematic modules from sharing
// const excludes = [
//     "react-draft-wysiwyg", "html-to-draftjs", "geostyler-geocss-parser", "@geosolutions/wkt-parser", "@turf/bbox-polygon"
// ];

const packageJson =  require('../package.json');

const requireVersionLibs = () => {
    return [
        "lodash",
        "url",
        "rxjs",
        "react",
        "react-dom",
        "react-redux",
        "recompose"
    ].reduce((sharedConfigs, lib) => {
        return {
            ...sharedConfigs,
            [lib]: {
                eager: true,
                singleton: true,
                requiredVersion: packageJson.dependencies[lib]
            }
        };
    }, {});
};


// the shared libraries, to use both in all federated modules (extensions/main product)
const shared = {
    "redux-observable": {
        eager: true,
        singleton: true
    },
    "lodash/curry": {
        eager: true,
        singleton: true
    },
    "react-intl": {
        eager: true,
        singleton: true
    },
    "bootstrap": {
        eager: true,
        singleton: true
    },
    "babel": {
        eager: true,
        singleton: true
    },
    ...requireVersionLibs()
};

/**
 * Exports the option and common tools to support module federation.
 */
module.exports = {
    // the plugin to use in main product
    plugin: new ModuleFederationPlugin({
        name: 'mapstore',
        library: { type: 'var', name: 'mapstore' },
        shared
    }),
    shared
};
