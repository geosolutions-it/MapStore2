/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Proj4js = require('proj4').default;
const proj4 = Proj4js;
const axios = require('../libs/ajax');
const assign = require('object-assign');
const {isArray, flattenDeep, chunk, cloneDeep} = require('lodash');
const lineIntersect = require('@turf/line-intersect');
const polygonToLinestring = require('@turf/polygon-to-linestring');
const {head} = require('lodash');

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
        srs: point.srs || 'EPSG:4326'
    };
};

const reproject = (point, source, dest, normalize = true) => {
    const sourceProj = Proj4js.defs(source) ? new Proj4js.Proj(source) : null;
    const destProj = Proj4js.defs(dest) ? new Proj4js.Proj(dest) : null;
    if (sourceProj && destProj) {
        let p = isArray(point) ? Proj4js.toPoint(point) : Proj4js.toPoint([point.x, point.y]);
        const transformed = assign({}, source === dest ? p : Proj4js.transform(sourceProj, destProj, p), {srs: dest});
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
        reproject([bounds.minx, bounds.miny], projection, 'EPSG:4326'),
        reproject([bounds.maxx, bounds.maxy], projection, 'EPSG:4326')
    ].reduce((a, b) => [...a, b.x, b.y], [])
    : [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy];

    let isWorldView = false;
    if (projection === 'EPSG:4326') {
        isWorldView = Math.abs(bounds.maxx - bounds.minx) > 360;
    } else if (projection === 'EPSG:900913' || projection === 'EPSG:3857') {
        isWorldView = Math.abs(bounds.maxx - bounds.minx) > 20037508.342789244 * 2;
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
            gj.coordinates = traverseCoords(gj.coordinates, (xy) => {
                return transform.forward(xy);
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
            let ext = this.getGeoJSONExtent(collectionElement);
            if (this.isValidExtent(ext)) {
                return this.extendExtent(ext, extent);
            }
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
                return this.getGeoJSONExtent(geoJSON.geometry);
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
     * @return {object} geomtry {type, radius, projection, coordinates, extent, center}
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
     * @param crs in the form EPSG:4326
     * @return {Object} a promise for fetching the proj4 definition
    */
    fetchProjRemotely: (crs, url) => {
        const EPSG = crs.split(":").length === 2 ? crs.split(":")[1] : "3857";
        return axios.get(url || getProjUrl(EPSG), null, {
            timeout: 2000
        });
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
    }
};

module.exports = CoordinatesUtils;
