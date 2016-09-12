/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL, CHANGE_MAP_CRS, ZOOM_TO_EXTENT, PAN_TO, CHANGE_MAP_STYLE} = require('../actions/map');


var assign = require('object-assign');
var MapUtils = require('../utils/MapUtils');
var CoordinatesUtils = require('../utils/CoordinatesUtils');

function mapConfig(state = null, action) {
    switch (action.type) {
        case CHANGE_MAP_VIEW:
            const {type, ...params} = action;
            return assign({}, state, params);
        case CHANGE_MOUSE_POINTER:
            return assign({}, state, {
                mousePointer: action.pointer
            });
        case CHANGE_ZOOM_LVL:
            return assign({}, state, {
                zoom: action.zoom,
                mapStateSource: action.mapStateSource
            });
        case CHANGE_MAP_CRS:
            return assign({}, state, {
                projection: action.crs
            });
        case ZOOM_TO_EXTENT: {
            let zoom = 0;
            let bbox = CoordinatesUtils.reprojectBbox(action.extent, action.crs, state.bbox && state.bbox.crs || "EPSG:4326");
            let wgs84BBox = CoordinatesUtils.reprojectBbox(action.extent, action.crs, "EPSG:4326");
            if (bbox && wgs84BBox) {
                // center by the max. extent defined in the map's config
                let center = MapUtils.getCenterForExtent(wgs84BBox, "EPSG:4326");
                // workaround to get zoom 0 for -180 -90... - TODO do it better
                let full = action.crs === "EPSG:4326" && action.extent && action.extent[0] <= -180 && action.extent[1] <= -90 && action.extent[2] >= 180 && action.extent[3] >= 90;
                if ( full ) {
                    zoom = 2;
                } else {
                    let mapBBox = CoordinatesUtils.reprojectBbox(action.extent, action.crs, state.projection || "EPSG:4326");
                    // NOTE: STATE should contain size !!!
                    zoom = MapUtils.getZoomForExtent(mapBBox, state.size, 0, 21, null);
                }
                return assign({}, state, {
                    center,
                    zoom,
                    mapStateSource: action.mapStateSource,
                    bbox: bbox
                });
            }
            return state;
        }
        case PAN_TO: {
            const center = CoordinatesUtils.reproject(
                action.center,
                action.center.crs,
                'EPSG:4326');
            return assign({}, state, {
                center
            });
        }
        case CHANGE_MAP_STYLE: {
            return assign({}, state, {mapStateSource: action.mapStateSource, style: action.style, resize: state.resize ? state.resize + 1 : 1});
        }
        default:
            return state;
    }
}

module.exports = mapConfig;
