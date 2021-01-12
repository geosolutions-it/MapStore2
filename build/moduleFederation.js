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

// the shared libraries, to use both in all federated modules (extensions/main product)
const shared = {
    "recompose": {
        eager: true,
        singleton: true
    },
    "url": {
        eager: true,
        singleton: true,
        requiredVersion: "0.11.0",
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
        singleton: true,
        requiredVersion: "5.1.1",
    },
    "babel": {
        eager: true,
        singleton: true,
    },
    "react-redux": {
        eager: true,
        singleton: true
    },
    "react": {
        eager: true,
        singleton: true,
        requiredVersion: "16.10.1",
    },
    'react-dom': {
        eager: true,
        singleton: true,
        requiredVersion: "16.10.1",
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
