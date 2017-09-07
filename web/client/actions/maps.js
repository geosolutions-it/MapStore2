/*
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const GeoStoreApi = require('../api/GeoStoreDAO');
const {updateCurrentMapPermissions, updateCurrentMapGroups} = require('./currentMap');
const ConfigUtils = require('../utils/ConfigUtils');
const assign = require('object-assign');
const {get, findIndex} = require('lodash');

const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
const MAP_UPDATING = 'MAP_UPDATING';
const MAP_METADATA_UPDATED = 'MAP_METADATA_UPDATED';
const MAP_UPDATED = 'MAP_UPDATED';
const MAP_CREATED = 'MAP_CREATED';
const MAP_DELETING = 'MAP_DELETING';
const MAP_DELETED = 'MAP_DELETED';
const MAP_SAVED = 'MAP_SAVED';
const ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED';
const PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED';
const THUMBNAIL_ERROR = 'THUMBNAIL_ERROR';
const MAP_ERROR = 'MAP_ERROR';
const SAVE_ALL = 'SAVE_ALL';
const DISPLAY_METADATA_EDIT = 'DISPLAY_METADATA_EDIT';
const RESET_UPDATING = 'RESET_UPDATING';
const SAVE_MAP = 'SAVE_MAP';
const PERMISSIONS_LIST_LOADING = 'PERMISSIONS_LIST_LOADING';
const PERMISSIONS_LIST_LOADED = 'PERMISSIONS_LIST_LOADED';
const RESET_CURRENT_MAP = 'RESET_CURRENT_MAP';
const MAPS_SEARCH_TEXT_CHANGED = 'MAPS_SEARCH_TEXT_CHANGED';
const METADATA_CHANGED = 'METADATA_CHANGED';

/**
 * reset current map metadata, `RESET_CURRENT_MAP`
 * @memberof actions.maps
 * @return {action} of type `RESET_CURRENT_MAP`
 */
function resetCurrentMap() {
    return {
        type: RESET_CURRENT_MAP
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
 * When metadata of a map are updated
 * @memberof actions.maps
 * @param  {number} resourceId     the id of the resourceId
 * @param  {string} newName        the new name of the map
 * @param  {string} newDescription the new description of the map
 * @param  {string} result         the result, can be "success"
 * @param  {object} [error]          an error, if any
 * @return {action}                of type `MAP_METADATA_UPDATED` with the arguments as they are named
 */
function mapMetadataUpdated(resourceId, newName, newDescription, result, error) {
    return {
        type: MAP_METADATA_UPDATED,
        resourceId,
        newName,
        newDescription,
        result,
        error
    };
}

/**
 * When permission of a map are updated
 * @memberof actions.maps
 *
 * @param  {number} resourceId the id of the resourceId
 * @param  {object} [error]      error, if any
 * @return {action}            `PERMISSIONS_UPDATED` with the arguments as they are named
 */
function permissionsUpdated(resourceId, error) {
    return {
        type: PERMISSIONS_UPDATED,
        resourceId,
        error
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
 * @param  {object} error the error occurred
 * @return {action}      type `MAP_ERROR`, with the arguments as they are named
 */
function mapError(error) {
    return {
        type: MAP_ERROR,
        error
    };
}

/**
 * Performed when a map has been saved
 * @memberof actions.maps
 * @param  {object} map        The map
 * @param  {number} resourceId the identifier of the new map
 * @return {action}            type `SAVE_MAP`, with the arguments as they are named
 */
function saveMap(map, resourceId) {
    return {
        type: SAVE_MAP,
        resourceId,
        map
    };
}

/**
 * performed when want to disaplay/hide the metadata editing window
 * @memberof actions.maps
 * @param  {boolean} displayMetadataEditValue true to display, false to hide
 * @return {action}                          type `DISPLAY_METADATA_EDIT`, with the arguments as they are named
 */
function onDisplayMetadataEdit(displayMetadataEditValue) {
    return {
        type: DISPLAY_METADATA_EDIT,
        displayMetadataEditValue
    };
}
/**
 * resets the updating status for a resource
 * @memberof actions.maps
 * @param {number} resourceId the id of the resource
 */
function resetUpdating(resourceId) {
    return {
        type: RESET_UPDATING,
        resourceId
    };
}
/**
 * When the permission list is loading
 * @memberof actions.maps
 * @param  {number} mapId the id of the resource
 * @return {action}       type `PERMISSIONS_LIST_LOADING`, with the arguments as they are named
 */
function permissionsLoading(mapId) {
    return {
        type: PERMISSIONS_LIST_LOADING,
        mapId
    };
}

/**
 * When the permission list has been loaded
 * @memberof actions.maps
 * @param  {array} permissions  the permission
 * @param  {number} mapId       the id of the resource
 * @return {action}             type `PERMISSIONS_LIST_LOADED`, with the arguments as they are named
 */
function permissionsLoaded(permissions, mapId) {
    return {
        type: PERMISSIONS_LIST_LOADED,
        permissions,
        mapId
    };
}

/**
 * Perform the maps load
 * @memberof actions.maps
 * @param  {string} geoStoreUrl      the url of geostore
 * @param  {String} [searchText="*"] text to search
 * @param  {Object} [params={start:  0. limit: 12}] params for the request
 * @return {thunk}                  dispatches mapsLoading, mapsLoaded or loadError
 */
function loadMaps(geoStoreUrl, searchText = "*", params = {start: 0, limit: 12}) {
    return (dispatch) => {
        let opts = assign({}, {params}, geoStoreUrl ? {baseURL: geoStoreUrl} : {});
        dispatch(mapsLoading(searchText, params));
        GeoStoreApi.getResourcesByCategory("MAP", searchText, opts).then((response) => {
            dispatch(mapsLoaded(response, params, searchText));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

/**
 * perform permission load for a mapId
 * @memberof actions.maps
 * @param  {number} mapId the id of the map for the permission
 * @return {thunk}       dispatches permissionsLoaded, updateCurrentMapPermissions or loadError
 */
function loadPermissions(mapId) {
    if (!mapId) {
        return {
            type: 'NONE'
        };
    }
    return (dispatch) => {
        dispatch(permissionsLoading(mapId));
        GeoStoreApi.getPermissions(mapId, {}).then((response) => {
            dispatch(permissionsLoaded(response, mapId));
            dispatch(updateCurrentMapPermissions(response));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

/**
 * load the available goups for a new permission rule.
 * @memberof actions.maps
 * @param  {object} user the current user
 * @return {thunk}     dispatches updateCurrentMapGroups or loadError
 */
function loadAvailableGroups(user) {
    return (dispatch) => {
        GeoStoreApi.getAvailableGroups(user).then((response) => {
            dispatch(updateCurrentMapGroups(response));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

/**
 * updates a map
 * @memberof actions.maps
 * @param  {number} resourceId the id of the map to update
 * @param  {object} content    the new content
 * @param  {object} [options]   options for the request
 * @return {thunk}  dispatches mapUpdating or loadError
 */
function updateMap(resourceId, content, options) {
    return (dispatch) => {
        dispatch(mapUpdating(resourceId, content));
        GeoStoreApi.putResource(resourceId, content, options).then(() => {
            // dispatch(mapUpdated(resourceId, content, "success")); // TODO wrong usage, use another action
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

/**
 * updates metadata for a map
 * @memberof actions.maps
 * @param  {number} resourceId     the id of the map to updates
 * @param  {string} newName        the new name for the map
 * @param  {string} newDescription the new description for the map
 * @param  {action} [onReset]        an action to dispatch after save, if present, to reset the current map
 * @param  {object} [options]        the request options, if any
 * @return {thunk}  updates metadata and diepatches mapMetadataUpdated, onReset action (argument), resetCurrentMap or thumbnailError
 */
function updateMapMetadata(resourceId, newName, newDescription, onReset, options) {
    return (dispatch) => {
        GeoStoreApi.putResourceMetadata(resourceId, newName, newDescription, options).then(() => {
            dispatch(mapMetadataUpdated(resourceId, newName, newDescription, "success"));
            if (onReset) {
                dispatch(onReset);
                dispatch(resetCurrentMap());
            }
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}

/**
 * updates permissions for the given map.
 * @memberof actions.maps
 * @param  {number} resourceId    the identifier of the map
 * @param  {object} securityRules the new securityRules
 * @return {thunk} performs updateResourcePermissions and dispatch permissionsUpdated or thumbnailError
 */
function updatePermissions(resourceId, securityRules) {
    if (!securityRules || !securityRules.SecurityRuleList || !securityRules.SecurityRuleList.SecurityRule) {
        return {
            type: "NONE"
        };
    }
    return (dispatch) => {
        GeoStoreApi.updateResourcePermissions(resourceId, securityRules).then(() => {
            dispatch(permissionsUpdated(resourceId, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
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
 * Creates the thumbnail for the map.
 * @memberof actions.maps
 * @param  {object} map               the map
 * @param  {object} metadataMap       the map metadataMap
 * @param  {string} nameThumbnail     the name for the thumbnail
 * @param  {string} dataThumbnail     the data to save for the thumbnail
 * @param  {string} categoryThumbnail the category for the thumbnails
 * @param  {number} resourceIdMap     the resourceId of the map
 * @param  {action} [onSuccess]       the action to dispatch on success
 * @param  {action} [onReset]         the action to dispatch on reset
 * @param  {object} [options]         options for the request
 * @return {thunk}                   perform the thumb creation and dispatch proper actions
 */
function createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, onSuccess, onReset, options) {
    return (dispatch, getState) => {
        let metadata = {
            name: nameThumbnail
        };
        return GeoStoreApi.createResource(metadata, dataThumbnail, categoryThumbnail, options).then((response) => {
            let state = getState();
            let groups = get(state, "security.user.groups.group");
            let index = findIndex(groups, function(g) { return g.groupName === "everyone"; });
            let group;
            if (index < 0 && groups && groups.groupName === "everyone") {
                group = groups;
            } else {
                group = groups[index];
            }
            let user = get(state, "security.user");
            let userPermission = {
                canRead: true,
                canWrite: true
            };
            let groupPermission = {
                canRead: true,
                canWrite: false
            };
            dispatch(updatePermissions(response.data, groupPermission, group, userPermission, user, options)); // UPDATE resource permissions
            const thumbnailUrl = ConfigUtils.getDefaults().geoStoreUrl + "data/" + response.data + "/raw?decode=datauri";
            const encodedThumbnailUrl = encodeURIComponent(encodeURIComponent(thumbnailUrl));
            dispatch(updateAttribute(resourceIdMap, "thumbnail", encodedThumbnailUrl, "STRING", options)); // UPDATE resource map with new attribute
            if (onSuccess) {
                dispatch(onSuccess);
            }
            if (onReset) {
                dispatch(onReset);
                dispatch(resetCurrentMap());
            }
            dispatch(saveMap(map, resourceIdMap));
            dispatch(thumbnailError(resourceIdMap, null));
        }).catch((e) => {
            dispatch(thumbnailError(resourceIdMap, e));
        });
    };
}

/**
 * Save all the metadata and thubnail, if needed.
 * @memberof actions.maps
 * @param  {object} map               the map object
 * @param  {object} metadataMap       metadata for the map
 * @param  {string} nameThumbnail     the name for the thubnail
 * @param  {string} dataThumbnail     the data to save for the thubnail
 * @param  {string} categoryThumbnail the category for the thumbnails
 * @param  {number} resourceIdMap     the id of the map
 * @param  {object} [options]           options for the request
 * @return {thunk}                   perform the update and dispatch proper actions
 */
function saveAll(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options) {
    return (dispatch) => {
        dispatch(mapUpdating(resourceIdMap));
        dispatch(updatePermissions(resourceIdMap));
        if (dataThumbnail !== null && metadataMap !== null) {
            dispatch(createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap,
                updateMapMetadata(resourceIdMap, metadataMap.name, metadataMap.description, onDisplayMetadataEdit(false), options), null, options));
        } else if (dataThumbnail !== null) {
            dispatch(createThumbnail(map, metadataMap, nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, null, onDisplayMetadataEdit(false), options));
        } else if (metadataMap !== null) {
            dispatch(updateMapMetadata(resourceIdMap, metadataMap.name, metadataMap.description, onDisplayMetadataEdit(false), options));
        } else {
            dispatch(resetUpdating(resourceIdMap));
            dispatch(onDisplayMetadataEdit(false));
        }
        dispatch(resetCurrentMap());
    };
}

/**
 * Deletes a thubnail.
 * @memberof actions.maps
 * @param  {number} resourceId    the id of the thumbnail
 * @param  {number} resourceIdMap the id of the map
 * @param  {object} [options]       options for the request, if any
 * @return {thunk}               performs thumbnail cancellation
 */
function deleteThumbnail(resourceId, resourceIdMap, options) {
    return (dispatch) => {
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapUpdating(resourceIdMap));
            if (resourceIdMap) {
                dispatch(updateAttribute(resourceIdMap, "thumbnail", "NODATA", "STRING", options));
                dispatch(resetUpdating(resourceIdMap));
            }
            dispatch(onDisplayMetadataEdit(false));
            dispatch(resetCurrentMap());
        }).catch((e) => {
            // Even if is not possible to delete the Thumbnail from geostore -> reset the attribute in order to display the default thumbnail
            if (e.status === 403) {
                if (resourceIdMap) {
                    dispatch(updateAttribute(resourceIdMap, "thumbnail", "NODATA", "STRING", options));
                }
                dispatch(onDisplayMetadataEdit(false));
                dispatch(resetCurrentMap());
                dispatch(thumbnailError(resourceIdMap, null));
            } else {
                dispatch(onDisplayMetadataEdit(true));
                dispatch(thumbnailError(resourceIdMap, e));
            }
        });
    };
}
/**
 * Creates a new map.
 * @memberof actions.maps
 * @param  {object} metadata    metadata for the new map
 * @param  {object} content     the map object itself
 * @param  {object} [thumbnail] the thumbnail
 * @param  {object} [options]   options for the request
 * @return {thunk}              creates the map and dispatches  createThumbnail, mapCreated and so on
 */
function createMap(metadata, content, thumbnail, options) {
    return (dispatch) => {
        GeoStoreApi.createResource(metadata, content, "MAP", options).then((response) => {
            let resourceId = response.data;
            if (thumbnail && thumbnail.data) {
                dispatch(createThumbnail(null, null, thumbnail.name, thumbnail.data, thumbnail.category, resourceId, options));
            }
            dispatch(mapCreated(response.data, assign({id: response.data, canDelete: true, canEdit: true, canCopy: true}, metadata), content));
            dispatch(onDisplayMetadataEdit(false));
        }).catch((e) => {
            dispatch(mapError(e));
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
    return (dispatch, getState) => {
        dispatch(mapDeleting(resourceId));
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapDeleted(resourceId, "success"));
            let state = getState && getState();
            if ( state && state.maps && state.maps.totalCount === state.maps.start) {
                dispatch(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
            }
        }).catch((e) => {
            dispatch(mapDeleted(resourceId, "failure", e));
        });
    };
}
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
    MAP_METADATA_UPDATED,
    MAP_UPDATED,
    MAP_DELETED,
    MAP_DELETING,
    MAP_SAVED,
    ATTRIBUTE_UPDATED,
    PERMISSIONS_UPDATED,
    SAVE_MAP,
    THUMBNAIL_ERROR,
    PERMISSIONS_LIST_LOADING,
    PERMISSIONS_LIST_LOADED,
    SAVE_ALL,
    DISPLAY_METADATA_EDIT,
    RESET_UPDATING,
    MAP_ERROR,
    RESET_CURRENT_MAP,
    MAPS_SEARCH_TEXT_CHANGED,
    METADATA_CHANGED,
    metadataChanged,
    loadMaps,
    mapsLoading,
    mapsLoaded,
    mapCreated,
    mapDeleted,
    mapDeleting,
    updateMap,
    updateMapMetadata,
    mapMetadataUpdated,
    deleteMap,
    deleteThumbnail,
    createThumbnail,
    mapUpdating,
    updatePermissions,
    permissionsUpdated,
    permissionsLoading,
    permissionsLoaded,
    attributeUpdated,
    saveMap,
    thumbnailError,
    createMap,
    loadError,
    loadPermissions,
    loadAvailableGroups,
    saveAll,
    onDisplayMetadataEdit,
    resetUpdating,
    resetCurrentMap,
    mapError,
    mapsSearchTextChanged,
    updateAttribute
};
