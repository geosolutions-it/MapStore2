/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_TYPE_CHANGED} = require('../actions/maptype');
/**
 * stores state for the mapType to use (typically one of leaflet, openlayers, cesium... )
 * @memberof reducers
 * @param  {Object} [state={mapType: "leaflet"}] the initial state
 * @param  {} action  the action gets `MAP_TYPE_CHANGED`
 * @return {Object} the new state
 * @example
 * {
 *  mapType: "leaflet"
 * }
 */
function maptype(state = {mapType: "leaflet"}, action) {
    switch (action.type) {
    case MAP_TYPE_CHANGED:
        return {mapType: action.mapType};
    default:
        return state;
    }
}

module.exports = maptype;
