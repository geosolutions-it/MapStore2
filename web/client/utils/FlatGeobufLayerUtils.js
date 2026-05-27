/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isWGS84Equivalent } from './ProjectionUtils';
import { FGB_MATCH_ALL_RECT } from '../api/FlatGeobuf';
/**
 * Extract GeometryType from flatgeobuf metadata using flatgeobuf.readMetadata() method
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

/**
 * Extract the source CRS identifier from a raw FGB metadata object
 * (field sourceMetadata of a layerNode or the object returned by getCapabilities).
 * Returns 'EPSG:4326' as default if metadata has no crs entry
 * Known geographic CRS that are equivalent to WGS84 are normalized to
 * EPSG:4326 to avoid incorrect bbox transforms from axis-order differences.
 * @param {object} metadata raw FGB header metadata
 * @returns {string} CRS identifier, default value 'EPSG:4326'
 */
export const getFlatGeobufCrsFromMetadata = (metadata) => {
    const crs = metadata?.crs;
    if (crs?.org && crs?.code !== undefined) {
        const crsId = `${crs.org}:${crs.code}`;
        return isWGS84Equivalent(crsId) ? 'EPSG:4326' : crsId;
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

/**
 * Translate a 4326 dataExtent into an FGB streamSearch rect. Polar / global
 * view extents transform to EPSG:4326 with longitude spans that exceed 180
 * degrees (polar projections are a longitude singularity at the pole; OL's
 * transformExtent samples 8 points and bounds them, producing a band like
 * [-180, 70, 180, 90]). The rtree filter would then either crash on
 * non-finite values or silently miss features whose lon falls outside the
 * reported band. We detect both cases and substitute a wider rect:
 *   - non-finite values: use the match-all (Infinity) rect
 *   - longitude span > 180: keep the latitude bounds, open longitude
 *     to [-180, 180] so all longitudes pass while the lat band still
 *     prunes the rtree.
 * @param {array} dataExtent [minX, minY, maxX, maxY] in EPSG:4326
 * @returns {object} FGB rect {minX, minY, maxX, maxY}
 */
export const toFgbRect = (dataExtent) => {
    const [minX, minY, maxX, maxY] = dataExtent;
    const finite = [minX, minY, maxX, maxY].every(Number.isFinite);
    if (!finite) {
        return FGB_MATCH_ALL_RECT;
    }
    if (maxX - minX > 180) {
        return { minX: -180, minY, maxX: 180, maxY };
    }
    return { minX, minY, maxX, maxY };
};

/**
 * FGB query rect: { minX, minY, maxX, maxY }; note the uppercase X/Y. The
 * flatgeobuf library destructures these exact keys in streamSearch; lowercase
 * keys silently produce a no-op filter (every feature matches), which causes
 * the entire file to be downloaded instead of just the bbox-relevant features.
 * @param {object} outer FGB rect
 * @param {object} inner FGB rect
 * @returns {boolean} true if outer contains inner
 */
export const fgbRectContains = (outer, inner) =>
    outer && inner
    && outer.minX <= inner.minX && outer.maxX >= inner.maxX
    && outer.minY <= inner.minY && outer.maxY >= inner.maxY;
