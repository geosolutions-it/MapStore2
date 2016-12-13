/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const CHANGE_MEASUREMENT_TOOL = 'CHANGE_MEASUREMENT_TOOL';
const CHANGE_MEASUREMENT_STATE = 'CHANGE_MEASUREMENT_STATE';

function changeMeasurement(measurement) {
    return {
        type: CHANGE_MEASUREMENT_TOOL,
        ...measurement
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
        point: measureState.point,
        len: measureState.len,
        area: measureState.area,
        bearing: measureState.bearing,
        lenUnit: measureState.lenUnit,
        areaUnit: measureState.areaUnit
    };
}

module.exports = {
    CHANGE_MEASUREMENT_TOOL,
    CHANGE_MEASUREMENT_STATE,
    changeMeasurement,
    changeMeasurementState
};
