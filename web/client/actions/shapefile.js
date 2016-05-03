/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ON_SHAPE_CHOOSEN = 'ON_SHAPE_CHOOSEN';
const ON_SHAPE_ERROR = 'ON_SHAPE_ERROR';
const ON_SELECT_LAYER = 'ON_SELECT_LAYER';
const SHAPE_LOADING = 'SHAPE_LOADING';
const ON_LAYER_ADDED = 'ON_LAYER_ADDED';


function onShapeChoosen(layers) {
    return {
        type: ON_SHAPE_CHOOSEN,
        layers
    };
}
function onSelectLayer(layer) {
    return {
        type: ON_SELECT_LAYER,
        layer
    };
}
function onShapeError(message) {
    return {
        type: ON_SHAPE_ERROR,
        message
    };
}
function shapeLoading(status) {
    return {
        type: SHAPE_LOADING,
        status
    };
}
function onLayerAdded(layer) {
    return {
        type: ON_LAYER_ADDED,
        layer
    };
}
module.exports = {
    ON_SHAPE_CHOOSEN,
    ON_SHAPE_ERROR,
    SHAPE_LOADING,
    ON_SELECT_LAYER,
    ON_LAYER_ADDED,
    onShapeChoosen,
    onShapeError,
    shapeLoading,
    onSelectLayer,
    onLayerAdded
};
