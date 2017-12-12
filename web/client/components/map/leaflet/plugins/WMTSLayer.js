/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/leaflet/Layers');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const L = require('leaflet');
const assign = require('object-assign');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
const WMTS = require('../../../../utils/leaflet/WMTS');
const {isArray, isObject, head} = require('lodash');

L.tileLayer.wmts = function(urls, options, matrixOptions) {
    return new WMTS(urls, options, matrixOptions);
};

function wmtsToLeafletOptions(options) {
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    const tileMatrixSet = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    return assign({
        layer: options.name,
        style: options.style || "",
        format: options.format || 'image/png',
        tileMatrixSet: tileMatrixSet,
        version: options.version || "1.0.0",
        tileSize: options.tileSize || 256,
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        maxZoom: options.maxZoom || 23,
        maxNativeZoom: options.maxNativeZoom || 18
    }, options.params || {});
}

function getWMSURLs(urls) {
    return urls.map((url) => url.split("\?")[0]);
}

function getMatrixIds(matrix, srs) {
    return isObject(matrix) && matrix[srs] || matrix;
}

const createLayer = options => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = wmtsToLeafletOptions(options) || {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS);
    return L.tileLayer.wmts(urls, queryParameters, {
        tileMatrixPrefix: options.tileMatrixPrefix || queryParameters.tileMatrixSet + ':' || srs + ':',
        originY: options.originY || 20037508.3428,
        originX: options.originX || -20037508.3428,
        ignoreErrors: options.ignoreErrors || false,
        matrixIds: options.matrixIds && getMatrixIds(options.matrixIds, queryParameters.tileMatrixSet || srs) || null,
        matrixSet: head(options.tileMatrixSet.filter(t => t['ows:Identifier'] === queryParameters.tileMatrixSet)) || null
    });
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (oldOptions.securityToken !== newOptions.securityToken) {
        return createLayer(newOptions);
    }
    return null;
};

Layers.registerType('wmts', {create: createLayer, update: updateLayer});
