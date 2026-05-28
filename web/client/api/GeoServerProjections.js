/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import proj4 from 'proj4';

import axios from '../libs/ajax';
import { getMetersPerUnit } from '../utils/MapUtils';

export const DEFAULT_LIMIT = 20;
export const DEFAULT_PAGE = 1;
export const DEFAULT_AUTHORITY = '';

// A bbox is well-ordered only when minX < maxX and minY < maxY. GeoServer
// occasionally reports wrap-around / antimeridian-crossing bboxes
// (e.g. CRS:83 returns minX=167.65, maxX=-40.73), which would break tile-math
// downstream (getResolutionsForProjection ends up dividing by zero on a
// negative width). We surface this as a load error so the projection is
// rejected up-front instead of silently registering a broken extent.
export const isValidBbox = (bbox) => !!bbox
    && Number.isFinite(bbox.minX) && Number.isFinite(bbox.minY)
    && Number.isFinite(bbox.maxX) && Number.isFinite(bbox.maxY)
    && bbox.minX < bbox.maxX && bbox.minY < bbox.maxY;

// proj4 must parse the WKT and emit a unit MapStore can resolve to a
// meters-per-unit value (via getMetersPerUnit). A unit string that exists
// but isn't recognized is just as bad as a missing one: ProjectionRegistry's
// 'm' fallback would silently mislabel the projection as metric and break
// tile-math downstream. Reject up-front so the popover row carries a clear
// failure reason instead.
export const isValidDef = (definition) => {
    if (!definition || typeof definition !== 'string') return false;
    try {
        const parsed = proj4(definition);
        const unit = parsed && parsed.oProj && parsed.oProj.units;
        return Number.isFinite(getMetersPerUnit(unit));
    } catch (e) {
        return false;
    }
};

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
            // Reject up-front when the server reports a malformed bbox: registering
            // such a projection would propagate negative-width extents into OL
            // tile-math and crash unrelated consumers (CoordinatesUtils, MapGrids,
            // etc). The error.message flows into loadProjectionDefError so the
            // popover row shows the failed marker with this reason.
            if (!isValidBbox(res.data?.bbox)) {
                throw new Error('Invalid coordinate bounds reported by server');
            }
            // definition field is in WKT v1 string
            const defproj = res.data.definition?.trim() || '';
            // Reject when the WKT is unparseable or carries no unit. Without
            // this, register() in ProjectionRegistry would fall back to 'm',
            // silently misregistering the projection as metric.
            if (!isValidDef(defproj)) {
                throw new Error('Unparseable or unitless projection definition');
            }

            return {
                // TODO add also label from name fielnd, example: "name": "Monte Mario / Italy zone 1",
                code: res.data.id,
                def: defproj,  // WKT v1 string
                ...formatCrsExtents(res.data)
            };
        });
}
