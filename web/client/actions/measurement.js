/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const CHANGE_MEASUREMENT_TOOL = 'CHANGE_MEASUREMENT_TOOL';
const CHANGE_MEASUREMENT_STATE = 'CHANGE_MEASUREMENT_STATE';
const CHANGE_UOM = 'MEASUREMENT:CHANGE_UOM';
const CHANGED_GEOMETRY = 'MEASUREMENT:CHANGED_GEOMETRY';
const SET_STYLE = 'MEASUREMENT:SET_STYLE';
const SET_TEXT_LABELS = 'MEASUREMENT:SET_TEXT_LABELS';
const ADD_AS_LAYER = 'MEASUREMENT:ADD_AS_LAYER';
const RESET_GEOMETRY = 'MEASUREMENT:RESET_GEOMETRY';
const CHANGE_FORMAT = 'MEASUREMENT:CHANGE_FORMAT';
const CHANGE_COORDINATES = 'MEASUREMENT:CHANGE_COORDINATES';
const ADD_MEASURE_AS_ANNOTATION = 'MEASUREMENT:ADD_MEASURE_AS_ANNOTATION';
const UPDATE_MEASURES = 'MEASUREMENT:UPDATE_MEASURES';
const INIT = 'MEASUREMENT:INIT';

/**
 * trigger the epic to add the measure feature into an annotation.
*/
function addAnnotation(features, textLabels, uom) {
    return {
        type: ADD_MEASURE_AS_ANNOTATION,
        features,
        textLabels,
        uom
    };
}

// TODO: the measurement control should use the "controls" state
function toggleMeasurement(measurement) {
    return {
        type: CHANGE_MEASUREMENT_TOOL,
        ...measurement
    };
}

function changeMeasurement(measurement) {
    return (dispatch) => {
        dispatch(toggleMeasurement(measurement));
    };
}

/**
 * @param {string} uom length or area
 * @param {string} value unit of uom
 * @param {object} previous uom object
*/
function changeUom(uom, value, previousUom) {
    return {
        type: CHANGE_UOM,
        uom,
        value,
        previousUom
    };
}

function changeGeometry(features) {
    return {
        type: CHANGED_GEOMETRY,
        features
    };
}
function setStyle(style) {
    return {
        type: SET_STYLE,
        style
    };
}
function setTextLabels(textLabels) {
    return {
        type: SET_TEXT_LABELS,
        textLabels
    };
}
function addAsLayer(features, textLabels, uom) {
    return {
        type: ADD_AS_LAYER,
        features,
        textLabels,
        uom
    };
}

function changeFormatMeasurement(format) {
    return {
        type: CHANGE_FORMAT,
        format
    };
}
function changeCoordinates(coordinates) {
    return {
        type: CHANGE_COORDINATES,
        coordinates
    };
}
function resetGeometry() {
    return {
        type: RESET_GEOMETRY
    };
}
function updateMeasures(measures) {
    return {
        type: UPDATE_MEASURES,
        measures
    };
}
function changeMeasurementState(measureState) {
    return {
        type: CHANGE_MEASUREMENT_STATE,
        pointMeasureEnabled: measureState.pointMeasureEnabled,
        lineMeasureEnabled: measureState.lineMeasureEnabled,
        areaMeasureEnabled: measureState.areaMeasureEnabled,
        bearingMeasureEnabled: measureState.bearingMeasureEnabled,
        geomType: measureState.geomType,
        values: measureState.values,
        feature: measureState.feature
    };
}
function init(defaultOptions = {}) {
    return {
        type: INIT,
        defaultOptions
    };
}

module.exports = {
    CHANGE_MEASUREMENT_TOOL,
    CHANGE_MEASUREMENT_STATE,
    changeUom, CHANGE_UOM,
    changeGeometry, CHANGED_GEOMETRY,
    setStyle, SET_STYLE,
    setTextLabels, SET_TEXT_LABELS,
    addAsLayer, ADD_AS_LAYER,
    changeFormatMeasurement, CHANGE_FORMAT,
    updateMeasures, UPDATE_MEASURES,
    changeCoordinates, CHANGE_COORDINATES,
    resetGeometry, RESET_GEOMETRY,
    addAnnotation, ADD_MEASURE_AS_ANNOTATION,
    init, INIT,
    changeMeasurement,
    toggleMeasurement,
    changeMeasurementState
};
