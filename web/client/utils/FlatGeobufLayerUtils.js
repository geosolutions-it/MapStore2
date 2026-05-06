/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Extract GeometryType from flatgeobuf metadata
 * Sample of FlatGeobuf Metadata contents
 * {
    "geometryType": 6,
    "columns": [
        {
            "name": "id",
            "type": 11,
            "title": null,
            "description": null,
            "width": -1,
            "precision": -1,
            "scale": -1,
            "nullable": true,
            "unique": false,
            "primary_key": false
        },
        ...
    ],
    "envelope": {
        "0": -180,
        "1": -85.609038,
        "2": 180,
        "3": 83.64513
    },
    "featuresCount": 179,
    "indexNodeSize": 16,
    "crs": {
        "org": "EPSG",
        "code": 4326,
        "name": "WGS 84",
        ...
    },
    "title": "countries",
}
 */
const geometryTypes = {
    0:	"Unknown",
    1:	"Point",
    2:	"LineString",
    3:	"Polygon",
    4:	"MultiPoint",
    5:	"MultiLineString",
    6:	"MultiPolygon",
    7:	"GeometryCollection"
};

export const flatGeobufExtractGeometryType = metadata => {
    const {geometryType} = metadata || {};

    return geometryTypes[Number(geometryType)] || 'Unknown';
};

/**
 * Resolve a concrete GeoJSON-style geometry type name from layer options.
 * Priority:
 *   1. explicit options.geometryType (caller-provided)
 *   2. options.sourceMetadata FGB header (set by catalog on recordToLayer)
 * Returns undefined when the FGB header declares Unknown (id 0) or when
 * neither source yields a recognized name, which lets callers fall back
 * to runtime sniffing (header callback / first-feature inspection).
 * @param {object} options layer options
 * @returns {string|undefined}
 */
export const getFlatGeobufGeometryTypeFromOptions = (options) => {
    if (options?.geometryType) {
        return options.geometryType;
    }
    const fromMetadata = flatGeobufExtractGeometryType(options?.sourceMetadata);
    return fromMetadata && fromMetadata !== 'Unknown' ? fromMetadata : undefined;
};

// Geographic CRS codes that are practically equivalent to WGS84 (sub-metre
// difference) and safe to normalize to EPSG:4326.  Some of these are
// registered in OL/proj4 with axisOrientation "neu" (lat/lon instead of
// lon/lat), which makes olTransformExtent return a near-global rect when
// transforming a viewport extent to that CRS.  Since FGB stores coordinates
// in lon/lat order regardless of the declared CRS, using EPSG:4326 produces
// correct bbox transforms and correct GeoJSON reprojection.
const WGS84_EQUIVALENT_CRS = new Set([
    'EPSG:4269', // NAD83
    'EPSG:4258', // ETRS89
    'EPSG:4283', // GDA94
    'CRS:84'
]);

/**
 * Extract the source CRS identifier from a raw FGB metadata object
 * (the value of layer.sourceMetadata or the object returned by getCapabilities).
 * Returns 'EPSG:4326' when the metadata has no crs entry - the flatgeobuf
 * spec uses EPSG:4326 as the implicit default.
 * Known geographic CRS that are equivalent to WGS84 are normalized to
 * EPSG:4326 to avoid incorrect bbox transforms from axis-order differences.
 * @param {object} metadata raw FGB header metadata
 * @returns {string} CRS identifier, e.g. 'EPSG:4326'
 */
export const getFlatGeobufCrsFromMetadata = (metadata) => {
    const crs = metadata?.crs;
    if (crs?.org && crs?.code !== undefined) {
        const crsId = `${crs.org}:${crs.code}`;
        return WGS84_EQUIVALENT_CRS.has(crsId) ? 'EPSG:4326' : crsId;
    }
    return 'EPSG:4326';
};

/**
 * Extract the source CRS identifier from layer options.
 * Reads from options.sourceMetadata.crs (populated by catalog on recordToLayer).
 * Falls back to 'EPSG:4326' when sourceMetadata is absent.
 * @param {object} options layer options
 * @returns {string} CRS identifier, e.g. 'EPSG:4326'
 */
export const getFlatGeobufCrsFromOptions = (options) =>
    getFlatGeobufCrsFromMetadata(options?.sourceMetadata);
