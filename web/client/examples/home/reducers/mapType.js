/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_TYPE_CHANGED} = require('../actions/mapType');

function mapType(state = "leaflet", action) {
    switch (action.type) {
        case MAP_TYPE_CHANGED:
            return action.mapType;
        default:
            return state;
    }
}

module.exports = mapType;
