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
    RESET_GEOMETRY,
    CHANGED_GEOMETRY,
    CHANGE_FORMAT,
    CHANGE_COORDINATES,
    UPDATE_MEASURES,
    INIT
} = require('../actions/measurement');
const {TOGGLE_CONTROL, RESET_CONTROLS, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {set} = require('../utils/ImmutableUtils');
const {isPolygon} = require('../utils/openlayers/DrawUtils');
const {dropRight} = require('lodash');

const assign = require('object-assign');
const defaultState = {
    lineMeasureEnabled: true,
    geomType: "LineString",
    areaMeasureEnabled: false,
    bearingMeasureEnabled: false,
    customStartEndPoint: {
        startPointOptions: {
            radius: 3,
            fillColor: "green"
        },
        endPointOptions: {
            radius: 3,
            fillColor: "red"
        }
    },
    uom: {
        length: {unit: 'm', label: 'm'},
        area: {unit: 'sqm', label: 'm²'}
    },
    lengthFormula: "haversine",
    showLabel: true
};
function measurement(state = defaultState, action) {
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
            feature: {
                properties: {
                    disabled: true
                }
            }
        });
    }
    case CHANGE_MEASUREMENT_STATE: {
        let feature = action.feature;
        if (isPolygon(feature)) {
            /* in the state the polygon is always not closed (the feature come closed from the measureSupport)
             * a selector validates the feature and it closes the polygon adding first valid coord
             */
            feature = set("geometry.coordinates[0]", dropRight(feature.geometry.coordinates[0]), feature);
        }
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
            feature: set("properties.disabled", state.feature.properties.disabled, feature)
        });
    }
    case UPDATE_MEASURES: {
        const {point, len, area, bearing} = action.measures;
        return {
            ...state,
            point,
            len,
            area,
            bearing
        };
    }
    case RESET_GEOMETRY: {
        let newState = set("feature.properties.disabled", true, state);
        return {
            ...newState,
            isDrawing: true,
            updatedByUI: false
        };
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
            }),
            updatedByUI: true
        });
    }
    case CHANGED_GEOMETRY: {
        let {feature} = action;
        feature = set("properties.disabled", false, feature);
        return {
            ...state,
            feature,
            updatedByUI: false,
            isDrawing: false
        };
    }
    case TOGGLE_CONTROL: {
        // TODO: remove this when the controls will be able to be mutually exclusive
        if (action.control === 'info') {
            return {
                ...state,
                len: 0,
                area: 0,
                bearing: 0,
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false,
                feature: { properties: {
                    disabled: true
                }},
                geomType: ""
            };
        }
        if (action.control === 'measure') {
            return {
                ...state,
                geomType: "",
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false
            };
        }
        return state;
    }
    case SET_CONTROL_PROPERTY: {
        if (action.control === 'measure' && action.value === false) {
            return {
                ...state,
                geomType: "",
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false
            };
        }
        return state;
    }
    case RESET_CONTROLS: {
        return {
            ...state,
            len: 0,
            area: 0,
            bearing: 0,
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            feature: { properties: {
                disabled: true
            }},
            geomType: ""
        };
    }
    case CHANGE_FORMAT: {
        return {...state, format: action.format};
    }
    case INIT: {
        return {...state, ...action.defaultOptions};
    }
    case CHANGE_COORDINATES: {
        let coordinates = action.coordinates.map(c => ([c.lon, c.lat]));
        // wrap in an array for polygon geom
        coordinates = state.areaMeasureEnabled ? dropRight(coordinates) : coordinates;
        return {
            ...state,
            feature: {
                type: "Feature",
                properties: {
                    disabled: coordinates.filter((c) => {
                        const isValid = !isNaN(parseFloat(c[0])) && !isNaN(parseFloat(c[1]));
                        return isValid;
                    }).length !== coordinates.length
                },
                geometry: {
                    type: state.bearingMeasureEnabled ? "LineString" : state.geomType,
                    coordinates: state.areaMeasureEnabled ? [coordinates] : coordinates
                }
            },
            updatedByUI: true
        };
    }
    default:
        return state;
    }
}

module.exports = measurement;
