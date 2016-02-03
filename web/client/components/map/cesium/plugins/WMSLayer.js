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

function WMSProxy(proxy) {
    this.proxy = proxy;
}

WMSProxy.prototype.getURL = function(resource) {
    let url = resource;
    let queryString = "";
    if (resource.indexOf('?') !== -1) {
        url = resource.substring(0, resource.indexOf('?') + 1);
        if (url.indexOf('%') !== -1) {
            url = decodeURIComponent(url);
        }
        queryString = resource.substring(resource.indexOf('?') + 1);
    }
    return this.proxy + encodeURIComponent(url + queryString);
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
        const isCORS = useCORS.reduce((found, current) => found || options.url.indexOf(current) === 0, false);
        proxy = !isCORS && proxyUrl;
    }
    // NOTE: can we use opacity to manage visibility?
    return assign({
        url: "{s}",
        subdomains: getWMSURLs(isArray(options.url) ? options.url : [options.url]),
        proxy: proxy && new WMSProxy(proxy),
        layers: options.name,
        parameters: {
            styles: options.style || "",
            format: options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity
        }
    }, options.params || {});
}

Layers.registerType('wms', (options) => {
    return new Cesium.WebMapServiceImageryProvider(wmsToCesiumOptions(options));
});
