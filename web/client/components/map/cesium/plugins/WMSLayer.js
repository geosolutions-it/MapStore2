/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import Cesium from '../../../../libs/cesium';
import createBILTerrainProvider from '../../../../utils/cesium/BILTerrainProvider';
const BILTerrainProvider = createBILTerrainProvider(Cesium);
import ConfigUtils from '../../../../utils/ConfigUtils';
import {getProxyUrl, needProxy} from "../../../../utils/ProxyUtils";
import assign from 'object-assign';
import {isArray, isEqual} from 'lodash';
import WMSUtils from '../../../../utils/cesium/WMSUtils';
import {getAuthenticationParam, getURLs} from '../../../../utils/LayersUtils';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import {addAuthenticationToSLD} from '../../../../utils/SecurityUtils';

import { isVectorFormat } from '../../../../utils/VectorTileUtils';

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
    const params = optionsToVendorParams(options);
    const parameters = assign({
        styles: options.style || "",
        format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        opacity: opacity,
        tiled: options.tiled !== undefined ? options.tiled : true,
        layers: options.name,
        width: options.size || 2000,
        height: options.size || 2000,
        bbox: "-180.0,-90,180.0,90",
        srs: "EPSG:4326"
    }, params || {}, getAuthenticationParam(options));

    return {
        url: (isArray(options.url) ? options.url[Math.round(Math.random() * (options.url.length - 1))] : options.url) + '?service=WMS&version=1.1.0&request=GetMap&'
            + getQueryString(addAuthenticationToSLD(parameters, options))
    };
}

function wmsToCesiumOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    const params = optionsToVendorParams(options);
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = needProxy(options.url) && proxyUrl;
    }
    const cr = options.credits;
    const credit = cr ? new Cesium.Credit(cr.text || cr.title, cr.imageUrl, cr.link) : options.attribution;
    // NOTE: can we use opacity to manage visibility?
    return assign({
        url: "{s}",
        credit,
        subdomains: getURLs(isArray(options.url) ? options.url : [options.url]),
        proxy: proxy && new WMSProxy(proxy) || new NoProxy(),
        layers: options.name,
        enablePickFeatures: false,
        parameters: assign({
            styles: options.style || "",
            format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity,
            tiled: options.tiled !== undefined ? options.tiled : true,
            width: options.tileSize || 256,
            height: options.tileSize || 256

        }, assign(
            {},
            (options._v_ ? {_v_: options._v_} : {}),
            (params || {}),
            getAuthenticationParam(options)
        ))
    });
}

function wmsToCesiumOptionsBIL(options) {

    let url = options.url;
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = options.noCors || needProxy(url);
    }
    return assign({
        url,
        proxy: proxy ? new WMSProxy(proxyUrl) : new NoProxy(),
        littleEndian: options.littleendian || false,
        layerName: options.name
    });
}

const createLayer = (options) => {
    let layer;
    if (options.useForElevation) {
        return new BILTerrainProvider(wmsToCesiumOptionsBIL(options));
    }
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
            return !isEqual(oldOption, newOption);
        });
    if (newParameters.length > 0 ||
        newOptions.securityToken !== oldOptions.securityToken ||
        !isEqual(newOptions.layerFilter, oldOptions.layerFilter) ||
        newOptions.tileSize !== oldOptions.tileSize) {
        return createLayer(newOptions);
    }
    return null;
};
Layers.registerType('wms', {create: createLayer, update: updateLayer});
