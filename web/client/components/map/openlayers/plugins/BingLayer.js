/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');

Layers.registerType('bing', {
    create: (options) => {
        var key = options.apiKey || "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
        return new ol.layer.Tile({
            preload: Infinity,
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility,
            source: new ol.source.BingMaps({
              key: key,
              imagerySet: options.name
            })
        });
    }
});
