/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/leaflet/Layers');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const WMSUtils = require('../../../../utils/leaflet/WMSUtils');
const L = require('leaflet');
const objectAssign = require('object-assign');
const {isArray, isEqual} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');


var WMTS = require('../../../../utils/leaflet/WMTS');


L.tileLayer.wmts = function(urls, options) {
    return new WMTS(urls, options);
};

function wmtsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        service: "WMTS",
        request: "GetTile",
        tileMatrixPrefix:options.tileMatrixPrefix,
        layer: options.name,
        styles: options.style || "",
        format: options.format || 'image/png',
        tileMatrixSet: options.tileMatrixSet || CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        version: options.version || "1.0.0",
        tileSize: options.tileSize || 256,
        minx: options.minx ||-25.6640625,
        maxx: options.maxx || 48.1640625,
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS)
    }, options.params || {});
}

function getWMSURLs(urls) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmtsToLeafletOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        return L.tileLayer.wmts(urls, queryParameters);
    }
});