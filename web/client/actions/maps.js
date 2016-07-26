/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var GeoStoreApi = require('../api/GeoStoreDAO');

const MAPS_LIST_LOADED = 'MAPS_LIST_LOADED';
const MAPS_LIST_LOADING = 'MAPS_LIST_LOADING';
const MAPS_LIST_LOAD_ERROR = 'MAPS_LIST_LOAD_ERROR';
const MAP_UPDATED = 'MAP_UPDATED';
const MAP_DELETED = 'MAP_DELETED';

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

function mapDeleted(resourceId, result, error) {
    return {
        type: MAP_DELETED,
        resourceId,
        result,
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
        GeoStoreApi.putResource(resourceId, content, options).then(() => {
            dispatch(mapUpdated(resourceId, content, "success"));
        }).catch((e) => {
            dispatch(loadError(e));
        });
    };
}

function updateMapMetadata(resourceId, newName, newDescription, options) {
    return (dispatch) => {
        GeoStoreApi.putResourceMetadata(resourceId, newName, newDescription, options).then(() => {
            dispatch(mapUpdated(resourceId, newName, newDescription, "success"));
        }).catch((e) => {
            dispatch(mapUpdated(resourceId, newName, newDescription, "failure", e));
        });
    };
}

function deleteMap(resourceId, options) {
    return (dispatch) => {
        GeoStoreApi.deleteResource(resourceId, options).then(() => {
            dispatch(mapDeleted(resourceId, "success"));
        }).catch((e) => {
            dispatch(mapDeleted(resourceId, "failure", e));
        });
    };
}

module.exports = {MAPS_LIST_LOADED, MAPS_LIST_LOADING, MAPS_LIST_LOAD_ERROR, MAP_UPDATED, MAP_DELETED, loadMaps, updateMap, updateMapMetadata, deleteMap};
