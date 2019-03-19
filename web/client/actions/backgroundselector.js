/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ADD_BACKGROUND = 'ADD_BACKGROUND';
const ADD_BACKGROUND_PROPERTIES = 'ADD_BACKGROUND_PROPERTIES';
const UPDATE_BACKGROUND_THUMBNAIL = 'UPDATE_BACKGROUND_THUMBNAIL';
const BACKGROUNDS_CLEAR = 'BACKGROUNDS_CLEAR';
const REMOVE_BACKGROUND_THUMBNAIL = ' REMOVE_BACKGROUND_THUMBNAIL';
const BACKGROUND_THUMBS_UPDATED = 'BACKGROUND_THUMBS_UPDATED';
const CREATE_BACKGROUNDS_LIST = 'CREATE_BACKGROUNDS_LIST';
const EDIT_BACKGROUND_PROPERTIES = 'EDIT_BACKGROUND_PROPERTIES';
const UPDATE_BACKGROUND_LAYER_PARAMETER = 'UPDATE_BACKGROUND_LAYER_PARAMETER';
const CLEAR_MODAL_PARAMETERS = 'CLEAR_MODAL_PARAMETERS';

function createBackgroundsList(backgrounds) {
    return {
       type: CREATE_BACKGROUNDS_LIST,
        backgrounds
    };
}

function backgroundThumbnailsUpdated(mapThumb, metadata, data) {
    return {
        type: BACKGROUND_THUMBS_UPDATED,
        mapThumb,
        data,
        metadata
    };
}

function addBackground(source) {
    return {
        type: ADD_BACKGROUND,
        source: source
    };
}

function addBackgroundProperties(modalParams, unsavedChanges) {
    return {
        type: ADD_BACKGROUND_PROPERTIES,
        modalParams,
        unsavedChanges
    };
}

function editBackgroundProperties(editing) {
    return {
        type: EDIT_BACKGROUND_PROPERTIES,
        editing
    };
}
function updateThumbnail(thumbnailData, thumbnail, unsavedChanges, backgroundId) {
    return {
        type: UPDATE_BACKGROUND_THUMBNAIL,
        thumbnailData,
        thumbnail,
        unsavedChanges,
        id: backgroundId
    };
}

function removeThumbnail(backgroundId) {
    return {
        type: REMOVE_BACKGROUND_THUMBNAIL,
        backgroundId
    };
}
function clearBackgrounds() {
    return {
        type: BACKGROUNDS_CLEAR
    };
}
function clearModalParameters() {
    return {
        type: CLEAR_MODAL_PARAMETERS
    };
}
function updateParams(params) {
    return {
        type: UPDATE_BACKGROUND_LAYER_PARAMETER,
        params
    };
}


module.exports = {
    CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    ADD_BACKGROUND_PROPERTIES,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    REMOVE_BACKGROUND_THUMBNAIL,
    BACKGROUND_THUMBS_UPDATED,
    EDIT_BACKGROUND_PROPERTIES,
    CLEAR_MODAL_PARAMETERS,
    UPDATE_BACKGROUND_LAYER_PARAMETER,
    editBackgroundProperties,
    createBackgroundsList,
    addBackgroundProperties,
    addBackground,
    updateThumbnail,
    clearModalParameters,
    clearBackgrounds,
    removeThumbnail,
    backgroundThumbnailsUpdated,
    updateParams
};
