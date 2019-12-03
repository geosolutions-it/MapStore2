/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_CREATION_STEP = 'CONTEXTCREATOR:SET_CREATION_STEP';
export const MAP_VIEWER_LOAD = 'CONTEXTCREATOR:MAP_VIEWER_LOAD';
export const MAP_VIEWER_LOADED = 'CONTEXTCREATOR:MAP_VIEWER_LOADED';
export const MAP_VIEWER_RELOAD = 'CONTEXTCREATOR:MAP_VIEWER_RELOAD';
export const SHOW_MAP_VIEWER_RELOAD_CONFIRM = 'CONTEXTCREATOR:SHOW_MAP_VIEWER_RELOAD_CONFIRM';
export const CLEAR_CONTEXT_CREATOR = 'CONTEXTCREATOR:CLEAR_CONTEXT_CREATOR';
export const CHANGE_ATTRIBUTE = 'CONTEXTCREATOR:CHANGE_ATTRIBUTE';
export const SET_RESOURCE = 'CONTEXTCREATOR:SET_RESOURCE';
export const LOAD_CONTEXT = 'CONTEXTCREATOR:LOAD_CONTEXT';
export const START_RESOURCE_LOAD = 'CONTEXTCREATOR:START_RESOURCE_LOAD';
export const LOAD_FINISHED = 'CONTEXTCREATOR:LOAD_FINISHED';
export const CONTEXT_LOAD_ERROR = 'CONTEXTCREATOR:CONTEXT_LOAD_ERROR';
export const LOADING = 'CONTEXTCREATOR:LOADING';
export const CONTEXT_SAVED = 'CONTEXTCREATOR:CONTEXT_SAVED';
export const SAVE_CONTEXT = 'CONTEXTCREATOR:SAVE_CONTEXT';

export const setCreationStep = (stepId) => ({
    type: SET_CREATION_STEP,
    stepId
});

export const mapViewerLoad = () => ({
    type: MAP_VIEWER_LOAD
});

export const mapViewerLoaded = (status) => ({
    type: MAP_VIEWER_LOADED,
    status
});

export const mapViewerReload = () => ({
    type: MAP_VIEWER_RELOAD
});

export const showMapViewerReloadConfirm = (show) => ({
    type: SHOW_MAP_VIEWER_RELOAD_CONFIRM,
    show
});

export const changeAttribute = (key, value) => ({
    type: CHANGE_ATTRIBUTE,
    key,
    value
});

export const setResource = (resource) => ({
    type: SET_RESOURCE,
    resource
});

export const loadContext = (id) => ({
    type: LOAD_CONTEXT,
    id
});

// when this action is emitted, feedback mask is shown
export const startResourceLoad = () => ({
    type: START_RESOURCE_LOAD
});

export const loadFinished = () => ({
    type: LOAD_FINISHED
});

export const contextLoadError = ({ error }) => ({
    type: CONTEXT_LOAD_ERROR,
    error
});

export const loading = (value, name = "loading") => ({
    type: LOADING,
    name,
    value
});

export const clearContextCreator = () => ({
    type: CLEAR_CONTEXT_CREATOR
});

export const contextSaved = (id) => ({
    type: CONTEXT_SAVED,
    id
});

export const saveNewContext = (destLocation) => ({
    type: SAVE_CONTEXT,
    destLocation
});
