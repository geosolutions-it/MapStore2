/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR} = require('../actions/config');

var assign = require('object-assign');
var ConfigUtils = require('../utils/ConfigUtils');

function mapConfig(state = null, action) {
    switch (action.type) {
        case MAP_CONFIG_LOADED:
            // we get from the configuration what will be used as the initial state
            let mapState = action.legacy ? ConfigUtils.convertFromLegacy(action.config) : ConfigUtils.normalizeConfig(action.config.map);
            // we store the map initial state for future usage
            return assign({}, mapState, {mapInitialConfig: mapState.map});
        case MAP_CONFIG_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        default:
            return state;
    }
}

module.exports = mapConfig;
