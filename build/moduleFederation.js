/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const dependencies = require('../package.json').dependencies;
const excludes = [
    "react-draft-wysiwyg", "html-to-draftjs", "geostyler-geocss-parser", "@geosolutions/wkt-parser", "@turf/bbox-polygon"
];
const includes = ['react-redux', 'react-bootstrap'];
const deps = Object.keys(dependencies)
    .filter(d => !excludes.includes(d))
    .reduce((acc, d) => ({
        ...acc,
        [d]: dependencies[d]
    }),
    {});

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
    plugin: new ModuleFederationPlugin({
        name: 'mapstore',
        library: { type: 'var', name: 'mapstore' },
        shared
    }),
    shared
};
