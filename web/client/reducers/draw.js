/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    CHANGE_DRAWING_STATUS,
    SET_CURRENT_STYLE,
    GEOMETRY_CHANGED,
    DRAW_SUPPORT_STOPPED,
    TOGGLE_SNAPPING,
    SET_SNAPPING_LAYER,
    REFRESH_SNAPPING_LAYER,
    SNAPPING_IS_LOADING
} from '../actions/draw';

import assign from 'object-assign';

const initialState = {
    drawStatus: null,
    drawOwner: null,
    drawMethod: null,
    options: {},
    features: [],
    tempFeatures: [],
    snapping: false,
    snappingIsLoading: false,
    snappingLayer: false,
    snappingShouldRefresh: false
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
    case TOGGLE_SNAPPING:
        return {
            ...state,
            snapping: !state.snapping
        };
    case SET_SNAPPING_LAYER:
        return {
            ...state,
            snappingLayer: action.snappingLayer,
            snappingShouldRefresh: true,
            snappingIsLoading: false
        };
    case SNAPPING_IS_LOADING:
        return {
            ...state,
            snappingIsLoading: !state.snappingIsLoading
        };
    case REFRESH_SNAPPING_LAYER:
        return {
            ...state,
            snappingShouldRefresh: false
        };
    default:
        return state;
    }
}

export default draw;
