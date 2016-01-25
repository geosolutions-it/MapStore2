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
var {isObject} = require('lodash');

function getWMSURL( url ) {
    return url.split("\?")[0];
}

function WMSProxy(proxy) {
    this.proxy = proxy;
}

WMSProxy.prototype.getURL = function(resource) {
    return this.proxy + encodeURIComponent(resource);
};

function wmsToLeafletOptions(options) {
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
        url: getWMSURL(options.url),
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
    return new Cesium.WebMapServiceImageryProvider(wmsToLeafletOptions(options));
});
