/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import ConfigUtils from '../../../../utils/ConfigUtils';
import {
    getProxyUrl
} from '../../../../utils/ProxyUtils';
import * as WMTSUtils from '../../../../utils/WMTSUtils';
import { creditsToAttribution, getAuthenticationParam, getURLs } from '../../../../utils/LayersUtils';
import { isEqual, isObject, isArray, slice, get, head} from 'lodash';

import urlParser from 'url';
import { isVectorFormat } from '../../../../utils/VectorTileUtils';
import { getCredentials } from '../../../../utils/SecurityUtils';

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
    tileMatrixSet && tileMatrixSet[level] && !tileMatrixSet[level].ranges ||
    (x <= parseInt(get(tileMatrixSet[level], "ranges.cols.max"), 10) &&
    x >= parseInt(get(tileMatrixSet[level], "ranges.cols.min"), 10) &&
    y <= parseInt(get(tileMatrixSet[level], "ranges.rows.max"), 10) &&
    y >= parseInt(get(tileMatrixSet[level], "ranges.rows.min"), 10));


WMTSProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return getProxyUrl() + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return url + queryString;
};
function getMatrixIds(matrix = [], setId) {
    return ((isObject(matrix) && matrix[setId]) || isArray(matrix) && matrix || []).map((el) => el.identifier);
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
    return null;
};

const getMatrixOptions = (options, srs) => {
    const tileMatrixSet = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
    const matrixIds = limitMatrix(options.matrixIds && getMatrixIds(options.matrixIds, tileMatrixSet) || getDefaultMatrixId(options));
    return {tileMatrixSet, matrixIds};
};

function wmtsToCesiumOptions(_options) {
    const options = WMTSUtils.parseTileMatrixSetOption(_options);
    let srs = 'EPSG:4326';
    let { tileMatrixSet: tileMatrixSetID, matrixIds} = getMatrixOptions(options, srs);
    if (matrixIds.length === 0) {
        srs = 'EPSG:3857';
        const matrixOptions = getMatrixOptions(options, srs);
        tileMatrixSetID = matrixOptions.tileMatrixSet;
        matrixIds = matrixOptions.matrixIds;
    }
    // NOTE: can we use opacity to manage visibility?
    // var opacity = options.opacity !== undefined ? options.opacity : 1;
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = options.forceProxy;
    }
    const isValid = isValidTile(options.matrixIds && options.matrixIds[tileMatrixSetID]);
    const queryParametersString = urlParser.format({ query: {...getAuthenticationParam(options)}});
    const cr = options.credits;
    const credit = cr ? new Cesium.Credit(creditsToAttribution(cr)) : '';

    let headersOpts;
    if (options.security) {
        const storedProtectedService = getCredentials(options.security?.sourceId) || {};
        headersOpts = {
            headers: {
                "Authorization": `Basic ${btoa(storedProtectedService.username + ":" + storedProtectedService.password)}`
            }
        };
    }
    return Object.assign({
        // TODO: multi-domain support, if use {s} switches to RESTFul mode
        url: new Cesium.Resource({
            url: head(getURLs(isArray(options.url) ? options.url : [options.url], queryParametersString)),
            proxy: proxy && new WMTSProxy(proxy) || new NoProxy(),
            ...(headersOpts)
        }),
        // set image format to png if vector to avoid errors while switching between map type
        format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
        isValid,
        // tileDiscardPolicy: {
        //    isReady: () => true,
        //    shouldDiscardImage: ({x, y, level}) => !isValid(x, y, level)
        // }, // not supported yet
        credit,
        layer: options.name,
        style: options.style || "",
        tileMatrixLabels: matrixIds,
        tilingScheme: getTilingSchema(srs, options.matrixIds[tileMatrixSetID]),
        enablePickFeatures: false,
        tileWidth: options.tileWidth || options.tileSize || 256,
        tileHeight: options.tileHeight || options.tileSize || 256,
        tileMatrixSetID: tileMatrixSetID,
        maximumLevel: 30,
        parameters: {...getAuthenticationParam(options)}
    });
}

const createLayer = options => {
    let layer;
    const cesiumOptions = wmtsToCesiumOptions(options);
    layer = new Cesium.WebMapTileServiceImageryProvider(cesiumOptions);
    const orig = layer.requestImage;
    layer.requestImage = (x, y, level) => cesiumOptions.isValid(x, y, level) ? orig.bind(layer)( x, y, level) : new Promise( () => undefined);
    layer.updateParams = (params) => {
        const newOptions = Object.assign({}, options, {
            params: Object.assign({}, options.params || {}, params)
        });
        return createLayer(newOptions);
    };
    return layer;
};

const updateLayer = (layer, newOptions, oldOptions) => {
    if (newOptions.securityToken !== oldOptions.securityToken
    || oldOptions.format !== newOptions.format
    || !isEqual(oldOptions.security, newOptions.security)
    || oldOptions.credits !== newOptions.credits || newOptions.forceProxy !== oldOptions.forceProxy) {
        return createLayer(newOptions);
    }
    return null;
};

Layers.registerType('wmts', {create: createLayer, update: updateLayer});
