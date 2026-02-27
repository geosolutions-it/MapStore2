/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SELECT_STORE_CFG, ADD_OR_UPDATE_SELECTION, SELECT_CLEAN_SELECTION, UPDATE_SELECTION_FEATURE } from '../actions/layersSelection';

/**
 * Reducer for managing selection configuration and selection data per layer.
 *
 * @param {Object} state - Current selection state.
 * @param {Object} state.cfg - Selection configuration object.
 * @param {Object} state.selections - GeoJSON selection results keyed by layer ID.
 * @param {Object} action - Redux action.
 * @param {string} action.type - Action type.
 * @returns {Object} New state after applying the action.
 */
export default function layersSelection(state = {cfg: {}, selections: {}}, action) {
    switch (action.type) {
    case SELECT_STORE_CFG: {
        return {
            ...state,
            cfg: action.cfg
        };
    }
    case ADD_OR_UPDATE_SELECTION: {
        return {
            ...state,
            selections: {...state.selections, [action.layer.id]: action.geoJsonData}
        };
    }
    case SELECT_CLEAN_SELECTION: {
        return {
            ...state,
            drawType: action.geomType,
            ...((action.geomType !== state.drawType) && {
                selectionFeature: null
            })
        };
    }
    case UPDATE_SELECTION_FEATURE: {
        return {
            ...state,
            selectionFeature: action.feature
        };
    }
    default:
        return state;
    }
}
