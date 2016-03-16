/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {TOGGLE_CONTROL, SHOW_TOOLBAR_CONTROL, CHOOSE_MENU} = require('../actions/controls');
const assign = require('object-assign');
const initialState = {
    help: {
        enabled: false
    },
    toolbar: {
        active: null
    },
    drawer: {
        enabled: false,
        menu: "1"
    }
};
function controls(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_CONTROL:
            return assign({}, state, {
                [action.control]: assign({}, state[action.control], {enabled: !state[action.control].enabled})
            });
        case SHOW_TOOLBAR_CONTROL:
            return assign({}, state, {
                toolbar: assign({}, state.toolbar, {active: action.control})
            });
        case CHOOSE_MENU:
            return assign({}, state, {
                drawer: assign({}, state.drawer, {menu: action.menu === state.drawer.menu ? null : action.menu})
            });
        default:
            return state;
    }
}

module.exports = controls;
