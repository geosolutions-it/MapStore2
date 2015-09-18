/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');

Layers.registerType('osm', {
    create: () => {
        return new ol.layer.Tile({
          source: new ol.source.OSM()
        });
    }
});
