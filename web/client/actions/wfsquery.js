/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const LAYER_SELECTED_FOR_SEARCH = 'LAYER_SELECTED_FOR_SEARCH';
const FEATURE_TYPE_SELECTED = 'FEATURE_TYPE_SELECTED';
const FEATURE_TYPE_LOADED = 'FEATURE_TYPE_LOADED';
const FEATURE_LOADED = 'FEATURE_LOADED';
const FEATURE_LOADING = 'FEATURE_LOADING';
const FEATURE_TYPE_ERROR = 'FEATURE_TYPE_ERROR';
const FEATURE_ERROR = 'FEATURE_ERROR';
const QUERY_CREATE = 'QUERY_CREATE';
const UPDATE_QUERY = 'QUERY:UPDATE_QUERY';
const QUERY_RESULT = 'QUERY_RESULT';
const QUERY_ERROR = 'QUERY_ERROR';
const RESET_QUERY = 'RESET_QUERY';
const QUERY = 'QUERY';
const INIT_QUERY_PANEL = 'INIT_QUERY_PANEL';
const TOGGLE_SYNC_WMS = 'QUERY:TOGGLE_SYNC_WMS';
const TOGGLE_LAYER_FILTER = 'QUERY:TOGGLE_LAYER_FILTER';

function toggleSyncWms() {
    return {
        type: TOGGLE_SYNC_WMS
    };
}

function toggleLayerFilter() {
    return {
        type: TOGGLE_LAYER_FILTER
    };
}
const axios = require('../libs/ajax');

function layerSelectedForSearch(id) {
    return {
        type: LAYER_SELECTED_FOR_SEARCH,
        id
    };
}
function initQueryPanel() {
    return {
        type: INIT_QUERY_PANEL
    };
}
function featureTypeSelected(url, typeName) {
    return {
        type: FEATURE_TYPE_SELECTED,
        url,
        typeName
    };
}
function featureTypeLoaded(typeName, featureType) {
    return {
        type: FEATURE_TYPE_LOADED,
        typeName,
        featureType
    };
}

function featureTypeError(typeName, error) {
    return {
        type: FEATURE_TYPE_ERROR,
        typeName,
        error
    };
}

function featureLoading(isLoading) {
    return {
        type: FEATURE_LOADING,
        isLoading
    };
}
function featureLoaded(typeName, feature) {
    return {
        type: FEATURE_LOADED,
        typeName,
        feature
    };
}

function featureError(typeName, error) {
    return {
        type: FEATURE_ERROR,
        typeName,
        error
    };
}

function querySearchResponse(result, searchUrl, filterObj, queryOptions, reason) {
    return {
        type: QUERY_RESULT,
        searchUrl,
        filterObj,
        result,
        queryOptions,
        reason
    };
}
function queryError(error) {
    return {
        type: QUERY_ERROR,
        error
    };
}
function updateQuery(updates, reason) {
    return {
        type: UPDATE_QUERY,
        updates,
        reason
    };
}
function loadFeature(baseUrl, typeName) {
    return (dispatch) => {
        return axios.get(baseUrl + '?service=WFS&version=1.1.0&request=GetFeature&typeName=' + typeName + '&outputFormat=application/json').then((response) => {
            if (typeof response.data === 'object') {
                dispatch(featureLoaded(typeName, response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(featureError(typeName, 'Error from WFS: ' + e.message));
                }

            }

        }).catch((e) => {
            dispatch(featureError(typeName, e));
        });
    };
}
function createQuery(searchUrl, filterObj) {
    return {
        type: QUERY_CREATE,
        searchUrl,
        filterObj
    };
}

/**
 * Trigger a wfs query
 * @param {string} searchUrl wfs search url
 * @param {object} filterObj filter to query with
 * @param {object} queryOptions
 * @param {any} reason custom parameter that will be supplied to QUERY_RESULT after query completion
 */
function query(searchUrl, filterObj, queryOptions, reason) {
    return {
        type: QUERY,
        searchUrl,
        filterObj,
        queryOptions,
        reason
    };
}

function resetQuery() {
    return {
        type: RESET_QUERY
    };
}

module.exports = {
    LAYER_SELECTED_FOR_SEARCH, layerSelectedForSearch,
    FEATURE_TYPE_SELECTED, featureTypeSelected,
    FEATURE_TYPE_LOADED, featureTypeLoaded,
    FEATURE_TYPE_ERROR, featureTypeError,
    FEATURE_ERROR, featureError,
    QUERY_CREATE, createQuery,
    QUERY_RESULT, querySearchResponse,
    QUERY_ERROR, queryError,
    RESET_QUERY, resetQuery,
    QUERY, query,
    UPDATE_QUERY, updateQuery,
    FEATURE_LOADING, featureLoading,
    FEATURE_LOADED, featureLoaded,
    INIT_QUERY_PANEL, initQueryPanel,
    loadFeature,
    TOGGLE_SYNC_WMS, toggleSyncWms,
    TOGGLE_LAYER_FILTER, toggleLayerFilter
};
