/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const SELECT_FEATURES = 'FEATUREGRID:SELECT_FEATURES';
const DESELECT_FEATURES = 'FEATUREGRID:DESELECT_FEATURES';
const CLEAR_SELECTION = 'FEATUREGRID:CLEAR_SELECTION';
const SET_SELECTION_OPTIONS = 'FEATUREGRID:SET_SELECTION_OPTIONS';
const TOGGLE_MODE = 'FEATUREGRID:TOGGLE_MODE';
const TOGGLE_FEATURES_SELECTION = 'FEATUREGRID:TOGGLE_FEATURES_SELECTION';
const FEATURES_MODIFIED = 'FEATUREGRID:FEATURES_MODIFIED';
const CREATE_NEW_FEATURE = "FEATUREGRID:NEW_FEATURE";
const SAVE_CHANGES = 'FEATUREGRID:SAVE_CHANGES';
const SAVING = 'FEATUREGRID:SAVING';
const START_EDITING_FEATURE = 'FEATUREGRID:START_EDITING_FEATURE';
const START_DRAWING_FEATURE = 'FEATUREGRID:START_DRAWING_FEATURE';
const DELETE_GEOMETRY = "FEATUREGRID:DELETE_GEOMETRY";
const DELETE_GEOMETRY_FEATURE = "FEATUREGRID:DELETE_GEOMETRY_FEATURE";
const SAVE_SUCCESS = "FEATUREGRID:SAVE_SUCCESS";
const CLEAR_CHANGES = "FEATUREGRID:CLEAR_CHANGES";
const SAVE_ERROR = "FEATUREGRID:SAVE_ERROR";
const DELETE_SELECTED_FEATURES = "FEATUREGRID:DELETE_SELECTED_FEATURES";
const DELETE_SELECTED_FEATURES_CONFIRM = "FEATUREGRID:DELETE_SELECTED_FEATURES_CONFIRM";
const SET_FEATURES = 'SET_FEATURES';
const SORT_BY = 'FEATUREGRID:SORT_BY';
const SET_LAYER = 'FEATUREGRID:SET_LAYER';
const CHANGE_PAGE = 'FEATUREGRID:CHANGE_PAGE';
const GEOMETRY_CHANGED = 'FEATUREGRID:GEOMETRY_CHANGED';
const DOCK_SIZE_FEATURES = 'DOCK_SIZE_FEATURES';
const TOGGLE_TOOL = 'FEATUREGRID:TOGGLE_TOOL';
const CUSTOMIZE_ATTRIBUTE = 'FEATUREGRID:CUSTOMIZE_ATTRIBUTE';
const CLOSE_GRID = 'FEATUREGRID:CLOSE_GRID';
const CLEAR_AND_CLOSE = 'FEATUREGRID:CLEAR_AND_CLOSE';
const CLOSE_DIALOG_AND_DRAWER = 'FEATUREGRID:CLOSE_DIALOG_AND_DRAWER';
const MODES = {
    EDIT: "EDIT",
    VIEW: "VIEW"
};

function clearAndClose() {
    return {
        type: CLEAR_AND_CLOSE
    };
}
function closeDialogAndDrawer() {
    return {
        type: CLOSE_DIALOG_AND_DRAWER
    };
}
function selectFeatures(features, append) {
    return {
        type: SELECT_FEATURES,
        features,
        append
    };
}
function geometryChanged(features) {
    return {
        type: GEOMETRY_CHANGED,
        features
    };
}
function startEditingFeature() {
    return {
        type: START_EDITING_FEATURE
    };
}
function startDrawingFeature() {
    return {
        type: START_DRAWING_FEATURE
    };
}
function deselectFeatures(features) {
    return {
        type: DESELECT_FEATURES,
        features
    };
}

function deleteGeometry() {
    return {
        type: DELETE_GEOMETRY
    };
}
function deleteGeometryFeature(features) {
    return {
        type: DELETE_GEOMETRY_FEATURE,
        features
    };
}
function clearSelection() {
    return {
        type: CLEAR_SELECTION
    };
}
function toggleSelection(features) {
    return {
        type: TOGGLE_FEATURES_SELECTION,
        features
    };
}
function setSelectionOptions({multiselect= false} = {}) {
    return {
        type: SET_SELECTION_OPTIONS,
        multiselect
    };

}
function setFeatures(features) {
    return {
        type: SET_FEATURES,
        features: features
    };
}

function dockSizeFeatures(dockSize) {
    return {
        type: DOCK_SIZE_FEATURES,
        dockSize: dockSize
    };
}
function sort(sortBy, sortOrder) {
    return {
        type: SORT_BY,
        sortBy,
        sortOrder
    };
}
function changePage(page, size) {
    return {
        type: CHANGE_PAGE,
        page,
        size
    };
}
function setLayer(id) {
    return {
        type: SET_LAYER,
        id
    };
}
function toggleTool(tool, value) {
    return {
        type: TOGGLE_TOOL,
        tool,
        value
    };
}
function customizeAttribute(name, key, value) {
    return {
        type: CUSTOMIZE_ATTRIBUTE,
        name,
        key,
        value
    };
}
function toggleEditMode() {
    return {
        type: TOGGLE_MODE,
        mode: MODES.EDIT
    };
}
function toggleViewMode() {
    return {
        type: TOGGLE_MODE,
        mode: MODES.VIEW
    };
}
function featureModified(features, updated) {
    return {
        type: FEATURES_MODIFIED,
        features,
        updated
    };
}
function createNewFeatures(features) {
    return {
        type: CREATE_NEW_FEATURE,
        features
    };
}
function saveChanges() {
    return {
        type: SAVE_CHANGES
    };
}
function saveSuccess() {
    return {
        type: SAVE_SUCCESS
    };
}
function deleteFeaturesConfirm() {
    return {
        type: DELETE_SELECTED_FEATURES_CONFIRM
    };
}
function deleteFeatures() {
    return {
        type: DELETE_SELECTED_FEATURES
    };
}
function featureSaving() {
    return {
        type: SAVING
    };
}
function clearChanges() {
    return {
        type: CLEAR_CHANGES
    };
}
function saveError() {
    return {
        type: SAVE_ERROR
    };
}
function closeFeatureGrid() {
    return {
        type: CLOSE_GRID
    };
}
module.exports = {
    SELECT_FEATURES,
    DESELECT_FEATURES,
    CLEAR_SELECTION,
    TOGGLE_FEATURES_SELECTION,
    SET_SELECTION_OPTIONS,
    SET_FEATURES,
    FEATURES_MODIFIED,
    CREATE_NEW_FEATURE,
    SAVE_CHANGES,
    CLEAR_CHANGES,
    SAVE_SUCCESS,
    SAVE_ERROR,
    DELETE_SELECTED_FEATURES_CONFIRM,
    DELETE_SELECTED_FEATURES,
    DOCK_SIZE_FEATURES,
    SORT_BY,
    CHANGE_PAGE,
    SET_LAYER,
    TOGGLE_TOOL,
    CUSTOMIZE_ATTRIBUTE,
    TOGGLE_MODE,
    MODES,
    SAVING,
    START_EDITING_FEATURE, startEditingFeature,
    START_DRAWING_FEATURE, startDrawingFeature,
    GEOMETRY_CHANGED, geometryChanged,
    DELETE_GEOMETRY, deleteGeometry,
    DELETE_GEOMETRY_FEATURE, deleteGeometryFeature,
    CLEAR_AND_CLOSE, clearAndClose,
    CLOSE_GRID, closeFeatureGrid,
    CLOSE_DIALOG_AND_DRAWER, closeDialogAndDrawer,
    setLayer,
    selectFeatures,
    deselectFeatures,
    setSelectionOptions,
    clearSelection,
    toggleSelection,
    setFeatures,
    featureModified,
    createNewFeatures,
    saveChanges,
    featureSaving,
    clearChanges,
    saveSuccess,
    saveError,
    deleteFeaturesConfirm,
    deleteFeatures,
    dockSizeFeatures,
    sort,
    changePage,
    toggleTool,
    customizeAttribute,
    toggleEditMode,
    toggleViewMode
};
