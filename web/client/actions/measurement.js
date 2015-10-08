/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const CHANGE_MEASUREMENT = 'CHANGE_MEASUREMENT';
const CHANGE_MEASUREMENT_STATE = 'CHANGE_MEASUREMENT_STATE';

function changeMeasurement(measurement) {
    return {
        type: CHANGE_MEASUREMENT,
        measurement: measurement
    };
}

function changeMeasurementState(measureState) {
    return {
        type: CHANGE_MEASUREMENT_STATE,
        lineMeasureEnabled: measureState.lineMeasureEnabled,
        areaMeasureEnabled: measureState.areaMeasureEnabled,
        geomType: measureState.geomType,
        len: measureState.len,
        area: measureState.area,
        bearing: measureState.bearing
    };
}

module.exports = {
    CHANGE_MEASUREMENT,
    CHANGE_MEASUREMENT_STATE,
    changeMeasurement,
    changeMeasurementState
};
