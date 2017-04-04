/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/cesium/Layers');
var ConfigUtils = require('../../../../utils/ConfigUtils');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const WMTSUtils = require('../../../../utils/WMTSUtils');
var Cesium = require('../../../../libs/cesium');
var assign = require('object-assign');
var {isObject, isArray, slice, get} = require('lodash');

function getWMTSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}


function splitUrl(originalUrl) {
    let url = originalUrl;
    let queryString = "";
    if (originalUrl.indexOf('?') !== -1) {
        url = originalUrl.substring(0, originalUrl.indexOf('?') + 1);
        if (originalUrl.indexOf('%') !== -1) {
            url = decodeURIComponent(url);
        }
        queryString = originalUrl.substring(originalUrl.indexOf('?') + 1);
    }
    return {url, queryString};
}

function WMTSProxy(proxy) {
    this.proxy = proxy;
}

const isValidTile = (tileMatrixSet) => (x, y, level) =>
    tileMatrixSet && tileMatrixSet[level] &&
    x <= parseInt(get(tileMatrixSet[level], "ranges.cols.max"), 10) &&
    x >= parseInt(get(tileMatrixSet[level], "ranges.cols.min"), 10) &&
    y <= parseInt(get(tileMatrixSet[level], "ranges.rows.max"), 10) &&
    y >= parseInt(get(tileMatrixSet[level], "ranges.rows.min"), 10);


WMTSProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return this.proxy + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return url + queryString;
};
function getMatrixIds(matrix = [], srs) {
    return (isObject(matrix) && matrix[srs] || matrix).map((el) => el.identifier);
}

function getDefaultMatrixId(options) {
    let matrixIds = new Array(30);
    for (let z = 0; z < 30; ++z) {
        // generate matrixIds arrays for this WMTS
        matrixIds[z] = options.tileMatrixPrefix + z;
    }
    return matrixIds;
}

const limitMatrix = (matrix, len) => {
    if (matrix.length > len) {
        return slice(matrix, 0, len);
    }
    if (matrix.length < len) {
        return matrix.concat(new Array(len - matrix.length));
    }
    return matrix;
};

const getTilingSchema = (srs) => {
    if (srs.indexOf("EPSG:4326") >= 0) {
        return new Cesium.GeographicTilingScheme();
    } else if (srs.indexOf("EPSG:3857") >= 0) {
        return new Cesium.WebMercatorTilingScheme();
    }
};
function wmtsToCesiumOptions(options) {
    const srs = CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:4326', options.allowedSRS);
    const tileMatrixSet = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    const matrixIds = limitMatrix(options.matrixIds && getMatrixIds(options.matrixIds, srs) || getDefaultMatrixId(options));

    // var opacity = options.opacity !== undefined ? options.opacity : 1;
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        let useCORS = [];
        if (isObject(proxyUrl)) {
            useCORS = proxyUrl.useCORS || [];
            proxyUrl = proxyUrl.url;
        }
        let url = options.url;
        if (isArray(url)) {
            url = url[0];
        }
        const isCORS = useCORS.reduce((found, current) => found || url.indexOf(current) === 0, false);
        proxy = !isCORS && proxyUrl;
    }
    // NOTE: can we use opacity to manage visibility?
    const isValid = isValidTile(options.matrixIds && options.matrixIds[tileMatrixSet]);
    return assign({
        url: getWMTSURLs(isArray(options.url) ? options.url : [options.url]), // TODO subdomain support, if use {s} switches to RESTFul mode
        format: options.format || 'image/png',
        isValid,
        // tileDiscardPolicy: {
        //    isReady: () => true,
        //    shouldDiscardImage: ({x, y, level}) => !isValid(x, y, level)
        // }, // not supported yet
        layer: options.name,
        style: options.style || "",
        tileMatrixLabels: matrixIds,
        tilingScheme: getTilingSchema(srs, options.matrixIds[options.tileMatrixSet]),
        proxy: proxy && new WMTSProxy(proxy) || new NoProxy(),
        enablePickFeatures: false,
        tileWidth: options.tileWidth || options.tileSize || 256,
        tileHeight: options.tileHeight || options.tileSize || 256,
        tileMatrixSetID: tileMatrixSet,
        maximumLevel: 30
    });
}

const createLayer = (options) => {
    let layer;
    const cesiumOptions = wmtsToCesiumOptions(options);
    layer = new Cesium.WebMapTileServiceImageryProvider(cesiumOptions);
    const orig = layer.requestImage;
    layer.requestImage = (x, y, level) => cesiumOptions.isValid(x, y, level) ? orig.bind(layer)( x, y, level) : new Promise( () => undefined);
    layer.updateParams = (params) => {
        const newOptions = assign({}, options, {
            params: assign({}, options.params || {}, params)
        });
        return createLayer(newOptions);
    };
    return layer;
};

Layers.registerType('wmts', createLayer);
