/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');
var assign = require('object-assign');
var {isArray, flattenDeep, chunk} = require('lodash');

var CoordinatesUtils = {
    getUnits: function(projection) {
        const proj = new Proj4js.Proj(projection);
        return proj.units || 'degrees';
    },
    reproject: function(point, source, dest, normalize = true) {
        const sourceProj = Proj4js.defs(source) ? new Proj4js.Proj(source) : null;
        const destProj = Proj4js.defs(dest) ? new Proj4js.Proj(dest) : null;
        if (sourceProj && destProj) {
            let p = isArray(point) ? Proj4js.toPoint(point) : Proj4js.toPoint([point.x, point.y]);
            const transformed = assign({}, Proj4js.transform(sourceProj, destProj, p), {srs: dest});
            if (normalize) {
                return CoordinatesUtils.normalizePoint(transformed);
            }
            return transformed;
        }
        return null;
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
    reprojectBbox: function(bbox, source, dest, normalize = true) {
        let points;
        if (isArray(bbox)) {
            points = {
                sw: [bbox[0], bbox[1]],
                ne: [bbox[2], bbox[3]]
            };
        } else {
            points = {
                sw: [bbox.minx, bbox.miny],
                ne: [bbox.maxx, bbox.maxy]
            };
        }
        let projPoints = [];
        for (let p in points) {
            if (points.hasOwnProperty(p)) {
                const projected = CoordinatesUtils.reproject(points[p], source, dest, normalize);
                if (projected) {
                    let {x, y} = projected;
                    projPoints.push(x);
                    projPoints.push(y);
                } else {
                    return null;
                }
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
    },
    /**
     * Extend an extent given another one
     *
     * @param extent1 {array} [minx, miny, maxx, maxy]
     * @param extent2 {array} [minx, miny, maxx, maxy]
     *
     * @return {array} [minx, miny, maxx, maxy]
     */
    extendExtent: function(extent1, extent2) {
        let newExtent = extent1.slice();
        if (extent2[0] < extent1[0]) {
            newExtent[0] = extent2[0];
        }
        if (extent2[2] > extent1[2]) {
            newExtent[2] = extent2[2];
        }
        if (extent2[1] < extent1[1]) {
            newExtent[1] = extent2[1];
        }
        if (extent2[3] > extent1[3]) {
            newExtent[3] = extent2[3];
        }
        return newExtent;
    },
    getGeoJSONExtent: function(geoJSON) {
        let newExtent = [Infinity, Infinity, -Infinity, -Infinity];

        if (geoJSON.coordinates) {
            if (geoJSON.type !== "Point" && geoJSON.type !== "GeometryCollection") {
                const flatCoordinates = chunk(flattenDeep(geoJSON.coordinates), 2);
                flatCoordinates.reduce((extent, point) => {
                    extent[0] = (point[0] < newExtent[0]) ? point[0] : newExtent[0];
                    extent[1] = (point[1] < newExtent[1]) ? point[1] : newExtent[1];
                    extent[2] = (point[0] > newExtent[2]) ? point[0] : newExtent[2];
                    extent[3] = (point[1] > newExtent[3]) ? point[1] : newExtent[3];
                    return extent;
                }, newExtent);
            }else if (geoJSON.type === "Point") {
                let point = geoJSON.coordinates;
                newExtent[0] = point[0] - point[0] * 0.01;
                newExtent[1] = point[1] - point[1] * 0.01;
                newExtent[2] = point[0] + point[0] * 0.01;
                newExtent[3] = point[1] + point[1] * 0.01;
            }else if (geoJSON.type === "GeometryCollection") {
                geoJSON.geometies.reduce((extent, geometry) => {
                    let ext = this.getGeoJSONExtent(geometry);
                    if (this.isValidExtent(ext)) {
                        extent[0] = (ext[0] < newExtent[0]) ? ext[0] : newExtent[0];
                        extent[1] = (ext[1] < newExtent[1]) ? ext[1] : newExtent[1];
                        extent[2] = (ext[2] > newExtent[2]) ? ext[2] : newExtent[2];
                        extent[3] = (ext[3] > newExtent[3]) ? ext[3] : newExtent[3];
                    }
                }, newExtent);
            }
        }

        return newExtent;
    },
    /**
     * Check extent validity
     *
     * @param extent {array} [minx, miny, maxx, maxy]
     *
     * @return {bool}
     */
    isValidExtent: function(extent) {
        return !(
            extent.indexOf(Infinity) !== -1 || extent.indexOf(-Infinity) !== -1 ||
            extent[1] >= extent[2] || extent[1] >= extent[3]
        );
    },
    calculateCircleCoordinates: function(center, radius, sides, rotation) {
        let angle = Math.PI * ((1 / sides) - (1 / 2));

        if (rotation) {
            angle += (rotation / 180) * Math.PI;
        }

        let rotatedAngle; let x; let y;
        let points = [[]];
        for (let i = 0; i < sides; i++) {
            rotatedAngle = angle + (i * 2 * Math.PI / sides);
            x = center.x + (radius * Math.cos(rotatedAngle));
            y = center.y + (radius * Math.sin(rotatedAngle));
            points[0].push([x, y]);
        }

        points[0].push(points[0][0]);
        return points;
    }
};

module.exports = CoordinatesUtils;
