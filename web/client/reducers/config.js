/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR} = require('../actions/config');
var {CHANGE_MAP_VIEW} = require('../actions/map');

var ConfigUtils = require('../utils/ConfigUtils');
var assign = require('object-assign');

function mapConfig(state = null, action) {
    switch (action.type) {
        case MAP_CONFIG_LOADED:
            return action.legacy ? ConfigUtils.convertFromLegacy(action.config) : ConfigUtils.normalizeConfig(action.config.map);
        case MAP_CONFIG_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        case CHANGE_MAP_VIEW:
            return assign({}, state, {
                center: action.center,
                zoom: action.zoom,
                bbox: action.bbox,
                size: action.size
            });
        default:
            return state;
    }
}

module.exports = mapConfig;
