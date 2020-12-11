/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
// TODO: a finest system should check package.json dependencies to share them all.
// here some code that started to do this (with some fixes for issues with module resolution).
// const dependencies = require('../package.json').dependencies;
// const excludes = [
//     "react-draft-wysiwyg", "html-to-draftjs", "geostyler-geocss-parser", "@geosolutions/wkt-parser", "@turf/bbox-polygon"
// ];
// const deps = Object.keys(dependencies)
//     .filter(d => !excludes.includes(d))
//     .reduce((acc, d) => ({
//         ...acc,
//         [d]: dependencies[d]
//     }),
//     {});

// the shared libraries, to use both in all federated modules (extensions/main product)
const shared = {
    "url": {
        eager: true,
        singleton: true
    },
    "redux-observable": {
        eager: true,
        singleton: true
    },
    "lodash": {
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
    "rxjs": {
        eager: true,
        singleton: true
    },
    "react-redux": {
        eager: true,
        singleton: true
    },
    react: {
        eager: true,
        singleton: true
    },
    'react-dom': {
        eager: true,
        singleton: true
    }
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
