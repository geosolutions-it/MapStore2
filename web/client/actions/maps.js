/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const GeoStoreApi = require('../api/GeoStoreDAO');
const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
const MAPS_GET_MAP_RESOURCES_BY_CATEGORY = 'MAPS_GET_MAP_RESOURCES_BY_CATEGORY';
const MAPS_LOAD_MAP = 'MAPS_LOAD_MAP';
const MAP_UPDATING = 'MAP_UPDATING';
const MAP_UPDATED = 'MAP_UPDATED';
const MAP_CREATED = 'MAP_CREATED';
const MAP_DELETING = 'MAP_DELETING';
const MAP_DELETED = 'MAP_DELETED';
const MAP_SAVED = 'MAP_SAVED';
const ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED';
const THUMBNAIL_ERROR = 'THUMBNAIL_ERROR';
const MAP_ERROR = 'MAP_ERROR';
const SAVE_ALL = 'SAVE_ALL';
const SAVING_MAP = 'SAVING_MAP';
const PERMISSIONS_LIST_LOADING = 'PERMISSIONS_LIST_LOADING';
const MAPS_SEARCH_TEXT_CHANGED = 'MAPS_SEARCH_TEXT_CHANGED';
const SEARCH_FILTER_CHANGED = 'MAPS:SEARCH_FILTER_CHANGED';
const SET_SEARCH_FILTER = 'MAPS:SET_SEARCH_FILTER';
const SEARCH_FILTER_CLEAR_ALL = 'MAPS:SEARCH_FILTER_CLEAR_ALL';
const LOAD_CONTEXTS = 'MAPS:LOAD_CONTEXTS';
const SET_CONTEXTS = 'MAPS:SET_CONTEXTS';
const LOADING = 'MAPS:LOADING';
const METADATA_CHANGED = 'METADATA_CHANGED';
const SHOW_DETAILS_SHEET = 'MAPS:SHOW_DETAILS_SHEET';
const HIDE_DETAILS_SHEET = 'MAPS:HIDE_DETAILS_SHEET';
const UPDATE_DETAILS = 'MAPS:UPDATE_DETAILS';
const SHOW_DETAILS = 'MAPS:SHOW_DETAILS';
const SAVE_RESOURCE_DETAILS = 'MAPS:SAVE_RESOURCE_DETAILS';
const DO_NOTHING = 'MAPS:DO_NOTHING';
const DELETE_MAP = 'MAPS:DELETE_MAP';
const SET_UNSAVED_CHANGES = 'MAPS:SET_UNSAVED_CHANGES';
const OPEN_DETAILS_PANEL = 'DETAILS:OPEN_DETAILS_PANEL';
const CLOSE_DETAILS_PANEL = 'DETAILS:CLOSE_DETAILS_PANEL';
const TOGGLE_DETAILS_EDITABILITY = 'DETAILS:TOGGLE_DETAILS_EDITABILITY';
const DETAILS_LOADED = 'DETAILS:DETAILS_LOADED';
const DETAILS_SAVING = 'DETAILS:DETAILS_SAVING';
const NO_DETAILS_AVAILABLE = "NO_DETAILS_AVAILABLE";
const FEATURED_MAPS_SET_ENABLED = "FEATURED_MAPS:SET_ENABLED";
const SAVE_MAP_RESOURCE = "SAVE_MAP_RESOURCE";
const RELOAD_MAPS = 'MAPS:RELOAD_MAPS';
const INVALIDATE_FEATURED_MAPS = "FEATURED_MAPS:INVALIDATE";

/**
 * saves details section in the resurce map on geostore
 * @memberof actions.maps
 * @return {action}        type `SAVE_RESOURCE_DETAILS`
*/
function saveResourceDetails() {
    return {
        type: SAVE_RESOURCE_DETAILS
    };
}

/**
 * mapsLoading action, type `MAPS_LIST_LOADING`
 * @memberof actions.maps
 * @param  {string} searchText text to search
 * @param  {object} params     the params of the request
 * @return {action}            type `MAPS_LIST_LOADING` with searchText and params
 */
function mapsLoading(searchText, params) {
    return {
        type: MAPS_LIST_LOADING,
        searchText,
        params
    };
}

/**
 * loadMaps action, type `MAPS_LOAD_MAP`
 * @memberof actions.maps
 * @param  {string} geoStoreUrl      the url of geostore
 * @param  {String} [searchText="*"] text to search
 * @param  {Object} [params={start:  0. limit: 12}] params for the request
 * @return {action} type `MAPS_LOAD_MAP` with geoStoreUrl, searchText and params
 */
function loadMaps(geoStoreUrl, searchText = "*", params = {start: 0, limit: 12}) {

    return {
        type: MAPS_LOAD_MAP,
        geoStoreUrl,
        searchText,
        params
    };
}


/**
 * getMapResourcesByCategory action, type `MAPS_GET_MAP_RESOURCES_BY_CATEGORY`
 * @memberof actions.maps
 * @param  {string} searchText text to search
 * @param  {string} map     MAP
 * @param {Object} opts options
 * @return {action}    type `MAPS_GET_MAP_RESOURCES_BY_CATEGORY` with searchText, map and opts
 */
function getMapResourcesByCategory(map, searchText, opts, searchFilter) {
    return {
        type: MAPS_GET_MAP_RESOURCES_BY_CATEGORY,
        map,
        searchText,
        opts,
        searchFilter
    };
}

/**
 * action to run to change search text
 * @memberof actions.maps
 * @param  {string} text the search text
 * @return {action} of type `MAPS_SEARCH_TEXT_CHANGED`, with text
 */
function mapsSearchTextChanged(text) {
    return {
        type: MAPS_SEARCH_TEXT_CHANGED,
        text
    };
}

function searchFilterChanged(filter, filterData) {
    return {
        type: SEARCH_FILTER_CHANGED,
        filter,
        filterData
    };
}

function searchFilterClearAll() {
    return {
        type: SEARCH_FILTER_CLEAR_ALL
    };
}

function setSearchFilter(searchFilter) {
    return {
        type: SET_SEARCH_FILTER,
        searchFilter
    };
}

function loadContexts(searchText, options, delayLoad, force) {
    return {
        type: LOAD_CONTEXTS,
        searchText,
        options,
        delayLoad,
        force
    };
}

function setContexts(contexts) {
    return {
        type: SET_CONTEXTS,
        contexts
    };
}

function loading(value, name = "loading") {
    return {
        type: LOADING,
        name,
        value
    };
}

/**
 * run when maps are loaded. The results params is an object like this:
 * ```
 * {
 *    results: [{...}, {...}]
 * }
 * ```
 * @memberof actions.maps
 * @param  {object} maps       object with results
 * @param  {object} params     params of the original request
 * @param  {string} searchText the original search text for the request
 * @return {action}            action of type `MAPS_LIST_LOADED` with all the arguments
 */
function mapsLoaded(maps, params, searchText) {
    return {
        type: MAPS_LIST_LOADED,
        params,
        maps,
        searchText
    };
}

/**
 * shows or hides map details, type `MAPS:SHOW_DETAILS`
 * @memberof actions.maps
 * @prop {boolean} showMapDetails flag used to trigger the showing/hiding of the map details
 * @return {action}        type `MAPS:SHOW_DETAILS`
*/
function setShowMapDetails(showMapDetails) {
    return {
        type: SHOW_DETAILS,
        showMapDetails
    };
}

/**
 * When a error occurred during maps loading
 * @memberof actions.maps
 * @param  {object} e the error
 * @return {action}   MAPS_LIST_LOAD_ERROR
 */
function loadError(e) {
    return {
        type: MAPS_LIST_LOAD_ERROR,
        error: e
    };
}

/**
 * updates metadata of the map
 * @memberof actions.maps
 * @param  {object} prop the name of the changed property
 * @param  {object} name the value of the changed property
 * @return {action} METADATA_CHANGED
 */
function metadataChanged(prop, value) {
    return {
        type: METADATA_CHANGED,
        prop,
        value
    };
}

/**
 * When a new map is created
 * @memberof actions.maps
 * @param  {number} resourceId the identifier of the new map
 * @param  {object} metadata   metadata associated to the new resourceId
 * @param  {object} content    the content of the new resourceId
 * @param  {object} [error]    an error, if present
 * @return {action}            `MAP_CREATED`, with all arguments as named
 */
function mapCreated(resourceId, metadata, content, error) {
    return {
        type: MAP_CREATED,
        resourceId,
        metadata,
        content,
        error
    };
}

/**
 * When a map is updating
 * @memberof actions.maps
 * @param  {number} resourceId the id of the resource that is updating
 * @return {action}            type `MAP_UPDATING` with the arguments as they are named
 */
function mapUpdating(resourceId) {
    return {
        type: MAP_UPDATING,
        resourceId
    };
}
/**
 * Toggle editability of details for the current map
 * @memberof actions.maps
 * @return {action}            type `TOGGLE_DETAILS_EDITABILITY`
 */
function toggleDetailsEditability() {
    return {
        type: TOGGLE_DETAILS_EDITABILITY
    };
}

/**
 * When a map delete action have been performed
 * @memberof actions.maps
 * @param  {number} resourceId the identifier of the deleted map
 * @param  {string} result     the result, can be "success"
 * @param  {object} [error]      the error, if any
 * @return {action}            type `MAP_DELETED`, with the arguments as they are named
 */
function mapDeleted(resourceId, result, error) {
    return {
        type: MAP_DELETED,
        resourceId,
        result,
        error
    };
}

/**
 * When deleting a map
 * @memberof actions.maps
 * @param  {number} resourceId the identifier of the map
 * @param  {string} result     can be "success"
 * @param  {object} [error]      error, if any
 * @return {action}            type `MAP_DELETING`, with the arguments as they are named
 */
function mapDeleting(resourceId, result, error) {
    return {
        type: MAP_DELETING,
        resourceId,
        result,
        error
    };
}

/**
 * When attribute of a map has been updated
 * @memberof actions.maps
 * @param  {number} resourceId the identifier of the resource
 * @param  {string} name       name of the attributeUpdated
 * @param  {string} value      the new value of the attribute
 * @param  {string} type       the type of the attribute
 * @param  {object} [error]      error, if any
 * @return {action}            type `ATTRIBUTE_UPDATED`, with the arguments as they are named
 */
function attributeUpdated(resourceId, name, value, type, error) {
    return {
        type: ATTRIBUTE_UPDATED,
        resourceId,
        name,
        value,
        error
    };
}

/**
 * When an error saving the thumbnail occurred
 * @memberof actions.maps
 * @param  {number} resourceId the id of the resource
 * @param  {object} error      the error occurred
 * @return {action}            type `THUMBNAIL_ERROR`, with the arguments as they are named
 */
function thumbnailError(resourceId, error) {
    return {
        type: THUMBNAIL_ERROR,
        resourceId,
        error
    };
}

/**
 * When an error occurred on map creation
 * @memberof actions.maps
 * @param  {number} resourceId the id of the resource
 * @param  {object} error the error occurred
 * @return {action}      type `MAP_ERROR`, with the arguments as they are named
 */
function mapError(resourceId, error) {
    return {
        type: MAP_ERROR,
        error,
        resourceId
    };
}

/**
 * Performed before start saving a new map
 * @memberof actions.maps
 * @param {object} metadata
 * @return {action} type SAVING_MAP action
 */
function savingMap(metadata) {
    return {
        type: SAVING_MAP,
        metadata
    };
}

/**
 * updates an attribute for a given map
 * @memberof actions.maps
 * @param  {number} resourceId the id of the resource
 * @param  {string} name       the name of the attribute
 * @param  {string} value      the value of the attribute
 * @param  {string} [type]     the type of the attribute
 * @param  {object} [options]  options for the request
 * @return {thunk}  performs the update and dispatch attributeUpdated or thumbnailError
 */
function updateAttribute(resourceId, name, value, type, options) {
    return (dispatch) => {
        GeoStoreApi.updateResourceAttribute(resourceId, name, value, type, options).then(() => {
            dispatch(attributeUpdated(resourceId, name, value, type, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}

/**
 * Deletes a map.
 * @memberof actions.maps
 * @param  {number} resourceId the id of the resource to delete
 * @param  {object} options    options for the request
 * @return {thunk}             performs the delete operations and dispatches mapDeleted and loadMaps
 */
function deleteMap(resourceId, options) {
    return {
        type: DELETE_MAP,
        resourceId,
        options
    };
}

/**
 * updates details section
 * @memberof actions.maps
 * @return {action}        type `UPDATE_DETAILS`
*/
function updateDetails(detailsText) {
    return {
        type: UPDATE_DETAILS,
        detailsText
    };
}

/**
 * setUnsavedChanged
 * @memberof actions.maps
 * @return {action}        type `SET_UNSAVED_CHANGES`
*/
function setUnsavedChanged(value) {
    return {
        type: SET_UNSAVED_CHANGES,
        value
    };
}
/**
 * openDetailsPanel
 * @memberof actions.maps
 * @return {action}        type `OPEN_DETAILS_PANEL`
*/
function openDetailsPanel() {
    return {
        type: OPEN_DETAILS_PANEL
    };
}
/**
 * closeDetailsPanel
 * @memberof actions.maps
 * @return {action}        type `CLOSE_DETAILS_PANEL`
*/
function closeDetailsPanel() {
    return {
        type: CLOSE_DETAILS_PANEL
    };
}
/**
 * detailsLoaded
 * @memberof actions.maps
 * @return {action}        type `DETAILS_LOADED`
*/
function detailsLoaded(mapId, detailsUri, detailsSettings) {
    return {
        type: DETAILS_LOADED,
        mapId,
        detailsUri,
        detailsSettings
    };
}
/**
 * detailsSaving
 * @memberof actions.maps
 * @return {action}        type `DETAILS_SAVING`
*/
function detailsSaving(saving) {
    return {
        type: DETAILS_SAVING,
        saving
    };
}
/**
 * do nothing action
 * @memberof actions.maps
 * @return {action}        type `DO_NOTHING`
*/
function doNothing() {
    return {
        type: DO_NOTHING
    };
}

/**
 * enable/disabled the "featured maps" functionality
 * @memberof actions.maps
 * @param {boolean} enabled the `enabled` flag
 */
const setFeaturedMapsEnabled = (enabled) => ({
    type: FEATURED_MAPS_SET_ENABLED,
    enabled
});
/**
 * Save or update the map resource using geostore observables
 * @memberof actions.maps
 * @param {boolean} enabled the `enabled` flag
 */
const saveMapResource = (resource) => ({
    type: SAVE_MAP_RESOURCE,
    resource
});
/**
 * Trigger maps reload
 * @memberof actions.maps
 */
const reloadMaps = () => ({
    type: RELOAD_MAPS
});
/**
 * Invalidate featured maps list
 * @memberof actions.maps
 */
const invalidateFeaturedMaps = () => ({
    type: INVALIDATE_FEATURED_MAPS
});
/**
 * Shows the read only details sheet
 * @memberof actions.maps
 */
const showDetailsSheet = () => ({
    type: SHOW_DETAILS_SHEET
});
/**
 * Hides the read only details sheet
 * @memberof actions.maps
 */
const hideDetailsSheet = () => ({
    type: HIDE_DETAILS_SHEET
});

/**
 * Actions for maps
 * @name actions.maps
 */
module.exports = {
    MAPS_LIST_LOADED,
    MAPS_LIST_LOADING,
    MAPS_LIST_LOAD_ERROR,
    MAP_CREATED,
    MAP_UPDATING,
    MAP_UPDATED,
    MAP_DELETED,
    MAP_DELETING,
    MAP_SAVED,
    ATTRIBUTE_UPDATED,
    SAVING_MAP,
    THUMBNAIL_ERROR,
    PERMISSIONS_LIST_LOADING,
    SAVE_ALL,
    MAP_ERROR,
    MAPS_SEARCH_TEXT_CHANGED,
    METADATA_CHANGED,
    NO_DETAILS_AVAILABLE,
    SAVE_MAP_RESOURCE,
    updateDetails, UPDATE_DETAILS,
    saveResourceDetails, SAVE_RESOURCE_DETAILS,
    doNothing, DO_NOTHING,
    setUnsavedChanged, SET_UNSAVED_CHANGES,
    openDetailsPanel, OPEN_DETAILS_PANEL,
    closeDetailsPanel, CLOSE_DETAILS_PANEL,
    deleteMap, DELETE_MAP,
    detailsLoaded, DETAILS_LOADED,
    detailsSaving, DETAILS_SAVING,
    toggleDetailsEditability, TOGGLE_DETAILS_EDITABILITY,
    setFeaturedMapsEnabled, FEATURED_MAPS_SET_ENABLED,
    setShowMapDetails, SHOW_DETAILS,
    metadataChanged,
    loadMaps, MAPS_LOAD_MAP,
    getMapResourcesByCategory, MAPS_GET_MAP_RESOURCES_BY_CATEGORY,
    searchFilterChanged, SEARCH_FILTER_CHANGED,
    setSearchFilter, SET_SEARCH_FILTER,
    searchFilterClearAll, SEARCH_FILTER_CLEAR_ALL,
    loadContexts, LOAD_CONTEXTS,
    setContexts, SET_CONTEXTS,
    loading, LOADING,
    mapsLoading,
    mapsLoaded,
    mapCreated,
    mapDeleted,
    mapDeleting,
    mapUpdating,
    attributeUpdated,
    savingMap,
    thumbnailError,
    loadError,
    mapError,
    mapsSearchTextChanged,
    updateAttribute,
    saveMapResource,
    reloadMaps, RELOAD_MAPS,
    invalidateFeaturedMaps, INVALIDATE_FEATURED_MAPS,
    showDetailsSheet, SHOW_DETAILS_SHEET,
    hideDetailsSheet, HIDE_DETAILS_SHEET
};
