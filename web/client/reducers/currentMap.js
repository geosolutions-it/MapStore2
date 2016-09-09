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
    THUMBNAIL_ERROR, MAP_UPDATING, SAVE_MAP, DISPLAY_METADATA_EDIT, RESET_UPDATING
} = require('../actions/maps');


const assign = require('object-assign');

const initialState = {
    files: [],
    errors: [],
    newThumbnail: null,
    thumbnailError: null,
    displayMetadataEdit: false
};

function currentMap(state = initialState, action) {
    switch (action.type) {
        case EDIT_MAP: {
            return assign({}, state, action.map, {newThumbnail: (action.map && action.map.thumbnail) ? action.map.thumbnail : null, displayMetadataEdit: true, thumbnailError: null });
        }
        case UPDATE_CURRENT_MAP: {
            return assign({}, state, {newThumbnail: action.thumbnail, files: action.files});
        }
        case MAP_UPDATING: {
            return assign({}, state, {updating: true});
        }
        case ERROR_CURRENT_MAP: {
            return assign({}, state, {thumbnailError: null, errors: action.errors});
        }
        case THUMBNAIL_ERROR: {
            return assign({}, state, {thumbnailError: action.error, errors: [], updating: false});
        }
        case SAVE_MAP: {
            return assign({}, state, {thumbnailError: null});
        }
        case DISPLAY_METADATA_EDIT: {
            return assign({}, state, {displayMetadataEdit: action.displayMetadataEditValue});
        }
        case RESET_UPDATING: {
            return assign({}, state, {updating: false});
        }
        default:
            return state;
    }
}

module.exports = currentMap;
