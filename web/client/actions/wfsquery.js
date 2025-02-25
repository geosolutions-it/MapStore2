/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const LAYER_SELECTED_FOR_SEARCH = 'LAYER_SELECTED_FOR_SEARCH';
export const FEATURE_TYPE_SELECTED = 'FEATURE_TYPE_SELECTED';
export const FEATURE_TYPE_LOADED = 'FEATURE_TYPE_LOADED';
export const FEATURE_LOADED = 'FEATURE_LOADED';
export const FEATURE_LOADING = 'FEATURE_LOADING';
export const FEATURE_TYPE_ERROR = 'FEATURE_TYPE_ERROR';
export const FEATURE_ERROR = 'FEATURE_ERROR';
export const QUERY_CREATE = 'QUERY_CREATE';
export const UPDATE_QUERY = 'QUERY:UPDATE_QUERY';
export const QUERY_RESULT = 'QUERY_RESULT';
export const QUERY_ERROR = 'QUERY_ERROR';
export const RESET_QUERY = 'RESET_QUERY';
export const QUERY = 'QUERY';
export const INIT_QUERY_PANEL = 'INIT_QUERY_PANEL';
export const TOGGLE_SYNC_WMS = 'QUERY:TOGGLE_SYNC_WMS';
export const TOGGLE_LAYER_FILTER = 'QUERY:TOGGLE_LAYER_FILTER';

export function toggleSyncWms() {
    return {
        type: TOGGLE_SYNC_WMS
    };
}

export function toggleLayerFilter() {
    return {
        type: TOGGLE_LAYER_FILTER
    };
}
import axios from '../libs/ajax';

export function layerSelectedForSearch(id) {
    return {
        type: LAYER_SELECTED_FOR_SEARCH,
        id
    };
}
export function initQueryPanel() {
    return {
        type: INIT_QUERY_PANEL
    };
}
export function featureTypeSelected(url, typeName, fields = [], owner) {
    return {
        type: FEATURE_TYPE_SELECTED,
        url,
        typeName,
        fields,
        owner
    };
}
export function featureTypeLoaded(typeName, featureType, owner) {
    return {
        type: FEATURE_TYPE_LOADED,
        typeName,
        featureType,
        owner
    };
}

export function featureTypeError(typeName, error) {
    return {
        type: FEATURE_TYPE_ERROR,
        typeName,
        error
    };
}

export function featureLoading(isLoading) {
    return {
        type: FEATURE_LOADING,
        isLoading
    };
}
export function featureLoaded(typeName, feature) {
    return {
        type: FEATURE_LOADED,
        typeName,
        feature
    };
}

export function featureError(typeName, error) {
    return {
        type: FEATURE_ERROR,
        typeName,
        error
    };
}

export function querySearchResponse(result, searchUrl, filterObj, queryOptions, reason) {
    return {
        type: QUERY_RESULT,
        searchUrl,
        filterObj,
        result,
        queryOptions,
        reason
    };
}
export function queryError(error) {
    return {
        type: QUERY_ERROR,
        error
    };
}
/**
 * Triggers a new query updating some parameters.
 * @param {object} [param.updates] updates to apply to the filter object (merged with the original filter)
 * @param {string} [param.reason] "geometry" or undefined. If "geometry", triggers selection of features.
 * @param {boolean} [param.useLayerFilter] enable/disable the usage of the current layer filter
 */
export function updateQuery({updates, reason, useLayerFilter} = {}) {
    return {
        type: UPDATE_QUERY,
        updates,
        reason,
        useLayerFilter
    };
}
export function loadFeature(baseUrl, typeName) {
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
export function createQuery(searchUrl, filterObj, owner) {
    return {
        type: QUERY_CREATE,
        searchUrl,
        filterObj,
        owner
    };
}

/**
 * Trigger a wfs query
 * @param {string} searchUrl wfs search url
 * @param {object} filterObj filter to query with
 * @param {object} queryOptions
 * @param {any} reason custom parameter that will be supplied to QUERY_RESULT after query completion
 */
export function query(searchUrl, filterObj, queryOptions, reason) {
    return {
        type: QUERY,
        searchUrl,
        filterObj,
        queryOptions,
        reason
    };
}

export function resetQuery() {
    return {
        type: RESET_QUERY
    };
}
