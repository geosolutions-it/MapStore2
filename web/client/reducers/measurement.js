/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {
    CHANGE_MEASUREMENT_TOOL,
    CHANGE_MEASUREMENT_STATE
} = require('../actions/measurement');

const assign = require('object-assign');

function measurement(state = {
    lineMeasureEnabled: false,
    areaMeasureEnabled: false,
    bearingMeasureEnabled: false
}, action) {
    switch (action.type) {
        case CHANGE_MEASUREMENT_TOOL:
            return assign({}, state, {
                pointMeasureEnabled: ((action.geomType !== state.geomType) && (action.geomType === 'Point')),
                lineMeasureEnabled: ((action.geomType !== state.geomType) && (action.geomType === 'LineString')),
                areaMeasureEnabled: ((action.geomType !== state.geomType) && (action.geomType === 'Polygon')),
                bearingMeasureEnabled: ((action.geomType !== state.geomType) && (action.geomType === 'Bearing')),
                geomType: (action.geomType === state.geomType) ? null : action.geomType
            });
        case CHANGE_MEASUREMENT_STATE:
            return assign({}, state, {
                pointMeasureEnabled: action.pointMeasureEnabled,
                lineMeasureEnabled: action.lineMeasureEnabled,
                areaMeasureEnabled: action.areaMeasureEnabled,
                bearingMeasureEnabled: action.bearingMeasureEnabled,
                geomType: action.geomType,
                point: action.point,
                len: action.len,
                area: action.area,
                bearing: action.bearing,
                lenUnit: action.lenUnit,
                areaUnit: action.areaUnit
            });
        default:
            return state;
    }
}

module.exports = measurement;
