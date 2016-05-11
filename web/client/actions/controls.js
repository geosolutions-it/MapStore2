/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const TOGGLE_CONTROL = 'TOGGLE_CONTROL';
const SET_CONTROL_PROPERTY = 'SET_CONTROL_PROPERTY';
const RESET_CONTROLS = 'RESET_CONTROLS';

function toggleControl(control, property) {
    return {
        type: TOGGLE_CONTROL,
        control,
        property
    };
}

function setControlProperty(control, property, value, toggle) {
    return {
        type: SET_CONTROL_PROPERTY,
        control,
        property,
        value,
        toggle
    };
}

function resetControls() {
    return {
        type: RESET_CONTROLS
    };
}

module.exports = {TOGGLE_CONTROL, SET_CONTROL_PROPERTY, RESET_CONTROLS,
    toggleControl, setControlProperty, resetControls};
