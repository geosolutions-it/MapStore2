/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ON_SHAPE_CHOOSEN,
    ON_SHAPE_ERROR,
    SHAPE_LOADING
} = require('../actions/shapefile');

const assign = require('object-assign');

const initialState = {
    layers: null,
    error: null,
    loading: false
};

function shapefile(state = initialState, action) {
    switch (action.type) {
        case ON_SHAPE_CHOOSEN: {
            return assign({}, state, {layers: action.layers});
        }
        case ON_SHAPE_ERROR: {
            return assign({}, state, {error: action.message});
        }
        case SHAPE_LOADING: {
            return assign({}, state, {loading: action.status});
        }
        default:
            return state;
    }
}

module.exports = shapefile;
