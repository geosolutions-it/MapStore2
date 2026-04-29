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
