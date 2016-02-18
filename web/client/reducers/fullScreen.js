/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var {TOGGLE_FULLSCREEN} = require('../actions/fullScreen');
const assign = require('object-assign');

function fullScreen(state = null, action) {
    switch (action.type) {
        case TOGGLE_FULLSCREEN:
            return assign({}, state, {
                fullscreen: action.fullscreen
            });
        default:
            return state;
    }
}

module.exports = fullScreen;


