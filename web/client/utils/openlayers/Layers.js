/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const layerTypes = {};

var Layers = {

    registerType: function(type, impl) {
        layerTypes[type] = impl;
    },

    createLayer: function(type, options, map, mapId) {
        var layerCreator = layerTypes[type];
        if (layerCreator) {
            return layerCreator.create(options, map, mapId);
        }
        return null;
    },
    renderLayer: function(type, options, map, mapId, layer) {
        var layerCreator = layerTypes[type];
        if (layerCreator && layerCreator.render) {
            return layerCreator.render(options, map, mapId, layer);
        }
        return null;
    }
};

module.exports = Layers;
