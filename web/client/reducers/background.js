/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    SET_LAYER_BACKGROUND,
    SET_START_BACKGROUND
} = require('../actions/background');

const assign = require('object-assign');

const initialState = {
    currentLayer: {},
    start: 0,
    tempLayer: {}
};

function background(state = initialState, action) {
    switch (action.type) {
        case SET_LAYER_BACKGROUND:
            return assign({}, state, { [action.name]: action.layer });
        case SET_START_BACKGROUND:
            return assign({}, state, { start: action.start });
        default:
            return state;
    }
}

module.exports = background;
