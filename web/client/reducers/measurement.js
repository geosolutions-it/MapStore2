/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {
    CHANGE_MEASUREMENT,
    CHANGE_MEASUREMENT_STATE
} = require('../actions/measurement');

const assign = require('object-assign');

function measurement(state = {
    lineMeasureEnabled: false,
    areaMeasureEnabled: false,
    bearingMeasureEnabled: false
}, action) {
    switch (action.type) {
        case CHANGE_MEASUREMENT:
            return assign({}, state, {
                measurement: action.measurement
            });
        case CHANGE_MEASUREMENT_STATE:
            return assign({}, state, {
                lineMeasureEnabled: action.lineMeasureEnabled,
                areaMeasureEnabled: action.areaMeasureEnabled,
                bearingMeasureEnabled: action.bearingMeasureEnabled,
                geomType: action.geomType,
                len: action.len,
                area: action.area,
                bearing: action.bearing
            });
        default:
            return state;
    }
}

module.exports = measurement;
