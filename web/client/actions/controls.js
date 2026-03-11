/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const TOGGLE_CONTROL = 'TOGGLE_CONTROL';
export const SET_CONTROL_PROPERTY = 'SET_CONTROL_PROPERTY';
export const SET_CONTROL_PROPERTIES = 'SET_CONTROL_PROPERTIES';
export const RESET_CONTROLS = 'RESET_CONTROLS';

import { fromPairs, chunk } from 'lodash';

/**
 export * Actions for controls. Provide a simple generic functionality to toggle a generic
 * control property.
 * @name actions.controls
 */


/**
 * Toggle a control property
 * @memberof actions.controls
 * @param  {string} control  the name of the control
 * @param  {boolean|number|string|object} [property] the property to override
 * @return {object} action of type `TOGGLE_CONTROL`, control, and property
 */
export function toggleControl(control, property) {
    return {
        type: TOGGLE_CONTROL,
        control,
        property
    };
}

export function on(action, condition, elseAction) {
    return {
        type: 'IF:' + action.type,
        condition,
        elseAction,
        action
    };
}

/**
 * Sets a property in a more detailed way
 * @memberof actions.controls
 * @param {string} control  control name
 * @param {string} property the property to set
 * @param {string|number|boolean|object} value the value to set or to check for toggling
 * @param {boolean} [toggle]  if true, the reducer will toggle the property of the control only if is equal to the value parameter
 * @return {object} of type `SET_CONTROL_PROPERTY` with control, property, value and toggle params
 */
export function setControlProperty(control, property, value, toggle) {
    return {
        type: SET_CONTROL_PROPERTY,
        control,
        property,
        value,
        toggle
    };
}

/**
 * Sets a list of properties at once
 * @memberof actions.controls
 * @param {string} control  control name
 * @param {array} properties the properties to set, pairs of keys and related values
 * @return {object} of type `SET_CONTROL_PROPERTIES` with control and properties
 *
 * @example
 * setControlProperties('metadataexplorer', 'enabled', true, 'group', 'newgroup')
 */
export function setControlProperties(control, ...properties) {
    return {
        type: SET_CONTROL_PROPERTIES,
        control,
        properties: fromPairs(chunk(properties, 2))
    };
}

/**
 * Reset all the controls
 * @memberof actions.controls
 * @param {string[]} [skip=[]] a list of tools to skip
 * @return {object} action of type `RESET_CONTROLS`
 */
export function resetControls(skip = []) {
    return {
        type: RESET_CONTROLS,
        skip
    };
}
