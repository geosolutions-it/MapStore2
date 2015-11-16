/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');
var assign = require('object-assign');
var {isArray} = require('lodash');

var CoordinatesUtils = {
    reproject: function(point, source, dest) {
        const sourceProj = new Proj4js.Proj(source);
        const destProj = new Proj4js.Proj(dest);
        let p = isArray(point) ? Proj4js.toPoint(point) : Proj4js.toPoint([point.x, point.y]);

        return CoordinatesUtils.normalizePoint(assign({}, Proj4js.transform(sourceProj, destProj, p), {srs: dest}));
    },
    normalizePoint: function(point) {
        return {
            x: point.x || 0.0,
            y: point.y || 0.0,
            srs: point.srs || 'EPSG:4326'
        };
    },
    /**
     * Reprojects a bounding box.
     *
     * @param bbox {array} [minx, miny, maxx, maxy]
     * @param source {string} SRS of the given bbox
     * @param dest {string} SRS of the returned bbox
     *
     * @return {array} [minx, miny, maxx, maxy]
     */
    reprojectBbox: function(bbox, source, dest) {
        let points = {
            sw: [bbox[0], bbox[1]],
            ne: [bbox[2], bbox[3]]
        };
        let projPoints = [];
        for (let p in points) {
            if (points.hasOwnProperty(p)) {
                let {x, y} = CoordinatesUtils.reproject(points[p], source, dest);
                projPoints.push(x);
                projPoints.push(y);
            }
        }
        return projPoints;
    },
    normalizeSRS: function(srs) {
        return srs === 'EPSG:900913' ? 'EPSG:3857' : srs;
    },
    getAvailableCRS: function() {
        let crsList = {};
        for (let a in Proj4js.defs) {
            if (Proj4js.defs.hasOwnProperty(a)) {
                crsList[a] = {label: a};
            }
        }
        return crsList;
    },
    calculateAzimuth: function(p1, p2, pj) {

        var p1proj = CoordinatesUtils.reproject(p1, pj, 'EPSG:4326');
        var p2proj = CoordinatesUtils.reproject(p2, pj, 'EPSG:4326');
        var lon1 = p1proj.x * Math.PI / 180.0;
        var lat1 = p1proj.y * Math.PI / 180.0;
        var lon2 = p2proj.x * Math.PI / 180.0;
        var lat2 = p2proj.y * Math.PI / 180.0;
        var dLon = lon2 - lon1;
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

        var azimuth = (((Math.atan2(y, x) * 180.0 / Math.PI) + 360 ) % 360 );

        return azimuth;
    }
};

module.exports = CoordinatesUtils;
