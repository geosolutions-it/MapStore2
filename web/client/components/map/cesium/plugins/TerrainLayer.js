/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import GeoServerBILTerrainProvider from '../../../../utils/cesium/GeoServerBILTerrainProvider';
import WMSUtils from '../../../../utils/cesium/WMSUtils';
import { getProxyUrl } from "../../../../utils/ProxyUtils";

function cesiumOptionsMapping(config) {
    return {
        url: new Cesium.Resource({
            url: config.url,
            proxy: config.forceProxy ? new Cesium.DefaultProxy(getProxyUrl()) : undefined
        }),
        options: {
            credit: config?.options?.credit,
            ellipsoid: config?.options?.ellipsoid,
            requestMetadata: config?.options?.requestMetadata,
            requestWaterMask: config?.options?.requestWaterMask,
            requestVertexNormals: config?.options?.requestVertexNormals
        }

    };
}

function cesiumIonOptionsMapping(config) {
    const options = config?.options ?? {};
    return {
        url: options.assetId
            ? Cesium.IonResource.fromAssetId(options.assetId, {
                accessToken: options.accessToken,
                server: options.server
            })
            : undefined,
        options: {
            credit: options.credit,
            requestMetadata: options.requestMetadata
        }
    };
}

const createLayer = (config, map) => {
    map.terrainProvider = undefined;
    let terrainProvider;
    let terrain;
    let url;
    let options;
    switch (config.provider) {
    case 'wms': {
        const cesiumOptionsBIL = WMSUtils.wmsToCesiumOptionsBIL(config);
        url = cesiumOptionsBIL.url;
        options = cesiumOptionsBIL || {};
        if (url) {
            terrainProvider = GeoServerBILTerrainProvider.fromUrl(url, options);
        }
        break;
    }
    case 'cesium': {
        const cesiumOptions = cesiumOptionsMapping(config);
        url = cesiumOptions.url;
        options = cesiumOptions.options || {};
        if (url) {
            terrainProvider = Cesium.CesiumTerrainProvider.fromUrl(url, options);
        }
        break;
    }
    case 'ellipsoid': {
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
        break;
    }
    case 'cesium-ion': {
        const ionOptions = cesiumIonOptionsMapping(config);
        url = ionOptions.url;
        options = ionOptions.options || {};
        if (url) {
            terrainProvider = Cesium.CesiumTerrainProvider.fromUrl(url, options);
        }
        break;
    }
    default:
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
        break;
    }
    return {
        detached: true,
        terrainProvider,
        terrain,
        add: () => {
            if (terrainProvider) {
                terrain = new Cesium.Terrain(terrainProvider);
                map.scene.setTerrain(terrain);
            }
        },
        remove: () => {
            terrain = new Cesium.Terrain(new Cesium.EllipsoidTerrainProvider());
            map.scene.setTerrain(terrain);
        }
    };
};

const updateLayer = (layer, newOptions, oldOptions, map) => {
    if (newOptions.securityToken !== oldOptions.securityToken
    || oldOptions.credits !== newOptions.credits
    || oldOptions.provider !== newOptions.provider
    || newOptions.url !== oldOptions.url
    || newOptions?.options?.assetId !== oldOptions?.options?.assetId
    || newOptions?.options?.accessToken !== oldOptions?.options?.accessToken
    || newOptions?.options?.server !== oldOptions?.options?.server
    || newOptions?.options?.crs !== oldOptions?.options?.crs
    || newOptions?.version !== oldOptions?.version
    || newOptions?.name !== oldOptions?.name
    || oldOptions.forceProxy !== newOptions.forceProxy) {
        return createLayer(newOptions, map);
    }
    return null;
};

Layers.registerType('terrain', {
    create: createLayer,
    update: updateLayer
});
