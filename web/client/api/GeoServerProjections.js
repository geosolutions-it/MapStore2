/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '../libs/ajax';

export const DEFAULT_LIMIT = 200; // kept low for the search panel; endpoint allows up to 200
export const DEFAULT_PAGE = 1;
export const DEFAULT_AUTHORITY = ''; // or EPSG?

/**
 * convert bboxes object in array format, suitable for MapStore and OpenLayers
 * Sample input extents from geoserver /rest/crs/{id}.json response:
  @param {Object} extents - object containing "bbox" and "bboxWGS84" properties, each with minX, minY, maxX, maxY
  @returns {Object} - object with "extent" and "worldExtent" properties, each an array [minX, minY, maxX, maxY]
  Sample input:
  "bbox": {
        "minX": 270929.9561293494,
        "minY": 2002224.111228647,
        "maxX": 302793.2719302393,
        "maxY": 2026749.0694562676
    },
    "bboxWGS84": {
        "minX": -63.22,
        "minY": 18.11,
        "maxX": -62.92,
        "maxY": 18.33
    }
   }
 */
export function formatCrsExtents({bbox, bboxWGS84}) {
    if (!bbox && !bboxWGS84) return {};
    return {
        extent: [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
        worldExtent: [bboxWGS84.minX, bboxWGS84.minY, bboxWGS84.maxX, bboxWGS84.maxY]
    };
}

export function searchProjections(endpointUrl, query, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, authority = DEFAULT_AUTHORITY) {

    return axios.get(`${endpointUrl}/rest/crs`, {
        params: {
            ...(query ? { query } : {}),
            ...(authority ? { authority } : {}),
            offset: (page - 1) * limit,
            limit
        }
    }).then((res) => {
        return {
            results: res.data.crs || [],     // [{ id, href }] - href not used for fetch
            total: res.data.page?.total ?? 0
        };
    });
}

/**
 * Uses /rest/crs/{id}.json directly - URL constructed from endpointUrl + id, href not needed
 * @param {string} endpointUrl - base URL of the GeoServer REST API
 * @param {string} id - projection code (e.g. "EPSG:32632")
 * @returns {Promise} Resolves to { code, def } where def is the WKT string
 */
export function getProjectionDef(endpointUrl, id) {
    // TODO probably use the specific href for the crs, returned by the search endpoint, instead of constructing it from endpointUrl + id
    return axios.get(`${endpointUrl}/rest/crs/${id}.json`)
        .then((res) => {
            // definition field is in WKT v1 string

            const defproj = res.data.definition?.trim() || '';

            return {
                // TODO add also label from name fielnd, example: "name": "Monte Mario / Italy zone 1",
                code: res.data.id,
                def: defproj,  // WKT v1 string
                ...formatCrsExtents(res.data)
            };
        });
}
