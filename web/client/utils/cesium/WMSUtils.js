/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import { isArray, castArray } from 'lodash';
import { addAuthenticationParameter, addAuthenticationToSLD, getAuthenticationHeaders } from "../SecurityUtils";
import { getProxyUrl } from "../ProxyUtils";
import ConfigUtils from "../ConfigUtils";
import { creditsToAttribution, getAuthenticationParam, getURLs, getWMSVendorParams } from "../LayersUtils";
import { isVectorFormat } from '../VectorTileUtils';
import { optionsToVendorParams } from '../VendorParamsUtils';
import { randomInt } from '../RandomUtils';
import rateLimitManager from '../RateLimitManager';

function getQueryString(parameters) {
    return Object.keys(parameters).map((key) => key + '=' + encodeURIComponent(parameters[key])).join('&');
}

const PARAM_OPTIONS = ["layers", "styles", "style", "format", "transparent", "version", "tiled", "zindex", "srs", "singletile", "_v_", "filterobj" ];

const getRateLimitOptions = (options = {}) => ({
    params: {
        layers: options.name
    },
    msRateLimitBucket: options.msRateLimitBucket,
    msRateLimitKey: options.msRateLimitKey
});

const getResourceUrl = (resource, fallbackUrl) => {
    if (resource && typeof resource.getUrlComponent === 'function') {
        return resource.getUrlComponent(true, false);
    }
    return resource?.url || fallbackUrl;
};

const createRateLimitRetryCallback = (options, fallbackUrl) => (resource, error) => {
    if (error?.statusCode !== 429) {
        return false;
    }
    const url = getResourceUrl(resource, fallbackUrl);
    const rateLimitOptions = getRateLimitOptions(options);
    const response = rateLimitManager.register429(url, error.responseHeaders, rateLimitOptions);
    if (!response.shouldRetry) {
        return false;
    }
    return rateLimitManager.wait(url, rateLimitOptions).then(() => true);
};

const getRateLimitResourceOptions = (options, fallbackUrl) => ({
    retryCallback: createRateLimitRetryCallback(options, fallbackUrl),
    retryAttempts: rateLimitManager.getRetryAttempts()
});

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
        proxy = options.noCors || options.forceProxy;
    }
    return proxy ? new WMSProxy(proxyUrl) : new NoProxy();
};

/**
 * Generate cesium BIL option for BILTerrainProvider from wms layer option
 * @param {object} layer
 * @returns {object} converted BIL options
 */
export const wmsToCesiumOptionsBIL = (layer) => {
    const url = layer.url;
    const headers = getAuthenticationHeaders(castArray(url)[0], layer.securityToken, layer.security);
    const params = getAuthenticationParam(layer);
    // specific options for terrain provider now are inside the options parameter
    // we still use layer object for retrocompatibility
    const options = { ...layer, ...layer?.options };
    // MapStore only supports "image/bil" format for WMS provider
    return {
        url,
        headers,
        proxy: getProxy(layer),
        layerName: layer.name,
        version: layer.version,
        littleEndian: options.littleEndian || options.littleendian || false,
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

export function wmsToCesiumOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    let params = optionsToVendorParams(options);
    const cr = options.credits;
    const credit = cr ? new Cesium.Credit(creditsToAttribution(cr)) : options.attribution;
    // NOTE: can we use opacity to manage visibility?
    const urls = getURLs(isArray(options.url) ? options.url : [options.url]);
    const headers = getAuthenticationHeaders(urls[0], options.securityToken, options.security);
    params = addAuthenticationParameter(urls[0], params, options.securityToken);
    return {
        url: new Cesium.Resource({
            url: "{s}",
            headers,
            proxy: getProxy(options),
            ...getRateLimitResourceOptions(options, urls[0])
        }),
        // #7516 this helps Cesium to use CORS requests in a proper way, even when headers are not
        // present in the Resource
        tileDiscardPolicy: options.tileDiscardPolicy === "none" ?
            undefined :
            (options.tileDiscardPolicy ?? new Cesium.NeverTileDiscardPolicy()),
        credit,
        subdomains: urls,
        layers: options.name,
        enablePickFeatures: false,
        parameters: {
            styles: options.style || "",
            format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity,
            version: options.version || "1.1.1",
            tiled: options.tiled !== undefined ? options.tiled : true,
            width: options.tileSize || 256,
            height: options.tileSize || 256,
            ...(options._v_ ? {_v_: options._v_} : {}),
            ...(params || {}),
            ...getAuthenticationParam(options)

        }
    };
}

export function wmsToCesiumOptionsSingleTile(options) {
    const opacity = options.opacity !== undefined ? options.opacity : 1;
    const params = optionsToVendorParams(options);
    const width = options.size || 2000;
    const height = options.size || 2000;
    const parameters = {
        styles: options.style || "",
        format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        opacity: opacity,
        ...getWMSVendorParams(options),
        layers: options.name,
        width,
        height,
        bbox: "-180.0,-90,180.0,90",
        srs: "EPSG:4326",
        ...(params || {}),
        ...getAuthenticationParam(options),
        ...(options._v_ ? {_v_: options._v_} : {})
    };

    const url = (isArray(options.url) ? options.url[Math.round(randomInt(options.url.length - 1))] : options.url) + '?service=WMS&version=1.1.0&request=GetMap&'
        + getQueryString(addAuthenticationToSLD(parameters, options));
    const headers = getAuthenticationHeaders(url, options.securityToken, options.security);
    return {
        url: new Cesium.Resource({
            url,
            headers,
            proxy: getProxy(options),
            ...getRateLimitResourceOptions(options, url)
        }),
        tileWidth: width,
        tileHeight: height
    };
}

export function createSingleTileImageryProvider(options) {
    const provider = new Cesium.SingleTileImageryProvider(wmsToCesiumOptionsSingleTile(options));
    const originalRequestImage = provider.requestImage.bind(provider);
    provider.requestImage = (x, y, level, request) => {
        if (provider._image || provider._hasError || !provider._resource) {
            return originalRequestImage(x, y, level, request);
        }
        const resource = provider._resource.getDerivedResource({ request });
        const imageRequest = resource.fetchImage({
            preferBlob: true,
            preferImageBitmap: true,
            flipY: true
        });
        if (!imageRequest) {
            return originalRequestImage(x, y, level, request);
        }
        return imageRequest
            .then((image) => {
                provider._image = image;
                return image;
            })
            .catch((error) => {
                if (error?.statusCode === 429) {
                    return Promise.reject(error);
                }
                return originalRequestImage(x, y, level, request);
            });
    };
    return provider;
}

export default {
    PARAM_OPTIONS,
    wmsToCesiumOptionsBIL,
    wmsToCesiumOptions,
    wmsToCesiumOptionsSingleTile,
    createSingleTileImageryProvider,
    getProxy
};
