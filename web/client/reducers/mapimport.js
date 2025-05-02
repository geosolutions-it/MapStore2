/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SET_LAYERS,
    ON_ERROR,
    ON_SELECT_LAYER,
    LOADING,
    ON_LAYER_ADDED,
    UPDATE_BBOX,
    ON_SUCCESS,
    ON_SHAPE_ERROR,
    ON_LAYER_SKIPPED
} from '../actions/mapimport';

import { uniqWith } from 'lodash';
import { TOGGLE_CONTROL } from '../actions/controls';

const initialState = {
    layers: null,
    errors: null,
    loading: false,
    selected: null,
    bbox: [190, 190, -190, -190]
};

function mapimport(state = initialState, action) {
    switch (action.type) {
    case ON_SHAPE_ERROR: {
        return Object.assign({}, state, {error: action.message, success: null});
    }
    case SET_LAYERS: {
        let selected = action.layers && action.layers[0] ? action.layers[0] : null;
        const errors = action.layers ? action.errors : null;
        return Object.assign({}, state, {layers: action.layers, selected: selected, bbox: [190, 190, -190, -190], errors}, selected ? {} : {success: null});
    }
    case ON_ERROR: {
        return Object.assign({}, state, {
            // remove duplicates
            errors: uniqWith(
                [...(state.errors || []), action.error],
                (a, b) =>
                    (a.name && a.name === b.name || a.filename && a.filename === b.fileName) && a.message === b.message
            ), success: null});
    }
    case LOADING: {
        return Object.assign({}, state, {loading: action.status});
    }
    case ON_SELECT_LAYER: {
        return Object.assign({}, state, {selected: action.layer});
    }
    case ON_LAYER_ADDED: {
        let newLayers = state.layers.filter((l) => {
            return action.layer.name !== l.name;
        }, this);
        let selected = newLayers && newLayers[0] ? newLayers[0] : null;
        return Object.assign({}, state, {layers: newLayers, selected: selected}, !selected ? {bbox: [190, 190, -190, -190]} : {});
    }
    case UPDATE_BBOX: {
        return Object.assign({}, state, {bbox: action.bbox});
    }
    case ON_SUCCESS: {
        return Object.assign({}, state, {success: action.message, errors: null, error: null});
    }
    case TOGGLE_CONTROL: {
        // TODO check this. if it must remain
        if (action.control === 'shapefile') {
            return Object.assign({}, state, {errors: null, success: null});
        }
        return state;
    }
    case ON_LAYER_SKIPPED: {
        const newLayers = state.layers.filter((l) => {
            return action.layer.name !== l.name;
        }, this);
        const selected = newLayers && newLayers[0] ? newLayers[0] : null;
        return Object.assign({}, state, {layers: newLayers, selected, success: null});
    }
    default:
        return state;
    }
}

export default mapimport;
