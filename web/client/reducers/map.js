/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL, CHANGE_MAP_CRS, ZOOM_TO_EXTENT, PAN_TO} = require('../actions/map');

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
            const zoom = MapUtils.getZoomForExtent(action.extent, state.size, 0, 21);
            const center = CoordinatesUtils.reproject(
                MapUtils.getCenterForExtent(action.extent, action.crs),
                action.crs, 'EPSG:4326');
            return assign({}, state, {
                zoom,
                center
            });
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
        default:
            return state;
    }
}

module.exports = mapConfig;
