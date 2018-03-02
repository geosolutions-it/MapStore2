/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    CHANGE_MEASUREMENT_TOOL,
    CHANGE_MEASUREMENT_STATE,
    CHANGE_UOM,
    CHANGE_FORMULA,
    TOGGLE_SHOW_LABEL,
    CHANGED_GEOMETRY
} = require('../actions/measurement');
const {vincenty, haversine} = require('../utils/CoordinatesUtils').FORMULAS;

const {TOGGLE_CONTROL, RESET_CONTROLS} = require('../actions/controls');

const assign = require('object-assign');

function measurement(state = {
    lineMeasureEnabled: false,
    areaMeasureEnabled: false,
    bearingMeasureEnabled: false,
    uom: {
        length: {unit: 'm', label: 'm'},
        area: {unit: 'sqm', label: 'm²'}
    },
    lengthFormula: "haversine"
}, action) {
    switch (action.type) {
    case CHANGE_MEASUREMENT_TOOL: {
        return assign({}, state, {
            lineMeasureEnabled: action.geomType !== state.geomType && action.geomType === 'LineString',
            areaMeasureEnabled: action.geomType !== state.geomType && action.geomType === 'Polygon',
            bearingMeasureEnabled: action.geomType !== state.geomType && action.geomType === 'Bearing',
            geomType: action.geomType === state.geomType ? null : action.geomType,
            len: 0,
            area: 0,
            bearing: 0,
            feature: {}
        });
    }
    case CHANGE_MEASUREMENT_STATE:
        return assign({}, state, {
            lineMeasureEnabled: action.lineMeasureEnabled,
            areaMeasureEnabled: action.areaMeasureEnabled,
            bearingMeasureEnabled: action.bearingMeasureEnabled,
            geomType: action.geomType,
            point: action.point,
            len: action.len,
            area: action.area,
            bearing: action.bearing,
            lenUnit: action.lenUnit,
            areaUnit: action.areaUnit,
            feature: action.feature
        });
    case TOGGLE_SHOW_LABEL: {
        return assign({}, state, {
            showLabel: !state.showLabel
        });
    }
    case CHANGE_UOM: {
        const prop = action.uom === "length" ? "lenUnit" : "lenArea";
        const {value, label} = action.value;
        return assign({}, state, {
            [prop]: value,
            uom: assign({}, action.previousUom, {
                [action.uom]: {
                    unit: value,
                    label
                }
            })
        });
    }
    case CHANGE_FORMULA: {
        let len = 0;
        if (state.feature && state.feature.geometry && state.feature.geometry.coordinates) {
            if (action.formula === "haversine") {
                len = haversine(state.feature.geometry.coordinates);
            } else {
                len = vincenty(state.feature.geometry.coordinates);
            }
        }
        return assign({}, state, {
            lengthFormula: action.formula,
            len
        });
    }
    case CHANGED_GEOMETRY: {
        const {feature} = action;
        return assign({}, state, {
            feature
        });
    }
    case TOGGLE_CONTROL:
        {
            // TODO: remove this when the controls will be able to be mutually exclusive
            if (action.control === 'info') {
                return {
                    lineMeasureEnabled: false,
                    areaMeasureEnabled: false,
                    bearingMeasureEnabled: false
                };
            }
        }
    case RESET_CONTROLS:
        return {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false
        };
    default:
        return state;
    }
}

module.exports = measurement;
