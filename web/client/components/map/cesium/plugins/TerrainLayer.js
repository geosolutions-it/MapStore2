/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import createBILTerrainProvider from '../../../../utils/cesium/BILTerrainProvider';
const BILTerrainProvider = createBILTerrainProvider(Cesium);
import { getAuthenticationHeaders } from '../../../../utils/SecurityUtils';
import { getProxyUrl, needProxy } from "../../../../utils/ProxyUtils";
import ConfigUtils from '../../../../utils/ConfigUtils';

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

// Check and apply proxy to source url
function getProxy(options) {
    let proxyUrl = ConfigUtils.getProxyUrl({});
    let proxy;
    if (proxyUrl) {
        proxy = options.noCors || needProxy(options.url);
    }
    return proxy ? new WMSProxy(proxyUrl) : new Cesium.DefaultProxy(getProxyUrl());
}

function wmsOptionsMapping(config) {
    let url = config.url;
    const headers = getAuthenticationHeaders(url, config.securityToken);
    return {
        url: new Cesium.Resource({
            url,
            headers,
            proxy: getProxy(config)
        }),
        layerName: config.name
    };
}

function cesiumOptionsMapping(config) {
    const { requestVertexNormals, requestWaterMask, requestMetadata, ellipsoid, credit } = config.options;
    return {
        url: config.url,
        credit,
        ellipsoid,
        requestMetadata,
        requestWaterMask,
        requestVertexNormals
    };
}

const createLayer = (config, map) => {
    map.terrainProvider = undefined;
    let terrainProvider;
    switch (config.provider) {
    case 'wms': {
        terrainProvider = new BILTerrainProvider(wmsOptionsMapping(config));
        break;
    }
    case 'cesium': {
        terrainProvider = new Cesium.CesiumTerrainProvider(cesiumOptionsMapping(config));
        break;
    }
    case 'ellipsoid': {
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
        break;
    }
    default:
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
        break;
    }
    map.terrainProvider = terrainProvider;
    return {
        detached: true,
        terrainProvider,
        remove: () => {
            map.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        },
        setVisible: () => {}
    };
};

const updateLayer = (layer, newOptions, oldOptions, map) => {
    if (newOptions.securityToken !== oldOptions.securityToken
    || oldOptions.credits !== newOptions.credits
    || oldOptions.provider !== newOptions.provider) {
        return createLayer(newOptions, map);
    }
    return null;
};

Layers.registerType('terrain', {
    create: createLayer,
    update: updateLayer
});
