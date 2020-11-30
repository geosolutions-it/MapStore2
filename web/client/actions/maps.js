/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import GeoStoreApi from '../api/GeoStoreDAO';

export const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
export const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
export const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
export const MAPS_GET_MAP_RESOURCES_BY_CATEGORY = 'MAPS_GET_MAP_RESOURCES_BY_CATEGORY';
export const MAPS_LOAD_MAP = 'MAPS_LOAD_MAP';
export const MAP_UPDATING = 'MAP_UPDATING';
export const MAP_UPDATED = 'MAP_UPDATED';
export const MAP_CREATED = 'MAP_CREATED';
export const MAP_DELETING = 'MAP_DELETING';
export const MAP_DELETED = 'MAP_DELETED';
export const MAP_SAVED = 'MAP_SAVED';
export const ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED';
export const THUMBNAIL_ERROR = 'THUMBNAIL_ERROR';
export const MAP_ERROR = 'MAP_ERROR';
export const SAVE_ALL = 'SAVE_ALL';
export const SAVING_MAP = 'SAVING_MAP';
export const PERMISSIONS_LIST_LOADING = 'PERMISSIONS_LIST_LOADING';
export const MAPS_SEARCH_TEXT_CHANGED = 'MAPS_SEARCH_TEXT_CHANGED';
export const SEARCH_FILTER_CHANGED = 'MAPS:SEARCH_FILTER_CHANGED';
export const SET_SEARCH_FILTER = 'MAPS:SET_SEARCH_FILTER';
export const SEARCH_FILTER_CLEAR_ALL = 'MAPS:SEARCH_FILTER_CLEAR_ALL';
export const LOAD_CONTEXTS = 'MAPS:LOAD_CONTEXTS';
export const SET_CONTEXTS = 'MAPS:SET_CONTEXTS';
export const LOADING = 'MAPS:LOADING';
export const METADATA_CHANGED = 'METADATA_CHANGED';
export const DO_NOTHING = 'MAPS:DO_NOTHING';
export const DELETE_MAP = 'MAPS:DELETE_MAP';
export const SET_UNSAVED_CHANGES = 'MAPS:SET_UNSAVED_CHANGES';
export const FEATURED_MAPS_SET_ENABLED = "FEATURED_MAPS:SET_ENABLED";
export const SAVE_MAP_RESOURCE = "SAVE_MAP_RESOURCE";
export const RELOAD_MAPS = 'MAPS:RELOAD_MAPS';
export const INVALIDATE_FEATURED_MAPS = "FEATURED_MAPS:INVALIDATE";

/**
 * mapsLoading action, type `MAPS_LIST_LOADING`
 * @memberof actions.maps
 * @param  {string} searchText text to search
 * @param  {object} params     the params of the request
 * @return {action}            type `MAPS_LIST_LOADING` with searchText and params
 */
export function mapsLoading(searchText, params) {
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
export function loadMaps(geoStoreUrl, searchText = "*", params = {start: 0, limit: 12}) {

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
export function getMapResourcesByCategory(map, searchText, opts, searchFilter) {
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
export function mapsSearchTextChanged(text) {
    return {
        type: MAPS_SEARCH_TEXT_CHANGED,
        text
    };
}

export function searchFilterChanged(filter, filterData) {
    return {
        type: SEARCH_FILTER_CHANGED,
        filter,
        filterData
    };
}

export function searchFilterClearAll() {
    return {
        type: SEARCH_FILTER_CLEAR_ALL
    };
}

export function setSearchFilter(searchFilter) {
    return {
        type: SET_SEARCH_FILTER,
        searchFilter
    };
}

export function loadContexts(searchText, options, delayLoad, force) {
    return {
        type: LOAD_CONTEXTS,
        searchText,
        options,
        delayLoad,
        force
    };
}

export function setContexts(contexts) {
    return {
        type: SET_CONTEXTS,
        contexts
    };
}

export function loading(value, name = "loading") {
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
export function mapsLoaded(maps, params, searchText) {
    return {
        type: MAPS_LIST_LOADED,
        params,
        maps,
        searchText
    };
}

/**
 * When a error occurred during maps loading
 * @memberof actions.maps
 * @param  {object} e the error
 * @return {action}   MAPS_LIST_LOAD_ERROR
 */
export function loadError(e) {
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
export function metadataChanged(prop, value) {
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
export function mapCreated(resourceId, metadata, content, error) {
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
export function mapUpdating(resourceId) {
    return {
        type: MAP_UPDATING,
        resourceId
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
export function mapDeleted(resourceId, result, error) {
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
export function mapDeleting(resourceId, result, error) {
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
export function attributeUpdated(resourceId, name, value, type, error) {
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
export function thumbnailError(resourceId, error) {
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
export function mapError(resourceId, error) {
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
export function savingMap(metadata) {
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
export function updateAttribute(resourceId, name, value, type, options) {
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
export function deleteMap(resourceId, options) {
    return {
        type: DELETE_MAP,
        resourceId,
        options
    };
}

/**
 * setUnsavedChanged
 * @memberof actions.maps
 * @return {action}        type `SET_UNSAVED_CHANGES`
*/
export function setUnsavedChanged(value) {
    return {
        type: SET_UNSAVED_CHANGES,
        value
    };
}
/**
 * do nothing action
 * @memberof actions.maps
 * @return {action}        type `DO_NOTHING`
*/
export function doNothing() {
    return {
        type: DO_NOTHING
    };
}

/**
 export * enable/disabled the "featured maps" functionality
 * @memberof actions.maps
 * @param {boolean} enabled the `enabled` flag
 */
export const setFeaturedMapsEnabled = (enabled) => ({
    type: FEATURED_MAPS_SET_ENABLED,
    enabled
});
/**
 * Save or update the map resource using geostore observables
 * @memberof actions.maps
 * @param {boolean} enabled the `enabled` flag
 */
export const saveMapResource = (resource) => ({
    type: SAVE_MAP_RESOURCE,
    resource
});
/**
 * Trigger maps reload
 * @memberof actions.maps
 */
export const reloadMaps = () => ({
    type: RELOAD_MAPS
});
/**
 * Invalidate featured maps list
 * @memberof actions.maps
 */
export const invalidateFeaturedMaps = () => ({
    type: INVALIDATE_FEATURED_MAPS
});

/**
 * Actions for maps
 * @name actions.maps
 */
