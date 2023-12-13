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

function cesiumOptionsMapping(config) {
    return {
        url: config.url,
        credit: config?.options?.credit,
        ellipsoid: config?.options?.ellipsoid,
        requestMetadata: config?.options?.requestMetadata,
        requestWaterMask: config?.options?.requestWaterMask,
        requestVertexNormals: config?.options?.requestVertexNormals
    };
}

const createLayer = (config, map) => {
    map.terrainProvider = undefined;
    let terrainProvider;
    switch (config.provider) {
    case 'wms': {
        terrainProvider = new GeoServerBILTerrainProvider(WMSUtils.wmsToCesiumOptionsBIL(config));
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
        }
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
