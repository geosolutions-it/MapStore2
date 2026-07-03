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
import isEqual from 'lodash/isEqual';
import { getRequestConfigurationByUrl } from '../../../../utils/SecurityUtils';

function cesiumOptionsMapping(config) {
    const { headers, params } = getRequestConfigurationByUrl(config.url, null, config.security?.sourceId);
    return {
        url: new Cesium.Resource({
            url: config.url,
            headers,
            queryParameters: params,
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
                // if the terrain provider fails to load (e.g. unreachable server or CORS error)
                // fallback to the default ellipsoid terrain to avoid a completely black scene
                terrain.errorEvent.addEventListener((error) => {
                    // eslint-disable-next-line no-console
                    console.error('Error while loading the terrain provider, falling back to the ellipsoid terrain', error);
                    if (map._msCurrentTerrain === terrain) {
                        terrain = new Cesium.Terrain(new Cesium.EllipsoidTerrainProvider());
                        map.scene.setTerrain(terrain);
                        map._msCurrentTerrain = terrain;
                    }
                });
                map.scene.setTerrain(terrain);
                map._msCurrentTerrain = terrain;
            }
        },
        remove: () => {
            // reset the scene terrain only if this layer is the one currently applied,
            // removing a deselected or hidden terrain layer must not override
            // a terrain that has just been activated (e.g. switching terrain from the background selector)
            if (terrain && map._msCurrentTerrain === terrain) {
                terrain = new Cesium.Terrain(new Cesium.EllipsoidTerrainProvider());
                map.scene.setTerrain(terrain);
                map._msCurrentTerrain = terrain;
            }
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
    || oldOptions.forceProxy !== newOptions.forceProxy
    || !isEqual(oldOptions.security, newOptions.security)
    || !isEqual(oldOptions.requestRuleRefreshHash, newOptions.requestRuleRefreshHash)) {
        return createLayer(newOptions, map);
    }
    return null;
};

Layers.registerType('terrain', {
    create: createLayer,
    update: updateLayer
});
