/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ON_SHAPE_CHOOSEN = 'ON_SHAPE_CHOOSEN';
const ON_SHAPE_ERROR = 'ON_SHAPE_ERROR';
const SHAPE_LOADING = 'SHAPE_LOADING';


function onShapeChoosen(layers) {
    return {
        type: ON_SHAPE_CHOOSEN,
        layers
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
module.exports = {
    ON_SHAPE_CHOOSEN,
    ON_SHAPE_ERROR,
    SHAPE_LOADING,
    onShapeChoosen,
    onShapeError,
    shapeLoading
};
