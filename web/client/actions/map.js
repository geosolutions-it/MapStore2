/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');
const axios = require('axios');

const CHANGE_MAP_VIEW = 'CHANGE_MAP_VIEW';
const LOAD_FEATURE_INFO = 'LOAD_FEATURE_INFO';
const ERROR_FEATURE_INFO = 'ERROR_FEATURE_INFO';
const EXCEPTIONS_FEATURE_INFO = 'EXCEPTIONS_FEATURE_INFO';
const CHANGE_MAPINFO_STATE = 'CHANGE_MAPINFO_STATE';
const NEW_MAPINFO_REQUEST = 'NEW_MAPINFO_REQUEST';
const PURGE_MAPINFO_RESULTS = 'PURGE_MAPINFO_RESULTS';

function changeMapView(center, zoom, bbox, size) {
    return {
        type: CHANGE_MAP_VIEW,
        center: center,
        zoom: zoom,
        bbox: bbox,
        size: size
    };
}

/**
 * Private
 * @return a LOAD_FEATURE_INFO action with the response data to a wms GetFeatureInfo
 */
function loadFeatureInfo(data) {
    return {
        type: LOAD_FEATURE_INFO,
        data: data
    };
}

/**
 * Private
 * @return a ERROR_FEATURE_INFO action with the error occured
 */
function errorFeatureInfo(e) {
    return {
        type: ERROR_FEATURE_INFO,
        error: e
    };
}

/**
 * Private
 * @return a EXCEPTIONS_FEATURE_INFO action with the wms exception occured
 *         during a GetFeatureInfo request.
 */
function exceptionsFeatureInfo(exceptions) {
    return {
        type: EXCEPTIONS_FEATURE_INFO,
        exceptions: exceptions
    };
}

/**
 * Sends a wms GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param wmsBasePath {string} base path to the wms service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
function getFeatureInfo(wmsBasePath, requestParams) {
    const defaultParams = {
        service: 'WMS',
        version: '1.0.0',
        request: 'GetFeatureInfo',
        crs: 'EPSG:4326',
        info_format: 'application/json',
        feature_count: 50,
        x: 0,
        y: 0,
        exceptions: 'application/json'
    };
    const param = assign({}, defaultParams, requestParams);
    return (dispatch) => {
        return axios.get(wmsBasePath, {params: param}).then((response) => {
            if (response.data.exceptions) {
                dispatch(exceptionsFeatureInfo(response.data.exceptions));
            } else {
                dispatch(loadFeatureInfo(response.data));
            }
        }).catch((e) => {
            dispatch(errorFeatureInfo(e));
        });
    };
}

function changeMapInfoState(enabled) {
    return {
        type: CHANGE_MAPINFO_STATE,
        enabled: enabled
    };
}

function newMapInfoRequest(reqConfig) {
    return {
        type: NEW_MAPINFO_REQUEST,
        request: reqConfig
    };
}

function purgeMapInfoResults() {
    return {
        type: PURGE_MAPINFO_RESULTS
    };
}

module.exports = {
    CHANGE_MAP_VIEW,
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    LOAD_FEATURE_INFO,
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    getFeatureInfo,
    changeMapView,
    changeMapInfoState,
    newMapInfoRequest,
    purgeMapInfoResults
};
