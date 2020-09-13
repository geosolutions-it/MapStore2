/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const geo = require('node-geo-distance');
const Proj4js = require('proj4').default;
const proj4 = Proj4js;
const axios = require('../libs/ajax');
const assign = require('object-assign');
const {isArray, isObject, isFunction, flattenDeep, chunk, cloneDeep, isNumber, slice, head, last} = require('lodash');
const lineIntersect = require('@turf/line-intersect');
const polygonToLinestring = require('@turf/polygon-to-linestring');
const greatCircle = require('@turf/great-circle').default;
const toPoint = require('turf-point');
const bboxPolygon = require('@turf/bbox-polygon').default;
const overlap = require('@turf/boolean-overlap').default;
const contains = require('@turf/boolean-contains').default;

const FORMULAS = {
    /**
    @param coordinates in EPSG:4326
    return vincenty distance between two points
    */
    "vincenty": (coordinates) => {
        let length = 0;
        for (let i = 0; i < coordinates.length - 1; ++i) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];
            const [x1, y1] = p1;
            const [x2, y2] = p2;
            length += parseFloat(geo.vincentySync({longitude: x1, latitude: y1}, {longitude: x2, latitude: y2}));
        }
        return length;
    },
    /**
    @param coordinates in EPSG:4326
    return distance between two points using Geodesic formula
    */
    "haversine": (coordinates) => {
        let length = 0;
        for (let i = 0; i < coordinates.length - 1; ++i) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];
            const [x1, y1] = p1;
            const [x2, y2] = p2;
            length += parseFloat(geo.haversineSync({longitude: x1, latitude: y1}, {longitude: x2, latitude: y2}));
        }
        return length;
    }
};
// Checks if `list` looks like a `[x, y]`.
function isXY(list) {
    return list.length >= 2 &&
        typeof list[0] === 'number' &&
        typeof list[1] === 'number';
}
function traverseCoords(coordinates, callback) {
    if (isXY(coordinates)) return callback(coordinates);
    return coordinates.map(function(coord) { return traverseCoords(coord, callback); });
}
const getProjUrl = (EPSG) => {
    return `http://spatialreference.org/ref/epsg/${EPSG}/proj4/`;
};
function traverseGeoJson(geojson, leafCallback, nodeCallback) {
    if (geojson === null) return geojson;

    let r = cloneDeep(geojson);

    if (geojson.type === 'Feature') {
        r.geometry = traverseGeoJson(geojson.geometry, leafCallback, nodeCallback);
    } else if (geojson.type === 'FeatureCollection') {
        r.features = r.features.map(function(gj) { return traverseGeoJson(gj, leafCallback, nodeCallback); });
    } else if (geojson.type === 'GeometryCollection') {
        r.geometries = r.geometries.map(function(gj) { return traverseGeoJson(gj, leafCallback, nodeCallback); });
    } else {
        if (leafCallback) leafCallback(r);
    }

    if (nodeCallback) nodeCallback(r);

    return r;
}

function determineCrs(crs) {
    if (typeof crs === 'string' || crs instanceof String) {
        return Proj4js.defs(crs) ? new Proj4js.Proj(crs) : null;
    }
    return crs;
}

let crsLabels = {
    "EPSG:4326": "WGS 84",
    "EPSG:3857": "EPSG:3857"
};

const normalizePoint = (point) => {
    return {
        x: point.x || 0.0,
        y: point.y || 0.0,
        srs: point.srs || point.crs || 'EPSG:4326',
        crs: point.srs || point.crs || 'EPSG:4326'
    };
};
const numberize = (point) => {
    let outpoint = point;
    if (!isNumber(point.x)) {
        outpoint.x = parseFloat(point.x);
    }
    if (!isNumber(point.y)) {
        outpoint.y = parseFloat(point.y);
    }
    return outpoint;
};
const reproject = (point, source, dest, normalize = true) => {
    const sourceProj = source && Proj4js.defs(source) ? new Proj4js.Proj(source) : null;
    const destProj = dest && Proj4js.defs(dest) ? new Proj4js.Proj(dest) : null;
    if (sourceProj && destProj) {
        let p = isArray(point) ? Proj4js.toPoint(point) : Proj4js.toPoint([point.x, point.y]);

        const transformed = assign({}, source === dest ? numberize(p) : Proj4js.transform(sourceProj, destProj, numberize(p)), {srs: dest});
        if (normalize) {
            return normalizePoint(transformed);
        }
        return transformed;
    }
    return null;
};

const supportedSplitExtentEPSG = [
    'EPSG:900913',
    'EPSG:4326',
    'EPSG:3857'
];

/**
 * Return an extent array normalized from EPSG:4326 reprojection
 * @param bounds {object} bounds {minx, miny, maxx, maxy}
 * @param projection {string} the projection of bounds coordinates
 * @return {array} extent with x values normalized from 0 to 360
 */

const normalizeExtent = (bounds, projection) => {
    const extent = projection !== 'EPSG:4326' ? [

        reproject([parseFloat(bounds.minx), parseFloat(bounds.miny)], projection, 'EPSG:4326'),
        reproject([parseFloat(bounds.maxx), parseFloat(bounds.maxy)], projection, 'EPSG:4326')
    ].reduce((a, b) => [...a, b.x, b.y], [])
        : [parseFloat(bounds.minx), parseFloat(bounds.miny), parseFloat(bounds.maxx), parseFloat(bounds.maxy)];

    let isWorldView = false;
    if (projection === 'EPSG:4326') {
        isWorldView = Math.abs(bounds.maxx - bounds.minx) >= 360;
    } else if (projection === 'EPSG:900913' || projection === 'EPSG:3857') {
        isWorldView = Math.abs(bounds.maxx - bounds.minx) >= 20037508.342789244 * 2;
    }

    return isWorldView ? [0, extent[1], 360, extent[3]] :
        [(extent[0] + 180) % 360, extent[1], (extent[2] + 180) % 360, extent[3]].map((e, i) => {
            if (i % 2 === 0) {
                return e < 0 ? 360 + e : e;
            }
            return e;
        });
};

/**
 * Reproject extent from EPSG different from 'EPSG:4326'
 * @param extent {array} array of bounds [minx, miny, maxx, maxy] or isIDL `true` [[..bounds], [..bounds]]
 * @param projection {string} the projection of extent coordinates
 * @param isIDL {boolean} intersect the international date line
 * @return {array} extent
 */
const reprojectExtent = (extent, projection, isIDL) => {
    if (projection === 'EPSG:4326') {
        return extent;
    }
    return !isIDL ? [
        reproject([extent[0], extent[1]], 'EPSG:4326', projection),
        reproject([extent[2], extent[3]], 'EPSG:4326', projection)
    ].reduce((a, b) => [...a, b.x, b.y], [])
        : extent.map(ext => [
            reproject([ext[0], ext[1]], 'EPSG:4326', projection),
            reproject([ext[2], ext[3]], 'EPSG:4326', projection)
        ].reduce((a, b) => [...a, b.x, b.y], []));
};

const getPolygonFromExtent = (extent) => {
    if (extent) {
        if (extent.hasOwnProperty('geometry') && extent.geometry.type === "Polygon") {
            return extent;
        }
        return bboxPolygon(extent);
    }
    return null;
};
/**
 * Reproject extent to verify the intersection with the international date line (isIDL)
 * if on IDL return double extent array
 * @param bounds {object} {minx, miny, maxx, maxy}
 * @param projection {string} the projection of bounds
 * @return {object} {extent, isIDL}
 */
const getExtentFromNormalized = (bounds, projection) => {
    const normalizedXExtent = normalizeExtent(bounds, projection);
    const isIDL = normalizedXExtent[2] < normalizedXExtent[0];

    if (isIDL) {
        return {
            extent: reprojectExtent([[
                -180,
                normalizedXExtent[1],
                normalizedXExtent[2] - 180,
                normalizedXExtent[3]
            ], [
                normalizedXExtent[0] - 180,
                normalizedXExtent[1],
                180,
                normalizedXExtent[3]
            ]], projection, isIDL),
            isIDL};
    }
    return {
        extent: reprojectExtent([
            normalizedXExtent[0] - 180,
            normalizedXExtent[1],
            normalizedXExtent[2] - 180,
            normalizedXExtent[3]
        ], projection, isIDL),
        isIDL};
};

const crsCodeTable = {
    'wgs84': 4326,
    'wgs1984': 4326,
    'crs84': 4326,
    'ogccrs84': 4326,
    'lambert93': 2154,
    'rgflambert93': 2154
};

/**
 * Utilities for Coordinates conversion.
 * @memberof utils
 */
const CoordinatesUtils = {
    setCrsLabels(labels) {
        crsLabels = assign({}, crsLabels, labels);
    },
    getUnits: function(projection) {
        const proj = new Proj4js.Proj(projection);
        return proj.units || 'degrees';
    },
    reproject,
    /**
     * Creates a bbox of size dimensions areund the center point given to it given the
     * resolution and the rotation
     * @param center {object} the x,y coordinate of the point
     * @param resolution {number} the resolution of the map
     * @param rotation {number} the optional rotation of the new bbox
     * @param size {object} width,height of the desired bbox
     * @return {object} the desired bbox {minx, miny, maxx, maxy}
     */
    getProjectedBBox: function(center, resolution, rotation = 0, size) {
        let dx = resolution * size[0] / 2;
        let dy = resolution * size[1] / 2;
        let cosRotation = Math.cos(rotation);
        let sinRotation = Math.sin(rotation);
        let xCos = dx * cosRotation;
        let xSin = dx * sinRotation;
        let yCos = dy * cosRotation;
        let ySin = dy * sinRotation;
        let x = center.x;
        let y = center.y;
        let x0 = x - xCos + ySin;
        let x1 = x - xCos - ySin;
        let x2 = x + xCos - ySin;
        let x3 = x + xCos + ySin;
        let y0 = y - xSin - yCos;
        let y1 = y - xSin + yCos;
        let y2 = y + xSin + yCos;
        let y3 = y + xSin - yCos;
        let bounds = CoordinatesUtils.createBBox(
            Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3),
            Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3));
        return bounds;
    },
    /**
     * Returns a bounds object.
     * @param {number} minX Minimum X.
     * @param {number} minY Minimum Y.
     * @param {number} maxX Maximum X.
     * @param {number} maxY Maximum Y.
     * @return {Object} Extent.
     */
    createBBox(minX, minY, maxX, maxY) {
        return { minx: minX, miny: minY, maxx: maxX, maxy: maxY };
    },
    /**
     * Reprojects a geojson from a crs into another
     */
    reprojectGeoJson: function(geojson, fromParam = "EPSG:4326", toParam = "EPSG:4326") {
        let from = fromParam;
        let to = toParam;
        if (typeof from === 'string') {
            from = determineCrs(from);
        }
        if (typeof to === 'string') {
            to = determineCrs(to);
        }
        let transform = proj4(from, to);

        return traverseGeoJson(geojson, (gj) => {
            // No easy way to put correct CRS info into the GeoJSON,
            // and definitely wrong to keep the old, so delete it.
            if (gj.crs) {
                delete gj.crs;
            }
            // Strip Z coord if present fixes #2638 Proj4 transform only bidimensional coordinates
            gj.coordinates = traverseCoords(gj.coordinates, ([x, y]) => {
                return transform.forward([x, y]);
            });
        }, (gj) => {
            if (gj.bbox) {
                // A bbox can't easily be reprojected, just reprojecting
                // the min/max coords definitely will not work since
                // the transform is not linear (in the general case).
                // Workaround is to just re-compute the bbox after the
                // transform.
                gj.bbox = (() => {
                    let min = [Number.MAX_VALUE, Number.MAX_VALUE];
                    let max = [-Number.MAX_VALUE, -Number.MAX_VALUE];
                    traverseGeoJson(gj, function(_gj) {
                        traverseCoords(_gj.coordinates, function(xy) {
                            min[0] = Math.min(min[0], xy[0]);
                            min[1] = Math.min(min[1], xy[1]);
                            max[0] = Math.max(max[0], xy[0]);
                            max[1] = Math.max(max[1], xy[1]);
                        });
                    });
                    return [min[0], min[1], max[0], max[1]];
                })();
            }
        });
    },
    lineIntersectPolygon: function(linestring, polygon) {
        let polygonLines = polygonToLinestring(polygon).features[0];
        return lineIntersect(linestring, polygonLines).features.length !== 0;
    },
    normalizePoint,
    normalizeLng: (lng) => {
        let tLng = lng / 360 % 1 * 360;
        if (tLng < -180) {
            tLng = tLng + 360;
        } else if (tLng > 180) {
            tLng = tLng - 360;
        }
        return tLng;
    },
    /**
     * Reprojects a bounding box.
     * @param bbox {array} [minx, miny, maxx, maxy]
     * @param source {string} SRS of the given bbox
     * @param dest {string} SRS of the returned bbox
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
    getCompatibleSRS(srs, allowedSRS) {
        if (srs === 'EPSG:900913' && !allowedSRS['EPSG:900913'] && allowedSRS['EPSG:3857']) {
            return 'EPSG:3857';
        }
        if (srs === 'EPSG:3857' && !allowedSRS['EPSG:3857'] && allowedSRS['EPSG:900913']) {
            return 'EPSG:900913';
        }
        return srs;
    },
    getEquivalentSRS(srs) {
        if (srs === 'EPSG:900913' || srs === 'EPSG:3857') {
            return ['EPSG:3857', 'EPSG:900913'];
        }
        return [srs];
    },
    getEPSGCode(code) {
        if (code.indexOf(':') !== -1) {
            return 'EPSG:' + code.substring(code.lastIndexOf(':') + 1);
        }
        return code;
    },
    normalizeSRS: function(srs, allowedSRS) {
        const result = srs === 'EPSG:900913' ? 'EPSG:3857' : srs;
        if (allowedSRS && !allowedSRS[result]) {
            return CoordinatesUtils.getCompatibleSRS(result, allowedSRS);
        }
        return result;
    },
    isAllowedSRS(srs, allowedSRS) {
        return allowedSRS[CoordinatesUtils.getCompatibleSRS(srs, allowedSRS)];
    },
    getAvailableCRS: function() {
        let crsList = {};
        for (let a in Proj4js.defs) {
            if (Proj4js.defs.hasOwnProperty(a)) {
                crsList[a] = {label: crsLabels[a] || a};
            }
        }
        return crsList;
    },
    filterCRSList: (availableCRS, filterAllowedCRS, additionalCRS, projDefs ) => {
        let crs = Object.keys(availableCRS).reduce( (p, c) => {
            return assign({}, filterAllowedCRS.indexOf(c) === -1 ? p : {...p, [c]: availableCRS[c]});
        }, {});
        const codeProjections = projDefs.map(p => p.code);
        let newAdditionalCRS = Object.keys(additionalCRS).reduce( (p, c) => {
            return assign({}, codeProjections.indexOf(c) === -1 ? p : {...p, [c]: additionalCRS[c]});
        }, {});
        return assign({}, crs, newAdditionalCRS);
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

        var azimuth = (Math.atan2(y, x) * 180.0 / Math.PI + 360 ) % 360;

        return azimuth;
    },
    /**
    * Calculate length based on haversine or vincenty formula
    * @param {object[]} coords projected in EPSG:4326
    * @return {number} length in meters
    */
    calculateDistance: (coords = [], formula = "haversine") => {
        if (coords.length >= 2 && Object.keys(FORMULAS).indexOf(formula) !== -1) {
            return FORMULAS[formula](coords);
        }
        return 0;
    },
    FORMULAS,
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
    /**
     * Calculates the extent for the geoJSON passed. It used a small buffer for points.
     * Like turf/bbox but works only with simple geometries.
     * @deprecated  We may replace it with turf/bbox + turf/buffer in the future, so using it with geometry is discouraged
     * @param {geoJSON|geometry} GeoJSON or geometry
     * @return {array} extent of the geoJSON
     */
    getGeoJSONExtent: function(geoJSON) {
        let newExtent = [Infinity, Infinity, -Infinity, -Infinity];
        const reduceCollectionExtent = (extent, collectionElement) => {
            let ext = CoordinatesUtils.getGeoJSONExtent(collectionElement);
            if (this.isValidExtent(ext)) {
                return this.extendExtent(ext, extent);
            }
            return ext;
        };
        if (geoJSON.coordinates) {
            if (geoJSON.type === "Point") {
                let point = geoJSON.coordinates;
                newExtent[0] = point[0] - point[0] * 0.01;
                newExtent[1] = point[1] - point[1] * 0.01;
                newExtent[2] = point[0] + point[0] * 0.01;
                newExtent[3] = point[1] + point[1] * 0.01;
            }
            // other kinds of geometry
            const flatCoordinates = chunk(flattenDeep(geoJSON.coordinates), 2);
            return flatCoordinates.reduce((extent, point) => {
                return [
                    point[0] < extent[0] ? point[0] : extent[0],
                    point[1] < extent[1] ? point[1] : extent[1],
                    point[0] > extent[2] ? point[0] : extent[2],
                    point[1] > extent[3] ? point[1] : extent[3]
                ];
            }, newExtent);

        } else if (geoJSON.type === "GeometryCollection") {
            let geometries = geoJSON.geometries;
            return geometries.reduce(reduceCollectionExtent, newExtent);
        } else if (geoJSON.type) {
            if (geoJSON.type === "FeatureCollection") {
                return geoJSON.features.reduce(reduceCollectionExtent, newExtent);
            } else if (geoJSON.type === "Feature" && geoJSON.geometry) {
                return CoordinatesUtils.getGeoJSONExtent(geoJSON.geometry);
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
            extent[0] > extent[2] || extent[1] > extent[3]
        );
    },
    calculateCircleCoordinates: function(center, radius, sides, rotation) {
        let angle = Math.PI * (1 / sides - 1 / 2);

        if (rotation) {
            angle += rotation / 180 * Math.PI;
        }

        let rotatedAngle; let x; let y;
        let points = [[]];
        for (let i = 0; i < sides; i++) {
            rotatedAngle = angle + i * 2 * Math.PI / sides;
            x = center.x + radius * Math.cos(rotatedAngle);
            y = center.y + radius * Math.sin(rotatedAngle);
            points[0].push([x, y]);
        }

        points[0].push(points[0][0]);
        return points;
    },
    /**
     * Generate arcs between a series of points
     * @param {number[]} coordinates of points of a LineString reprojected in 4326
     * @param {object} options of the great circle drawMethod
     * npoints: number of points
     * offset: offset controls the likelyhood that lines will be split which cross the dateline. The higher the number the more likely.
     * properties: line feature properties
     * @return {number[]} for each couple of points it creates an arc of 100 points by default
    */
    transformLineToArcs: (coordinates, options = {npoints: 100, offset: 10, properties: {}}) => {
        let arcs = [];
        for (let i = 0; i < coordinates.length - 1; ++i) {
            const p1 = coordinates[i];
            const p2 = coordinates[i + 1];
            const start = toPoint(p1);
            const end = toPoint(p2);
            if (!(p1[0] === p2[0] && p1[1] === p2[1])) {
                let grCircle = greatCircle(start, end, options);
                arcs = [...arcs, ...grCircle.geometry.coordinates];
            }
        }
        return arcs;
    },
    transformArcsToLine: (coordinates, npoints = 100) => {
        if (coordinates.length <= npoints) {
            return [head(coordinates), last(coordinates)];
        } else if (coordinates.length > npoints) {
            return [head(coordinates)].concat(CoordinatesUtils.transformArcsToLine(slice(coordinates, npoints)));
        }
        return [];
    },
    coordsOLtoLeaflet: ({coordinates, type}) => {
        switch (type) {
        case "Polygon": {
            return coordinates.map(c => {
                return c.map(point => point.reverse());
            });
        }
        case "LineString": {
            return coordinates.map(point => point.reverse());
        }
        case "Point": {
            return coordinates.reverse();
        }
        default: return [];
        }
    },
    mergeToPolyGeom(features) {
        if (features.length === 1) {
            return features[0].geometry;
        }
        return {
            type: "GeometryCollection",
            geometries: features.map( ({geometry}) => geometry)
        };
    },
    /**
     * Return the viewport geometry from the view bounds
     * @param bounds {object} bounds {minx, miny, maxx, maxy}
     * @param projection {string} the projection of bounds coordinates
     * @return {object} geometry {type, radius, projection, coordinates, extent, center}
     */
    getViewportGeometry: (bounds, projection) => {
        if (head(supportedSplitExtentEPSG.filter(epsg => epsg === projection))) {
            const {extent, isIDL} = getExtentFromNormalized(bounds, projection);

            const extentToCoordinates = isIDL ? extent : [extent];

            const coordinates = extentToCoordinates.map(ext => {
                const start = [ext[0], ext[1]];
                const end = [ext[2], ext[3]];
                return [[start, [start[0], end[1]], end, [end[0], start[1]], start]];
            });

            if (isIDL) {

                let centerX = extent[1][0] + (Math.abs(extent[0][0] - extent[0][2]) + Math.abs(extent[1][0] - extent[1][2])) / 2;
                centerX = centerX > 180 ? centerX - 360 : centerX;

                return {
                    type: 'MultiPolygon',
                    radius: 0,
                    projection,
                    coordinates,
                    extent,
                    center: [centerX, (extent[0][1] + extent[0][3]) / 2]
                };
            }

            return {
                type: 'Polygon',
                radius: 0,
                projection,
                coordinates: coordinates[0],
                extent,
                center: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
            };
        }

        const extent = [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy];
        const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
        const start = [extent[0], extent[1]];
        const end = [extent[2], extent[3]];
        const coordinates = [[start, [start[0], end[1]], end, [end[0], start[1]], start]];

        return {
            type: 'Polygon',
            radius: 0,
            projection,
            coordinates,
            extent,
            center
        };
    },
    getProjUrl,
    /**
     * Get wider and valid extent in viewport
     * @private
     * @param bbox {object} viewport bbox
     * @param bbox.bounds {object} bounds of bbox {minx, miny, maxx, maxy}
     * @param bbox.crs {string} bbox crs
     * @param dest {string} SRS of the returned extent
     * @return {array} [ minx, miny, maxx, maxy ]
     */
    getExtentFromViewport: ({ bounds, crs } = {}, dest = 'EPSG:4326') => {
        if (!bounds || !crs) return null;
        const { extent } = CoordinatesUtils.getViewportGeometry(bounds, crs);
        if (extent.length === 4) {
            return CoordinatesUtils.reprojectBbox(extent, crs, dest);
        }
        const [ rightExtentWidth, leftExtentWidth ] = extent.map((bbox) => bbox[2] - bbox[0]);
        return rightExtentWidth > leftExtentWidth
            ? CoordinatesUtils.reprojectBbox(extent[0], crs, dest)
            : CoordinatesUtils.reprojectBbox(extent[1], crs, dest);
    },
    /**
     * @param crs in the form EPSG:4326
     * @return {Object} a promise for fetching the proj4 definition
    */
    fetchProjRemotely: (crs, url) => {
        const EPSG = crs.split(":").length === 2 ? crs.split(":")[1] : "3857";
        return axios.get(url || getProjUrl(EPSG), null, {
            timeout: 2000
        });
    },
    /**
     * Parse the URN to get EPSG code
     * @param {object|string} crs object or string
     * @return {string} EPSG in the form EPSG:NNNN
     */
    parseURN: (crs) => {
        const code = crs && crs.properties && crs.properties.name || crs && crs.name || crs && crs.properties && crs.properties.code || crs;

        let crsCode = code && last(code.split(":"));

        if (crsCode === "WGS 1984" || crsCode === "WGS84") {
            return "EPSG:4326";
        } else if (crsCode) {
            // TODO check is valid EPSG code
            return "EPSG:" + crsCode;
        }
        return null;
    },
    determineCrs,
    parseString: (str) => {
        const coord = str.split(' ');
        const x = parseFloat(coord[0]);
        const y = parseFloat(coord[1]);
        return !isNaN(x) && !isNaN(y) && {x, y} || null;
    },
    getWMSBoundingBox: (BoundingBox, mapSRS) => {
        const SRS = mapSRS || 'EPSG:3857';
        const bbox = BoundingBox && isArray(BoundingBox) && head(BoundingBox.filter(b => {
            return b && b.$ && b.$.SRS === SRS && b.$.maxx && b.$.maxy && b.$.minx && b.$.miny;
        }).map(b => b && b.$ && CoordinatesUtils.reprojectBbox([
            parseFloat(b.$.minx),
            parseFloat(b.$.miny),
            parseFloat(b.$.maxx),
            parseFloat(b.$.maxy)
        ], SRS, 'EPSG:4326')));
        return isArray(bbox) && {minx: bbox[0], miny: bbox[1], maxx: bbox[2], maxy: bbox[3]} || null;
    },
    isSRSAllowed: (srs) => {
        return !!Proj4js.defs(srs);
    },
    /**
     * Return normalized latitude and longitude
     * @param coords {object} coordinates {lat, lng}
     * @return {object} {lat, lng}
     */
    getNormalizedLatLon: ({lng = 1, lat = 1}) => {
        return {
            lat: lat,
            lng: CoordinatesUtils.normalizeLng(lng)
        };
    },
    /**
     * Return true if coordinates are inside of visible area
     * @param coords {object} coordinates {lat, lng}
     * @param map {object} must contain present map
     * @param layout {object} current layout on map {bottom, top, left, right}
     * @param resolution {number} resolutions of current map zoom
     * @return {bool}
     */
    isInsideVisibleArea: (coords, map, layout = {}, resolution = 0) => {

        const normalizedCoords = CoordinatesUtils.getNormalizedLatLon(coords);
        const reprojectedCoords = reproject([normalizedCoords.lng, normalizedCoords.lat], 'EPSG:4326', map.projection);
        if (!map.bbox) {
            return false;
        }
        const bbox = CoordinatesUtils.reprojectBbox(map.bbox.bounds, map.bbox.crs, map.projection);

        const layoutBounds = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...layout
        };

        const visibleExtent = {
            minx: bbox[0] + layoutBounds.left * resolution,
            miny: bbox[1] + layoutBounds.bottom * resolution,
            maxx: bbox[2] - layoutBounds.right * resolution,
            maxy: bbox[3] - layoutBounds.top * resolution
        };

        const splittedView = CoordinatesUtils.getViewportGeometry(visibleExtent, map.projection);
        const views = splittedView.extent.length === 4 ? [[...splittedView.extent]] : [...splittedView.extent];

        return head(views.map(extent =>
            reprojectedCoords.x >= extent[0]
            && reprojectedCoords.y >= extent[1]
            && reprojectedCoords.x <= extent[2]
            && reprojectedCoords.y <= extent[3])
            .filter(val => val)) || false;
    },
    /**
     * Return new center position based of visible area
     * @param center {object} new visible center {lat, lng}
     * @param map {object} must contain present map
     * @param layout {object} current layout on map {bottom, top, left, right}
     * @param resolution {number} resolutions of current map zoom
     * @return {object} {pos, zoom, crs}
     */
    centerToVisibleArea: (center, map, layout = {}, resolution = 0) => {

        const normalizedCoords = CoordinatesUtils.getNormalizedLatLon(center);
        const reprojectedCoords = reproject([normalizedCoords.lng, normalizedCoords.lat], 'EPSG:4326', map.projection);

        const layoutBounds = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...layout
        };

        const visibleSize = {
            width: (map.size.width - layoutBounds.right - layoutBounds.left) * resolution,
            height: (map.size.height - layoutBounds.top - layoutBounds.bottom) * resolution
        };

        const mapExtent = {
            minx: reprojectedCoords.x - visibleSize.width / 2 - layoutBounds.left * resolution,
            miny: reprojectedCoords.y - visibleSize.height / 2 - layoutBounds.bottom * resolution,
            maxx: reprojectedCoords.x + visibleSize.width / 2 + layoutBounds.right * resolution,
            maxy: reprojectedCoords.y + visibleSize.height / 2 + layoutBounds.top * resolution
        };

        const splittedView = CoordinatesUtils.getViewportGeometry(mapExtent, map.projection);

        if (splittedView.extent.length === 4) {
            return {
                pos: reproject([splittedView.extent[0] + map.size.width / 2 * resolution, splittedView.extent[1] + map.size.height / 2 * resolution], map.projection, 'EPSG:4326'),
                zoom: map.zoom,
                crs: 'EPSG:4326'
            };
        }

        if (Math.abs(splittedView.extent[0][2] - splittedView.extent[0][0]) > Math.abs(splittedView.extent[1][2] - splittedView.extent[1][0])) {
            const pos = reproject([splittedView.extent[0][2] - map.size.width / 2 * resolution, splittedView.extent[0][3] - map.size.height / 2 * resolution], map.projection, 'EPSG:4326');
            const adjustedPos = {...pos, x: pos.x + (normalizedCoords.lng > pos.x ? 360 : 0)};
            return {
                pos: adjustedPos,
                zoom: map.zoom,
                crs: 'EPSG:4326'
            };
        }

        return {
            pos: reproject([splittedView.extent[1][0] + map.size.width / 2 * resolution, splittedView.extent[1][1] + map.size.height / 2 * resolution], map.projection, 'EPSG:4326'),
            zoom: map.zoom,
            crs: 'EPSG:4326'
        };
    },
    calculateCircleRadiusFromPixel: (coordinatesFromPixelConverter, pixel = {}, center = [], pixelRadius, defaultRadius = 0.01) => {
        const radiusA = isArray(center) ? center : [center.x, center.y];

        if (isNumber(radiusA[0]) && !isNaN(radiusA[0]) &&
            isNumber(radiusA[1]) && !isNaN(radiusA[1]) &&
            isNumber(pixel.x) && !isNaN(pixel.x) &&
            isNumber(pixel.y) && !isNaN(pixel.y)) {
            const pixelCoords = isFunction(coordinatesFromPixelConverter) ? coordinatesFromPixelConverter([
                pixel.x,
                pixel.y >= pixelRadius ? pixel.y - pixelRadius : pixel.y + pixelRadius
            ]) : null;
            const radiusB = pixelCoords && (isArray(pixelCoords) ? pixelCoords : [pixelCoords.x, pixelCoords.y]);

            return isArray(radiusB) ? Math.sqrt((radiusA[0] - radiusB[0]) * (radiusA[0] - radiusB[0]) +
                (radiusA[1] - radiusB[1]) * (radiusA[1] - radiusB[1])) :
                defaultRadius;
        }

        return defaultRadius;
    },
    /**
     * choose to round or floor value incase of 0 fractional digits
     * @return {number} the rounded value or the original one
    */
    roundCoord: ({ roundingBehaviour = "round", value = 0, maximumFractionDigits = 0 } = {}) => {
        if (maximumFractionDigits === 0 && Math[roundingBehaviour]) {
            return Math[roundingBehaviour](value);
        }
        return value;
    },
    midpoint: (p1, p2, returnArray = false) => {
        const pObj1 = isArray(p1) ? {x: p1[0], y: p1[1]} : p1;
        const pObj2 = isArray(p2) ? {x: p2[0], y: p2[1]} : p2;
        const result = {x: 0.5 * (pObj1.x + pObj2.x), y: 0.5 * (pObj1.y + pObj2.y)};

        return returnArray ? [result.x, result.y] : result;
    },
    pointObjectToArray: p => isObject(p) && isNumber(p.x) && isNumber(p.y) ? [p.x, p.y] : p,
    getExtentFromNormalized,
    getPolygonFromExtent,
    isPointInsideExtent: (point = {lat: 1, lng: 1}, extent) => {
        return contains(getPolygonFromExtent(extent), toPoint([point.lng, point.lat]));
    },
    isBboxCompatible: (extent1, extent2) => overlap(extent1, extent2) || contains(extent1, extent2) || contains(extent2, extent1),
    extractCrsFromURN: (urnString) => {
        if (urnString) {
            const parts = urnString.split(':');

            const validURN = parts[0] === 'urn' &&
                (parts[1] === 'ogc' || parts[1] === 'x-ogc') &&
                parts[2] === 'def' &&
                parts[3] === 'crs' &&
                (!!parts[4] || !!parts[6]);

            if (validURN) {
                const authority = parts[4];
                const code = parts[6];

                return authority ? `${authority}:${code}` : code;
            }
        }

        return null;
    },
    crsCodeTable,
    makeNumericEPSG: (epsg) => {
        if (!epsg || epsg.slice(0, 5) !== 'EPSG:') {
            return null;
        }

        const epsgCode = epsg.slice(5);
        const epsgCodeNum = parseInt(epsgCode, 10);

        if (epsgCodeNum >= 1024 && epsgCodeNum <= 32767) {
            return epsg;
        }

        const epsgCodeNormalized = epsgCode.replace(' ', '').replace(':', '').toLowerCase();
        const epsgCodeNewNum = crsCodeTable[epsgCodeNormalized];

        if (epsgCodeNewNum >= 1024 && epsgCodeNewNum <= 32767) {
            return `EPSG:${epsgCodeNewNum}`;
        }

        return null;
    },
    makeBboxFromOWS: (lcOWS, ucOWS) => {
        let lc = [lcOWS[0], lcOWS[1]];
        let uc = [ucOWS[0], ucOWS[1]];

        // lower is actually upper?
        if (lc[1] > uc[1]) {
            const t = lc;
            lc = uc;
            uc = t;
        }

        // lower right upper left instead of lower left upper right?
        if (lc[0] > uc[0]) {
            const lcOld = lc.slice();
            const ucOld = uc.slice();

            lc = [ucOld[0], lcOld[1]];
            uc = [lcOld[0], ucOld[1]];
        }

        return [lc[0], lc[1], uc[0], uc[1]];
    }

};

module.exports = CoordinatesUtils;
