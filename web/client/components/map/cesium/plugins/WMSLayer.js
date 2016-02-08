/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/cesium/Layers');
var ConfigUtils = require('../../../../utils/ConfigUtils');
var Cesium = require('../../../../libs/cesium');
var assign = require('object-assign');
var {isObject, isArray} = require('lodash');

function getWMSURLs( urls ) {
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

function WMSProxy(proxy) {
    this.proxy = proxy;
}

WMSProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return this.proxy + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return url + queryString;
};

function wmsToCesiumOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
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
    return assign({
        url: "{s}",
        subdomains: getWMSURLs(isArray(options.url) ? options.url : [options.url]),
        proxy: proxy && new WMSProxy(proxy) || new NoProxy(),
        layers: options.name,
        parameters: assign({
            styles: options.style || "",
            format: options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity
        }, options.params || {})
    });
}


function updateUrl(originalUrl, params) {
    let {url, queryString} = splitUrl(originalUrl);
    let parts = queryString.split('&').reduce((previous, current) => {
        const [key, value] = current.split('=');
        return assign({}, previous, {[key]: value});
    }, {});
    Object.keys(params).forEach((key) => {
        parts[key] = encodeURIComponent(params[key]);
    });
    return url + Object.keys(parts).map((key) => key + '=' + parts[key]).join('&');
}

Layers.registerType('wms', (options) => {
    let layer = new Cesium.WebMapServiceImageryProvider(wmsToCesiumOptions(options));
    layer.updateParams = (params) => {
        const provider = layer._tileProvider;

        provider._url = updateUrl(provider._url, params);
        provider._urlParts[1] = updateUrl(provider._urlParts[1], params);
    };
    return layer;
});
