/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ADD_BACKGROUND = 'ADD_BACKGROUND';
const REMOVE_BACKGROUND = 'REMOVE_BACKGROUND';
const SET_CURRENT_BACKGROUND_LAYER = 'SET_CURRENT_BACKGROUND_LAYER';
const BACKGROUND_ADDED = 'BACKGROUND_ADDED';
const BACKGROUND_EDITED = 'BACKGROUND_EDITED';
const ADD_BACKGROUND_PROPERTIES = 'ADD_BACKGROUND_PROPERTIES';
const SET_BACKGROUND_MODAL_PARAMS = 'SET_BACKGROUND_MODAL_PARAMS';
const UPDATE_BACKGROUND_THUMBNAIL = 'UPDATE_BACKGROUND_THUMBNAIL';
const BACKGROUNDS_CLEAR = 'BACKGROUNDS_CLEAR';
const CREATE_BACKGROUNDS_LIST = 'CREATE_BACKGROUNDS_LIST';
const CLEAR_MODAL_PARAMETERS = 'CLEAR_MODAL_PARAMETERS';

function createBackgroundsList(backgrounds) {
    return {
        type: CREATE_BACKGROUNDS_LIST,
        backgrounds
    };
}

function addBackground(source) {
    return {
        type: ADD_BACKGROUND,
        source: source
    };
}

function addBackgroundProperties(modalParams) {
    return {
        type: ADD_BACKGROUND_PROPERTIES,
        modalParams
    };
}

function setBackgroundModalParams(modalParams) {
    return {
        type: SET_BACKGROUND_MODAL_PARAMS,
        modalParams
    };
}

function backgroundAdded(layerId) {
    return {
        type: BACKGROUND_ADDED,
        layerId
    };
}

function backgroundEdited(layerId) {
    return {
        type: BACKGROUND_EDITED,
        layerId
    };
}

function setCurrentBackgroundLayer(layerId) {
    return {
        type: SET_CURRENT_BACKGROUND_LAYER,
        layerId
    };
}

function updateThumbnail(thumbnailData, thumbnail, backgroundId) {
    return {
        type: UPDATE_BACKGROUND_THUMBNAIL,
        thumbnailData,
        thumbnail,
        id: backgroundId
    };
}

function removeBackground(backgroundId) {
    return {
        type: REMOVE_BACKGROUND,
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


module.exports = {
    CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    BACKGROUND_ADDED,
    BACKGROUND_EDITED,
    ADD_BACKGROUND_PROPERTIES,
    SET_BACKGROUND_MODAL_PARAMS,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    REMOVE_BACKGROUND,
    CLEAR_MODAL_PARAMETERS,
    SET_CURRENT_BACKGROUND_LAYER,
    createBackgroundsList,
    addBackgroundProperties,
    setBackgroundModalParams,
    addBackground,
    backgroundAdded,
    backgroundEdited,
    setCurrentBackgroundLayer,
    updateThumbnail,
    clearModalParameters,
    clearBackgrounds,
    removeBackground
};
