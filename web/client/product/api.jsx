/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const getScriptPath = () => {
    const scriptEl = document.getElementById('ms2-api');
    return scriptEl && scriptEl.src && scriptEl.src.substring(0, scriptEl.src.lastIndexOf('/')) || 'https://dev.mapstore.geo-solutions.it/mapstore/dist';
};

const MapStore2 = require('../jsapi/MapStore2')
    .withPlugins(require('./apiPlugins'), {
        theme: {
            path: getScriptPath() + '/themes'
        },
        noLocalConfig: true,
        initialState: require('./appConfigEmbedded').initialState,
        translations: getScriptPath() + '/../translations'
    });
window.MapStore2 = MapStore2;
