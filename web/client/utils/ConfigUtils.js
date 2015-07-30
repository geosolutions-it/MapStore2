/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');

var ConfigUtils = {
    convertFromLegacy: function(config) {
        var mapConfig = config.map;
        var layers = mapConfig.layers;
        var center = mapConfig.center;
        var zoom = mapConfig.zoom;
        var maxExtent = mapConfig.maxExtent;
        var projection = mapConfig.projection;
        var epsgMap = new Proj4js.Proj(projection);
        var epsg4326 = new Proj4js.Proj('EPSG:4326');
        var xy = new Proj4js.Point(center);
        Proj4js.transform(epsgMap, epsg4326, xy);
        const latLng = {lat: xy.y, lng: xy.x};
        return {
            latLng: latLng,
            zoom: zoom,
            maxExtent: maxExtent, // TODO convert maxExtent
            layers: layers,
            sources: config.gsSources
        };
    }
};

module.exports = ConfigUtils;
