/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER, CHANGE_ZOOM_LVL, CHANGE_MAP_CRS} = require('../actions/map');

var assign = require('object-assign');

function mapConfig(state = null, action) {
    switch (action.type) {
        case CHANGE_MAP_VIEW:
            return assign({}, state, {
                center: action.center,
                zoom: action.zoom,
                bbox: action.bbox,
                size: action.size,
                mapStateSource: action.mapStateSource
            });
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
        default:
            return state;
    }
}

module.exports = mapConfig;
