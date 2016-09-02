/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var GeoStoreApi = require('../api/GeoStoreDAO');
const ConfigUtils = require('../utils/ConfigUtils');
const assign = require('object-assign');
const {get, findIndex} = require('lodash');

const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
const MAP_UPDATING = 'MAP_UPDATING';
const MAP_UPDATED = 'MAP_UPDATED';
const MAP_CREATED = 'MAP_CREATED';
const MAP_DELETING = 'MAP_DELETING';
const MAP_DELETED = 'MAP_DELETED';
const MAP_SAVED = 'MAP_SAVED';
const ATTRIBUTE_UPDATED = 'ATTRIBUTE_UPDATED';
const THUMBNAIL_DELETED = 'THUMBNAIL_DELETED';
const PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED';
const THUMBNAIL_ERROR = ' THUMBNAIL_ERROR';

const SAVE_MAP = 'SAVE_MAP';

function mapsLoading(searchText, params) {
    return {
        type: MAPS_LIST_LOADING,
        searchText,
        params
    };
}

function mapsLoaded(maps, params, searchText) {
    return {
        type: MAPS_LIST_LOADED,
        params,
        maps,
        searchText
    };
}

function loadError(e) {
    return {
        type: MAPS_LIST_LOAD_ERROR,
        error: e
    };
}
function mapCreated(resourceId, metadata, content, error) {
    return {
        type: MAP_CREATED,
        resourceId,
        metadata,
        content,
        error

    };
}

function mapUpdating(resourceId) {
    return {
        type: MAP_UPDATING,
        resourceId
    };
}

function mapUpdated(resourceId, newName, newDescription, result, error) {
    return {
        type: MAP_UPDATED,
        resourceId,
        newName,
        newDescription,
        result,
        error
    };
}
function permissionsUpdated(resourceId, groupPermission, group, userPermission, user, error) {
    return {
        type: PERMISSIONS_UPDATED,
        resourceId,
        groupPermission,
        group,
        userPermission,
        user,
        error
    };
}

function mapDeleted(resourceId, result, error) {
    return {
        type: MAP_DELETED,
        resourceId,
        result,
        error
    };
}

function mapDeleting(resourceId, result, error) {
    return {
        type: MAP_DELETING,
        resourceId,
        result,
        error
    };
}

function thumbnailDeleted(resourceId, result, error) {
    return {
        type: THUMBNAIL_DELETED,
        resourceId,
        result,
        error
    };
}

function attributeUpdated(resourceId, name, value, type, error) {
    return {
        type: ATTRIBUTE_UPDATED,
        resourceId,
        name,
        value,
        error
    };
}

function thumbnailError(resourceId, error) {
    return {
        type: THUMBNAIL_ERROR,
        resourceId,
        error
    };
}

function loadMaps(geoStoreUrl, searchText="*", params={start: 0, limit: 20}) {
    return (dispatch) => {
        let opts = {params, baseURL: geoStoreUrl };
        dispatch(mapsLoading(searchText, params));
        GeoStoreApi.getResourcesByCategory("MAP", searchText, opts).then((response) => {
            dispatch(mapsLoaded(response, params, searchText));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

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

function updatePermissions(resourceId, groupPermission, group, userPermission, user, options) {
    return (dispatch) => {
        GeoStoreApi.addResourcePermissions(resourceId, groupPermission, group, userPermission, user, options).then(() => {
            dispatch(permissionsUpdated(resourceId, groupPermission, group, userPermission, user, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}

function updateAttribute(resourceId, name, value, type, options) {
    return (dispatch) => {
        GeoStoreApi.updateResourceAttribute(resourceId, name, value, type, options).then(() => {
            dispatch(attributeUpdated(resourceId, name, value, type, "success"));
        }).catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        });
    };
}


function createThumbnail(nameThumbnail, dataThumbnail, categoryThumbnail, resourceIdMap, options) {
    return (dispatch, getState) => {
        let metadata = {
            name: nameThumbnail
        };
        dispatch(mapUpdating(resourceIdMap));
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
        }).catch((e) => {
            dispatch(thumbnailError(resourceIdMap, e));
        });
    };
}

function deleteThumbnail(resourceId, mapId, options) {
    return (dispatch) => {
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(thumbnailDeleted(resourceId, "success"));
            if (mapId) {
                dispatch(updateAttribute(mapId, "thumbnail", "NODATA", "STRING", options));
            }
        })/*.catch((e) => {
            dispatch(thumbnailError(resourceId, e));
        })*/;
    };
}

function updateMapMetadata(resourceId, newName, newDescription, options) {
    return (dispatch) => {
        dispatch(mapUpdating(resourceId));
        GeoStoreApi.putResourceMetadata(resourceId, newName, newDescription, options).then(() => {
            dispatch(mapUpdated(resourceId, newName, newDescription, "success"));
        }).catch((e) => {
            dispatch(mapUpdated(resourceId, newName, newDescription, "failure", e));
        });
    };
}

function createMap(metadata, content, thumbnail, options) {
    return (dispatch) => {
        GeoStoreApi.createResource(metadata, content, "MAP", options).then((response) => {
            let resourceId = response.data;
            if (thumbnail && thumbnail.data) {
                dispatch(createThumbnail(thumbnail.name, thumbnail.data, thumbnail.category, resourceId, options));
            }
            dispatch(mapCreated(response.data, assign({id: response.data, canDelete: true, canEdit: true, canCopy: true}, metadata), content));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

function deleteMap(resourceId, options) {
    return (dispatch) => {
        dispatch(mapDeleting(resourceId));
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapDeleted(resourceId, "success"));
        }).catch((e) => {
            dispatch(mapDeleted(resourceId, "failure", e));
        });
    };
}

function saveMap(map, resourceId) {
    return {
        type: SAVE_MAP,
        resourceId,
        map
    };
}


module.exports = {
    MAPS_LIST_LOADED, MAPS_LIST_LOADING, MAPS_LIST_LOAD_ERROR, MAP_CREATED, MAP_UPDATING, MAP_UPDATED, MAP_DELETED, MAP_DELETING, MAP_SAVED, ATTRIBUTE_UPDATED, THUMBNAIL_DELETED, PERMISSIONS_UPDATED, SAVE_MAP, THUMBNAIL_ERROR,
    loadMaps, updateMap, updateMapMetadata, deleteMap, deleteThumbnail, createThumbnail, thumbnailDeleted, createMap, mapUpdating, updatePermissions, permissionsUpdated, attributeUpdated, saveMap, thumbnailError
};
