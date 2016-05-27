/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/leaflet/Layers');
var L = require('leaflet');

var mqTilesAttr = 'Tiles &copy; <a href="https://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" />';

const assign = require('object-assign');

var mapquestOptions = {
    osm: {
        url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.png',
        options: {
            subdomains: '1234',
            type: 'osm',
            attribution: 'Map data ' + L.TileLayer.OSM_ATTR + ', ' + mqTilesAttr
        }
    },
    sat: {
        url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.png',
        options: {
            subdomains: '1234',
            type: 'sat',
            attribution: 'Imagery &copy; NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency, ' + mqTilesAttr
        }
    }
};

Layers.registerType('mapquest', (options) => {
    return L.tileLayer(mapquestOptions[options.name].url, assign({}, mapquestOptions[options.name].options, options.zoomOffset ? {zoomOffset: options.zoomOffset} : {}), options);
});
