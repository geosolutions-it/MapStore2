/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {TOGGLE_CONTROL, SET_CONTROL_PROPERTY} = require('../actions/controls');
const assign = require('object-assign');

function controls(state = {}, action) {
    switch (action.type) {
        case TOGGLE_CONTROL:
            const property = action.property || 'enabled';
            return assign({}, state, {
                [action.control]: assign({}, state[action.control], {
                    [property]: !(state[action.control] || {})[property]
                })
            });
        case SET_CONTROL_PROPERTY:
            return assign({}, state, {
                [action.control]: assign({}, state[action.control], {
                    [action.property]: action.value
                })
            });
        default:
            return state;
    }
}

module.exports = controls;
