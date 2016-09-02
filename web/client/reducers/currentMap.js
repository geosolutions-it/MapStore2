/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    EDIT_MAP, UPDATE_CURRENT_MAP, ERROR_CURRENT_MAP
} = require('../actions/currentMap');

const {
    THUMBNAIL_ERROR
} = require('../actions/maps');


const assign = require('object-assign');

const initialState = {
    files: [],
    errors: [],
    newThumbnail: null
};

function currentMap(state = initialState, action) {
    switch (action.type) {
        case EDIT_MAP: {
            return assign({}, state, action.map, {newThumbnail: (action.map && action.map.thumbnail) ? action.map.thumbnail : null });
        }
        case UPDATE_CURRENT_MAP: {
            return assign({}, state, {newThumbnail: action.thumbnail, files: action.files});
        }
        case ERROR_CURRENT_MAP: {
            return assign({}, state, {thumbnailError: null, errors: action.errors});
        }
        case THUMBNAIL_ERROR: {
            return assign({}, state, {thumbnailError: action.error || null, errors: null });
        }
        default:
            return state;
    }
}

module.exports = currentMap;
