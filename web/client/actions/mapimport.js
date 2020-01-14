/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const SET_LAYERS = 'IMPORT::SET_LAYERS';
const ON_ERROR = 'IMPORT::ON_ERROR';
const ON_SELECT_LAYER = 'IMPORT::ON_SELECT_LAYER';
const LOADING = 'IMPORT::LOADING';
const ON_LAYER_ADDED = 'IMPORT::ON_LAYER_ADDED';
const UPDATE_BBOX = 'IMPORT::UPDATE_BBOX';
const ON_SUCCESS = 'IMPORT::ON_SUCCESS';
const ON_SHAPE_ERROR = 'ON_SHAPE_ERROR';
const ON_LAYER_SKIPPED = 'IMPORT::ON_LAYER_SKIPPED';

function setLayers(layers, errors) {
    return {
        type: SET_LAYERS,
        layers,
        errors
    };
}
function onSelectLayer(layer) {
    return {
        type: ON_SELECT_LAYER,
        layer
    };
}
function onError(error) {
    return {
        type: ON_ERROR,
        error
    };
}
function setLoading(status) {
    return {
        type: LOADING,
        status
    };
}
function onLayerAdded(layer) {
    return {
        type: ON_LAYER_ADDED,
        layer
    };
}
function updateBBox(bbox) {
    return {
        type: UPDATE_BBOX,
        bbox
    };
}
function onSuccess(message) {
    return {
        type: ON_SUCCESS,
        message
    };
}
function onShapeError(message) {
    return {
        type: ON_SHAPE_ERROR,
        message
    };
}
function onLayerSkipped(layer) {
    return {
        type: ON_LAYER_SKIPPED,
        layer
    };
}

module.exports = {
    SET_LAYERS,
    ON_ERROR,
    LOADING,
    ON_SELECT_LAYER,
    ON_LAYER_ADDED,
    UPDATE_BBOX,
    ON_SUCCESS,
    ON_SHAPE_ERROR,
    ON_LAYER_SKIPPED,
    onShapeError,
    setLayers,
    onError,
    setLoading,
    onSelectLayer,
    onLayerAdded,
    updateBBox,
    onSuccess,
    onLayerSkipped
};
