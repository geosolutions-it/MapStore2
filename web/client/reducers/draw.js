/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {CHANGE_DRAWING_STATUS, SET_CURRENT_STYLE, GEOMETRY_CHANGED, DRAW_SUPPORT_STOPPED} = require('../actions/draw');

const assign = require('object-assign');

const initialState = {
    drawStatus: null,
    drawOwner: null,
    drawMethod: null,
    options: {},
    features: [],
    tempFeatures: []
};

function draw(state = initialState, action) {
    switch (action.type) {
    case CHANGE_DRAWING_STATUS:
        return assign({}, state, {
            drawStatus: action.status,
            drawOwner: action.owner,
            drawMethod: action.method,
            options: action.options,
            features: action.features,
            style: action.style
        });
    case SET_CURRENT_STYLE:
        return assign({}, state, {
            currentStyle: action.currentStyle
        });
    case GEOMETRY_CHANGED:
        return assign({}, state, {tempFeatures: action.features});
    case DRAW_SUPPORT_STOPPED:
        return assign({}, state, {tempFeatures: []});
    default:
        return state;
    }
}

module.exports = draw;
