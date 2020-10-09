/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const SET_LAYERS = 'IMPORT::SET_LAYERS';
export const ON_ERROR = 'IMPORT::ON_ERROR';
export const ON_SELECT_LAYER = 'IMPORT::ON_SELECT_LAYER';
export const LOADING = 'IMPORT::LOADING';
export const ON_LAYER_ADDED = 'IMPORT::ON_LAYER_ADDED';
export const UPDATE_BBOX = 'IMPORT::UPDATE_BBOX';
export const ON_SUCCESS = 'IMPORT::ON_SUCCESS';
export const ON_SHAPE_ERROR = 'ON_SHAPE_ERROR';
export const ON_LAYER_SKIPPED = 'IMPORT::ON_LAYER_SKIPPED';

export function setLayers(layers, errors) {
    return {
        type: SET_LAYERS,
        layers,
        errors
    };
}
export function onSelectLayer(layer) {
    return {
        type: ON_SELECT_LAYER,
        layer
    };
}
export function onError(error) {
    return {
        type: ON_ERROR,
        error
    };
}
export function setLoading(status) {
    return {
        type: LOADING,
        status
    };
}
export function onLayerAdded(layer) {
    return {
        type: ON_LAYER_ADDED,
        layer
    };
}
export function updateBBox(bbox) {
    return {
        type: UPDATE_BBOX,
        bbox
    };
}
export function onSuccess(message) {
    return {
        type: ON_SUCCESS,
        message
    };
}
export function onShapeError(message) {
    return {
        type: ON_SHAPE_ERROR,
        message
    };
}
export function onLayerSkipped(layer) {
    return {
        type: ON_LAYER_SKIPPED,
        layer
    };
}
