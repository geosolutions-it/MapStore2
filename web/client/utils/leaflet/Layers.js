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

    createLayer: function(type, options) {
        var layerCreator = layerTypes[type];
        if (layerCreator) {
            return layerCreator(options);
        }
        return null;
    }
};

module.exports = Layers;
