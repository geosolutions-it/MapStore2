/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Convert a WKT sub-string of geometries to a geoJSON Point
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON point
 */
const parsePoint = (coordinates) => {
    const [x, y] = coordinates.split(' ').map(parseFloat);
    return {
        type: 'Point',
        coordinates: [x, y]
    };
};

/**
 * Convert a WKT sub-string of geometries to a geoJSON LineString
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON LineString
 */
const parseLineString = (coordinates) => {
    const points = coordinates.split(',').map(point => {
        const [x, y] = point.trim().split(' ').map(parseFloat);
        return [x, y];
    });
    return {
        type: 'LineString',
        coordinates: points
    };
};

/**
 * Convert a WKT sub-string of geometries to a geoJSON Polygon
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON Polygon
 */
const parsePolygon = (coordinates) => {
    const rings = coordinates.split('),').map(ring => {
        const points = ring.replace('(', '').trim().split(',').map(point => {
            const [x, y] = point.trim().split(' ').map(parseFloat);
            return [x, y];
        });
        return points;
    });
    return {
        type: 'Polygon',
        coordinates: rings
    };
};

/**
 * Convert a WKT sub-string of geometries to a geoJSON MultiPoint
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON MultiPoint
 */
const parseMultiPoint = (coordinates) => {
    const points = coordinates.split(',').map(point => {
        const [x, y] = point
            /*
            MultiPoint can have these forms. Remove the parenthesis to support both,
            given that we are parsing one single point.
            MULTIPOINT ((10 40), (40 30), (20 20), (30 10))
            MULTIPOINT (10 40, 40 30, 20 20, 30 10)
            */
            .replace('(', '').replace(')', '')
            .trim().split(' ').map(parseFloat);
        return [x, y];
    });
    return {
        type: 'MultiPoint',
        coordinates: points
    };
};

/**
 * Convert a WKT sub-string of geometries to a geoJSON MultiLineString
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON MultiLineString
 */
const parseMultiLineString = (coordinates) => {
    const lines = coordinates.split('),').map(line => {
        const points = line.replace('(', '').trim().split(',').map(point => {
            const [x, y] = point.trim().split(' ').map(parseFloat);
            return [x, y];
        });
        return points;
    });
    return {
        type: 'MultiLineString',
        coordinates: lines
    };
};

/**
 * Convert a WKT sub-string of geometries to a geoJSON MultiPolygon
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON MultiPolygon
 */
const parseMultiPolygon = (coordinates) => {
    const polygons = coordinates.split(')),').map(polygon => {
        const rings = polygon.replace('(', '').trim().split('),').map(ring => {
            const points = ring.replace('(', '').trim().split(',').map(point => {
                const [x, y] = point.trim().split(' ').map(parseFloat);
                return [x, y];
            });
            return points;
        });
        return rings;
    });
    return {
        type: 'MultiPolygon',
        coordinates: polygons
    };
};
let toGeoJSON;

/**
 * Convert a WKT sub-string of geometries to a geoJSON GeometryCollection
 * @private
 * @param {string} coordinates coordinates string
 * @returns {object} geoJSON GeometryCollection
 */
const parseGeometryCollection = (coordinates) => {
    const geometries = coordinates.split('),').map(geometry => {
        const type = geometry.substring(0, geometry.indexOf('(')).trim().toUpperCase();
        const coords = geometry.substring(geometry.indexOf('(') + 1).trim();
        return toGeoJSON(`${type}(${coords})`);
    });
    return {
        type: 'GeometryCollection',
        geometries: geometries
    };
};

toGeoJSON = (rawWkt) => {
    // Remove any leading or trailing white spaces from the WKT
    let wkt = rawWkt.trim();

    // Determine the geometry type based on the initial keyword
    const type = wkt.substring(0, wkt.indexOf('(')).trim().toUpperCase();

    // Extract the coordinates from the inner part of the WKT
    const coordinates = wkt.substring(wkt.indexOf('(') + 1, wkt.lastIndexOf(')')).trim();

    // Parse the coordinates based on the geometry type
    let result;
    switch (type) {
    case 'POINT':
        result = parsePoint(coordinates);
        break;
    case 'LINESTRING':
        result = parseLineString(coordinates);
        break;
    case 'POLYGON':
        result = parsePolygon(coordinates);
        break;
        // Add support for additional geometry types here
    case 'MULTIPOINT':
        result = parseMultiPoint(coordinates);
        break;
    case 'MULTILINESTRING':
        result = parseMultiLineString(coordinates);
        break;
    case 'MULTIPOLYGON':
        result = parseMultiPolygon(coordinates);
        break;
    case 'GEOMETRYCOLLECTION':
        result = parseGeometryCollection(coordinates);
        break;
    default:
        throw new Error(`Not supported geometry: ${type}`);
    }

    return result;
};
/**
 * Convert a WKT sub-string of geometries to a geoJSON geometry
 * @name toGeoJSON
 * @memberof utils.ogc.Filter.WKT
 * @param {string} wkt the wkt string
 * @return {object} the geoJSON geometry
 */
export default toGeoJSON;
