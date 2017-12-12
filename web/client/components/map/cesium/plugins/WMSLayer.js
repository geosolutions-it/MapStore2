/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/cesium/Layers');
const ConfigUtils = require('../../../../utils/ConfigUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const Cesium = require('../../../../libs/cesium');
const assign = require('object-assign');
const {isArray} = require('lodash');
const WMSUtils = require('../../../../utils/cesium/WMSUtils');
const {getAuthenticationParam, getURLs} = require('../../../../utils/LayersUtils');
const FilterUtils = require('../../../../utils/FilterUtils');

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
    return ProxyUtils.getProxyUrl() + encodeURIComponent(url + queryString);
};

function NoProxy() {
}

NoProxy.prototype.getURL = function(resource) {
    let {url, queryString} = splitUrl(resource);
    return url + queryString;
};

function getQueryString(parameters) {
    return Object.keys(parameters).map((key) => key + '=' + encodeURIComponent(parameters[key])).join('&');
}

function wmsToCesiumOptionsSingleTile(options) {
    const opacity = options.opacity !== undefined ? options.opacity : 1;
    const CQL_FILTER = FilterUtils.isFilterValid(options.filterObj) && FilterUtils.toCQLFilter(options.filterObj);
    const parameters = assign({
        styles: options.style || "",
        format: options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        opacity: opacity,
        tiled: options.tiled !== undefined ? options.tiled : true,
        layers: options.name,
        width: options.size || 2000,
        height: options.size || 2000,
        bbox: "-180.0,-90,180.0,90",
        srs: "EPSG:4326"
    }, (CQL_FILTER ? {CQL_FILTER} : {}), options.params || {}, getAuthenticationParam(options));

    return {
        url: (isArray(options.url) ? options.url[Math.round(Math.random() * (options.url.length - 1))] : options.url) + '?service=WMS&version=1.1.0&request=GetMap&' + getQueryString(parameters)
    };
}

function wmsToCesiumOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    const CQL_FILTER = FilterUtils.isFilterValid(options.filterObj) && FilterUtils.toCQLFilter(options.filterObj);
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = ProxyUtils.needProxy(options.url) && proxyUrl;
    }
    // NOTE: can we use opacity to manage visibility?
    return assign({
        url: "{s}",
        subdomains: getURLs(isArray(options.url) ? options.url : [options.url]),
        proxy: proxy && new WMSProxy(proxy) || new NoProxy(),
        layers: options.name,
        enablePickFeatures: false,
        parameters: assign({
            styles: options.style || "",
            format: options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity,
            tiled: options.tiled !== undefined ? options.tiled : true

        }, assign(
            {},
            (CQL_FILTER ? {CQL_FILTER} : {}),
            (options._v_ ? {_v_: options._v_} : {}),
            (options.params || {}),
            getAuthenticationParam(options)
        ))
    });
}

const createLayer = (options) => {
    let layer;
    if (options.singleTile) {
        layer = new Cesium.SingleTileImageryProvider(wmsToCesiumOptionsSingleTile(options));
    } else {
        layer = new Cesium.WebMapServiceImageryProvider(wmsToCesiumOptions(options));
    }

    layer.updateParams = (params) => {
        const newOptions = assign({}, options, {
            params: assign({}, options.params || {}, params)
        });
        return createLayer(newOptions);
    };
    return layer;
};
const updateLayer = (layer, newOptions, oldOptions) => {
    const requiresUpdate = (el) => WMSUtils.PARAM_OPTIONS.indexOf(el.toLowerCase()) >= 0;
    const newParams = newOptions && newOptions.params;
    const oldParams = oldOptions && oldOptions.params;
    const allParams = {...newParams, ...oldParams };
    let newParameters = Object.keys({...newOptions, ...oldOptions, ...allParams})
        .filter(requiresUpdate)
        .filter((key) => {
            const oldOption = oldOptions[key] === undefined ? oldParams && oldParams[key] : oldOptions[key];
            const newOption = newOptions[key] === undefined ? newParams && newParams[key] : newOptions[key];
            return oldOption !== newOption;
        });
    if (newParameters.length > 0 || newOptions.securityToken !== oldOptions.securityToken) {
        return createLayer(newOptions);
    }
    return null;
};
Layers.registerType('wms', {create: createLayer, update: updateLayer});
