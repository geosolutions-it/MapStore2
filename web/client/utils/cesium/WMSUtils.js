/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getAuthenticationHeaders } from "../SecurityUtils";
import { getProxyUrl, needProxy } from "../ProxyUtils";
import ConfigUtils from "../ConfigUtils";
import {getAuthenticationParam} from "../LayersUtils";

const PARAM_OPTIONS = ["layers", "styles", "style", "format", "transparent", "version", "tiled", "opacity", "zindex", "srs", "singletile", "_v_", "filterobj" ];


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

function WMSProxy(proxy) {
    this.proxy = proxy;
}

WMSProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return getProxyUrl() + encodeURIComponent(url + queryString);
};

function NoProxy() {}

NoProxy.prototype.getURL = function(resource) {
    const { url, queryString } = splitUrl(resource);
    return url + queryString;
};

// Check and apply proxy to source url
export const getProxy = (options) => {
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = options.noCors || needProxy(options.url);
    }
    return proxy ? new WMSProxy(proxyUrl) : new NoProxy();
};

/**
 * Generate cesium BIL option for BILTerrainProvider from wms layer option
 * @param {object} options
 * @returns {object} converted BIL options
 */
export const wmsToCesiumOptionsBIL = (options) => {
    let url = options.url;
    const headers = getAuthenticationHeaders(url, options.securityToken);
    const params = getAuthenticationParam(options);
    // MapStore only supports "image/bil" format for WMS provider
    return {
        url,
        headers,
        proxy: getProxy(options),
        littleEndian: options.littleEndian || options.littleendian || false,
        layerName: options.name,
        version: options.version,
        crs: options.crs, // Support only CRS:84 | EPSG:4326 | EPSG:3857 | OSGEO:41001
        sampleTerrainZoomLevel: options.sampleTerrainZoomLevel,
        heightMapWidth: options.heightMapWidth,
        heightMapHeight: options.heightMapHeight,
        waterMask: options.waterMask,
        offset: options.offset,
        highest: options.highest,
        lowest: options.lowest,
        params
    };
};

export default {
    PARAM_OPTIONS,
    wmsToCesiumOptionsBIL,
    getProxy
};
