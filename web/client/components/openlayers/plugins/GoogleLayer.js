/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../utils/openlayers/Layers');
var ol = require('openlayers');

var layersMap = {
    'HYBRID': 'AerialWithLabels',
    'SATELLITE': 'Aerial',
    'ROADMAP': 'Roads',
    'TERRAIN': 'Aerial'
};

Layers.registerType('google', (options) => {
    var key = options.apiKey || "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
    return new ol.layer.Tile({
        preload: Infinity,
        source: new ol.source.BingMaps({
          key: key,
          imagerySet: layersMap[options.name]
        })
    });
});
