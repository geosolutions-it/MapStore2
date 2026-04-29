/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { CHANGE_CRS_INPUT_VALUE, SET_CAN_EDIT_PROJECTION, SET_PROJECTIONS_CONFIG } from '../actions/crsselector';

function crsselector(state = {
    projections: [],
    config: {},
    canEdit: undefined
}, action) {
    switch (action.type) {
    case CHANGE_CRS_INPUT_VALUE:
        return {
            ...state,
            value: action.value
        };
    case SET_PROJECTIONS_CONFIG:
        // Replace, don't merge: an undefined payload signals "no persisted
        // crsSelector config in the new map" and must reset the slice so the
        // previous map's projectionList does not leak into the new map.
        return {
            ...state,
            config: action.config ?? {}
        };
    case SET_CAN_EDIT_PROJECTION:
        return {
            ...state,
            canEdit: action.canEdit
        };
    default:
        return state;
    }
}

export default crsselector;
