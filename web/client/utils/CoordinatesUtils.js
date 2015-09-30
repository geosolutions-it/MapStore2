/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');
var assign = require('object-assign');

var CoordinatesUtils = {
    reproject: function(point, source, dest) {
        const sourceProj = new Proj4js.Proj(source);
        const destProj = new Proj4js.Proj(dest);

        return assign({}, Proj4js.transform(sourceProj, destProj, Proj4js.toPoint(point)), {srs: dest});
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
    }
};

module.exports = CoordinatesUtils;
