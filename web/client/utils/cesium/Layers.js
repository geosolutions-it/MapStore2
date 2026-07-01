/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const layerTypes = {};

const Layers = {

    registerType: function(type, impl) {
        layerTypes[type] = impl;
    },

    createLayer: function(type, options, map) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.create) {
            return layerCreator.create(options, map);
        } else if (layerCreator) {
            // TODO this compatibility workaround should be removed
            // using the same interface
            return layerCreator(options, map);
        }
        return null;
    },
    renderLayer: function(type, options, map, mapId, layer) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.render) {
            return layerCreator.render(options, map, mapId, layer);
        }
        return null;
    },
    updateLayer: function(type, layer, newOptions, oldOptions, map) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.update) {
            return layerCreator.update(layer, newOptions, oldOptions, map);
        }
        return null;
    },
    isSupported(type) {
        return !!layerTypes[type];
    },
    /**
     * Call the refresh method of the layer implementation located in web/client/components/map/cesium/plugins/[layerType]
     * where layerType = WMSLayer, WFSLayer, WMTSLayer, ArcGISLayer, etc
     * if implemented, that is used for autorefresh of layers.
     * @param {string} type
     * @param {object} layer
     * @returns {void}
     */
    refreshLayer(type, layer) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.refresh) {
            layerCreator.refresh(layer);
        }
    },
    /**
     * Check if the layer implementation located in web/client/components/map/cesium/plugins/[layerType]
     * where layerType = WMSLayer, WFSLayer, WMTSLayer, ArcGISLayer, etc
     * implements the refresh method, that is used for autorefresh of layers.
     * @param {string} type
     * @returns {boolean}
     */
    hasAutoRefreshCapability(type) {
        const layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.refresh) {
            return true;
        }
        return false;
    }
};

export default Layers;
