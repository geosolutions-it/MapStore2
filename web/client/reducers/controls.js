/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTY,
    SET_CONTROL_PROPERTIES,
    RESET_CONTROLS
} from '../actions/controls';

import {IDENTIFY_IS_MOUNTED} from "../actions/mapInfo";

/**
 * Manages the state of the controls in MapStore2
 * The root elements of the state returned by this reducers ar variable, but they have
 * this shape
 * ```
 * {
 *   [action.control]: {
 *     [action.property]: action.value
 *   }
 * }
 * ```
 * where:
 * @prop {string} action.control identifier, used as key
 * @prop {string} action.property the proeprty to set, by default enabled
 * @prop {boolean|string|number|object} action.value the value of the action. If not present is a boolean that toggles
 * @example
 * {
 *   controls: {
 *     help: {
 *       enabled: false
 *     },
 *     print: {
 *       enabled: false
 *     },
 *     toolbar: {
 *       active: null,
 *       expanded: false
 *     },
 *     drawer: {
 *       enabled: false,
 *       menu: '1'
 *     }
 *   }
 * }
 * @memberof reducers
 */
function controls(state = {}, action) {
    switch (action.type) {
    case TOGGLE_CONTROL:
        const property = action.property || 'enabled';
        return Object.assign({}, state, {
            [action.control]: Object.assign({}, state[action.control], {
                [property]: !(state[action.control] || {})[property]
            })
        });
    case SET_CONTROL_PROPERTY:
        if (action.toggle === true && state[action.control] && state[action.control][action.property] === action.value) {
            return Object.assign({}, state, {
                [action.control]: Object.assign({}, state[action.control], {
                    [action.property]: undefined
                })
            });
        }
        return Object.assign({}, state, {
            [action.control]: Object.assign({}, state[action.control], {
                [action.property]: action.value
            })
        });
    case SET_CONTROL_PROPERTIES: {
        return Object.assign({}, state, {
            [action.control]: Object.assign({}, state[action.control], action.properties)
        });
    }
    case RESET_CONTROLS: {
        const newControls = Object.keys(state).filter(c => (action.skip || []).indexOf(c) === -1);
        const resetted = newControls.reduce((previous, controlName) => {
            return Object.assign(previous, {
                [controlName]: Object.assign({}, state[controlName], state[controlName].enabled === true ? {
                    enabled: false
                } : {})
            });
        }, {});
        return Object.assign({}, state, resetted);
    }
    case IDENTIFY_IS_MOUNTED: {
        return {
            ...state,
            info: {
                ...state.info,
                available: action.isMounted
            }
        };
    }
    default:
        return state;
    }
}

export default controls;
