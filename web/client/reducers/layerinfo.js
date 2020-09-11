/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { findIndex } from 'lodash';

import {
    SELECT_LAYERS,
    SET_LAYERS,
    UPDATE_LAYER,
    RESET_SYNC_STATUS,
    UPDATE_SYNC_STATUS,
    SET_ERROR,
    LOADING
} from '../actions/layerinfo';

import { set } from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case SELECT_LAYERS: {
        return set('layers', state.layers?.map(layer => ({...layer, selected: findIndex(action.layers, layerId => layerId === layer.id) > -1})), state);
    }
    case SET_LAYERS: {
        return set('layers', action.layers, state);
    }
    case UPDATE_LAYER: {
        const layers = state.layers || [];
        const layerIndex = action.layer?.id ? findIndex(layers, {id: action.layer.id}) : -1;
        return set('layers', layers.map((layer, idx) => idx === layerIndex ? {...layer, ...action.layer} : layer), state);
    }
    case RESET_SYNC_STATUS: {
        return set('syncStatus', {updatedCount: '0', totalCount: `${action.totalCount}`}, state);
    }
    case UPDATE_SYNC_STATUS: {
        const updatedCount = parseInt(state.syncStatus?.updatedCount, 10);
        return set('syncStatus', {...state.syncStatus, updatedCount: `${updatedCount + 1}`}, state);
    }
    case SET_ERROR: {
        return set('error', action.error, state);
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
};
