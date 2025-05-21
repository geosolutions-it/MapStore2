/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import GeoServerBILTerrainProvider from '../../../../utils/cesium/GeoServerBILTerrainProvider';
import { isEqual } from 'lodash';
import WMSUtils from '../../../../utils/cesium/WMSUtils';

const createLayer = (options) => {
    let layer;
    if (options.useForElevation) {
        return new GeoServerBILTerrainProvider(WMSUtils.wmsToCesiumOptionsBIL(options));
    }
    if (options.singleTile) {
        layer = new Cesium.SingleTileImageryProvider(WMSUtils.wmsToCesiumOptionsSingleTile(options));
    } else {
        layer = new Cesium.WebMapServiceImageryProvider(WMSUtils.wmsToCesiumOptions(options));
    }

    layer.updateParams = (params) => {
        const newOptions = {
            ...options,
            params: {
                ...(options.params || {}),
                ...params
            }
        };
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
        !isEqual(oldOptions.security, newOptions.security) ||
        !isEqual(newOptions.layerFilter, oldOptions.layerFilter) ||
        newOptions.tileSize !== oldOptions.tileSize || newOptions.forceProxy !== oldOptions.forceProxy) {
        return createLayer(newOptions);
    }
    return null;
};
Layers.registerType('wms', {create: createLayer, update: updateLayer});
