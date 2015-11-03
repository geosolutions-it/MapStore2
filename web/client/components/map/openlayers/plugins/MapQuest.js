/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
var styles = {
    osm: 'Road',
    sat: 'Aerial'
};
Layers.registerType('mapquest', {
    create: (options) => {
        return new ol.layer.Tile({
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility,
            style: styles[options.name],
            zIndex: options.zIndex,
            source: new ol.source.MapQuest({layer: options.name})
        });
    }
});
