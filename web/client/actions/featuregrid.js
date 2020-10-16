/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const SET_UP = 'FEATUREGRID:SET_UP';
export const SELECT_FEATURES = 'FEATUREGRID:SELECT_FEATURES';
export const DESELECT_FEATURES = 'FEATUREGRID:DESELECT_FEATURES';
export const CLEAR_SELECTION = 'FEATUREGRID:CLEAR_SELECTION';
export const SET_SELECTION_OPTIONS = 'FEATUREGRID:SET_SELECTION_OPTIONS';
export const TOGGLE_MODE = 'FEATUREGRID:TOGGLE_MODE';
export const TOGGLE_FEATURES_SELECTION = 'FEATUREGRID:TOGGLE_FEATURES_SELECTION';
export const FEATURES_MODIFIED = 'FEATUREGRID:FEATURES_MODIFIED';
export const CREATE_NEW_FEATURE = "FEATUREGRID:NEW_FEATURE";
export const SAVE_CHANGES = 'FEATUREGRID:SAVE_CHANGES';
export const SAVING = 'FEATUREGRID:SAVING';
export const START_EDITING_FEATURE = 'FEATUREGRID:START_EDITING_FEATURE';
export const START_DRAWING_FEATURE = 'FEATUREGRID:START_DRAWING_FEATURE';
export const DELETE_GEOMETRY = "FEATUREGRID:DELETE_GEOMETRY";
export const DELETE_GEOMETRY_FEATURE = "FEATUREGRID:DELETE_GEOMETRY_FEATURE";
export const SAVE_SUCCESS = "FEATUREGRID:SAVE_SUCCESS";
export const CLEAR_CHANGES = "FEATUREGRID:CLEAR_CHANGES";
export const SAVE_ERROR = "FEATUREGRID:SAVE_ERROR";
export const DELETE_SELECTED_FEATURES = "FEATUREGRID:DELETE_SELECTED_FEATURES";
export const DELETE_SELECTED_FEATURES_CONFIRM = "FEATUREGRID:DELETE_SELECTED_FEATURES_CONFIRM";
export const SET_FEATURES = 'SET_FEATURES';
export const SORT_BY = 'FEATUREGRID:SORT_BY';
export const SET_LAYER = 'FEATUREGRID:SET_LAYER';
export const UPDATE_FILTER = 'QUERY:UPDATE_FILTER';
export const CHANGE_PAGE = 'FEATUREGRID:CHANGE_PAGE';
export const GEOMETRY_CHANGED = 'FEATUREGRID:GEOMETRY_CHANGED';
export const DOCK_SIZE_FEATURES = 'DOCK_SIZE_FEATURES';
export const TOGGLE_TOOL = 'FEATUREGRID:TOGGLE_TOOL';
export const CUSTOMIZE_ATTRIBUTE = 'FEATUREGRID:CUSTOMIZE_ATTRIBUTE';
export const CLOSE_FEATURE_GRID_CONFIRM = 'ASK_CLOSE_FEATURE_GRID_CONFIRM';
export const OPEN_FEATURE_GRID = 'FEATUREGRID:OPEN_GRID';
export const CLOSE_FEATURE_GRID = 'FEATUREGRID:CLOSE_GRID';
export const CLEAR_CHANGES_CONFIRMED = 'FEATUREGRID:CLEAR_CHANGES_CONFIRMED';
export const FEATURE_GRID_CLOSE_CONFIRMED = 'FEATUREGRID:FEATURE_GRID_CLOSE_CONFIRMED';
export const SET_PERMISSION = 'FEATUREGRID:SET_PERMISSION';
export const DISABLE_TOOLBAR = 'FEATUREGRID:DISABLE_TOOLBAR';
export const ACTIVATE_TEMPORARY_CHANGES = 'FEATUREGRID:ACTIVATE_TEMPORARY_CHANGES';
export const DEACTIVATE_GEOMETRY_FILTER = 'FEATUREGRID:DEACTIVATE_GEOMETRY_FILTER';
export const OPEN_ADVANCED_SEARCH = 'FEATUREGRID:ADVANCED_SEARCH';
export const ZOOM_ALL = 'FEATUREGRID:ZOOM_ALL';
export const INIT_PLUGIN = 'FEATUREGRID:INIT_PLUGIN';
export const SIZE_CHANGE = 'FEATUREGRID:SIZE_CHANGE';
export const TOGGLE_SHOW_AGAIN_FLAG = 'FEATUREGRID:TOGGLE_SHOW_AGAIN_FLAG';
export const HIDE_SYNC_POPOVER = 'FEATUREGRID:HIDE_SYNC_POPOVER';

export const MODES = {
    EDIT: "EDIT",
    VIEW: "VIEW"
};
export const START_SYNC_WMS = 'FEATUREGRID:START_SYNC_WMS';
export const STOP_SYNC_WMS = 'FEATUREGRID:STOP_SYNC_WMS';
export const STORE_ADVANCED_SEARCH_FILTER = 'STORE_ADVANCED_SEARCH_FILTER';
export const LOAD_MORE_FEATURES = "LOAD_MORE_FEATURES";
export const GRID_QUERY_RESULT = 'FEATUREGRID:QUERY_RESULT';
export const SET_TIME_SYNC = "FEATUREGRID:SET_TIME_SYNC";

export function toggleShowAgain() {
    return {
        type: TOGGLE_SHOW_AGAIN_FLAG
    };
}
export function hideSyncPopover() {
    return {
        type: HIDE_SYNC_POPOVER
    };
}
export function fatureGridQueryResult(features, pages) {
    return {
        type: GRID_QUERY_RESULT,
        features, pages
    };
}

export function storeAdvancedSearchFilter(filterObj) {
    return {
        type: STORE_ADVANCED_SEARCH_FILTER,
        filterObj
    };
}


export function initPlugin(options = {}) {
    return {
        type: INIT_PLUGIN,
        options
    };
}
export function clearChangeConfirmed() {
    return {
        type: CLEAR_CHANGES_CONFIRMED
    };
}
export function closeFeatureGridConfirmed() {
    return {
        type: FEATURE_GRID_CLOSE_CONFIRMED
    };
}
export function selectFeatures(features, append) {
    return {
        type: SELECT_FEATURES,
        features,
        append
    };
}

/**
 * Configures some options for the feature grid
 * @param {object} options options to set up
 */
export function setUp(options) {
    return {
        type: SET_UP,
        options
    };
}
export function geometryChanged(features) {
    return {
        type: GEOMETRY_CHANGED,
        features
    };
}
export function startEditingFeature() {
    return {
        type: START_EDITING_FEATURE
    };
}
export function startDrawingFeature() {
    return {
        type: START_DRAWING_FEATURE
    };
}
export function deselectFeatures(features) {
    return {
        type: DESELECT_FEATURES,
        features
    };
}

export function deleteGeometry() {
    return {
        type: DELETE_GEOMETRY
    };
}
export function deleteGeometryFeature(features) {
    return {
        type: DELETE_GEOMETRY_FEATURE,
        features
    };
}
export function clearSelection() {
    return {
        type: CLEAR_SELECTION
    };
}
export function toggleSelection(features) {
    return {
        type: TOGGLE_FEATURES_SELECTION,
        features
    };
}
export function setSelectionOptions({multiselect = false} = {}) {
    return {
        type: SET_SELECTION_OPTIONS,
        multiselect
    };

}
export function setFeatures(features) {
    return {
        type: SET_FEATURES,
        features: features
    };
}

export function dockSizeFeatures(dockSize) {
    return {
        type: DOCK_SIZE_FEATURES,
        dockSize: dockSize
    };
}
export function sort(sortBy, sortOrder) {
    return {
        type: SORT_BY,
        sortBy,
        sortOrder
    };
}
export function changePage(page, size) {
    return {
        type: CHANGE_PAGE,
        page,
        size
    };
}
export function setLayer(id) {
    return {
        type: SET_LAYER,
        id
    };
}
export function updateFilter(update) {
    return {
        type: UPDATE_FILTER,
        update
    };
}
export function toggleTool(tool, value) {
    return {
        type: TOGGLE_TOOL,
        tool,
        value
    };
}
export function customizeAttribute(name, key, value) {
    return {
        type: CUSTOMIZE_ATTRIBUTE,
        name,
        key,
        value
    };
}
export function toggleEditMode() {
    return {
        type: TOGGLE_MODE,
        mode: MODES.EDIT
    };
}
export function toggleViewMode() {
    return {
        type: TOGGLE_MODE,
        mode: MODES.VIEW
    };
}
export function featureModified(features, updated) {
    return {
        type: FEATURES_MODIFIED,
        features,
        updated
    };
}
export function createNewFeatures(features) {
    return {
        type: CREATE_NEW_FEATURE,
        features
    };
}
export function saveChanges() {
    return {
        type: SAVE_CHANGES
    };
}
export function saveSuccess() {
    return {
        type: SAVE_SUCCESS
    };
}
export function deleteFeaturesConfirm() {
    return {
        type: DELETE_SELECTED_FEATURES_CONFIRM
    };
}
export function deleteFeatures() {
    return {
        type: DELETE_SELECTED_FEATURES
    };
}
export function featureSaving() {
    return {
        type: SAVING
    };
}
export function clearChanges() {
    return {
        type: CLEAR_CHANGES
    };
}
export function saveError() {
    return {
        type: SAVE_ERROR
    };
}
export function closeFeatureGridConfirm() {
    return {
        type: CLOSE_FEATURE_GRID_CONFIRM
    };
}
export function closeFeatureGrid() {
    return {
        type: CLOSE_FEATURE_GRID
    };
}
export function openFeatureGrid() {
    return {
        type: OPEN_FEATURE_GRID
    };
}

export function disableToolbar(disabled) {
    return {
        type: DISABLE_TOOLBAR,
        disabled
    };
}
export function setPermission(permission) {
    return {
        type: SET_PERMISSION,
        permission
    };
}
export function openAdvancedSearch() {
    return {
        type: OPEN_ADVANCED_SEARCH
    };
}
export function zoomAll() {
    return {
        type: ZOOM_ALL
    };
}
export function startSyncWMS() {
    return {
        type: START_SYNC_WMS
    };
}
export function sizeChange(size, dockProps) {
    return {
        type: SIZE_CHANGE,
        size,
        dockProps
    };
}
export const moreFeatures = (pages) => {
    return {
        type: LOAD_MORE_FEATURES,
        pages
    };
};
export const activateTemporaryChanges = (activated) => ({
    type: ACTIVATE_TEMPORARY_CHANGES,
    activated
});
export const deactivateGeometryFilter = (deactivated) => ({
    type: DEACTIVATE_GEOMETRY_FILTER,
    deactivated
});

/**
 * Enables/Disables time sync for feature grid.
 * @param {boolean} value time sync to set
 */
export const setTimeSync = value => ({
    type: SET_TIME_SYNC,
    value
});
