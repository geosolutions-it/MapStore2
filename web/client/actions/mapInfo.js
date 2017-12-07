/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const axios = require('axios');
const uuid = require('uuid');
const GeoCodingApi = require('../api/Nominatim');

const LOAD_FEATURE_INFO = 'LOAD_FEATURE_INFO';
const ERROR_FEATURE_INFO = 'ERROR_FEATURE_INFO';
const EXCEPTIONS_FEATURE_INFO = 'EXCEPTIONS_FEATURE_INFO';
const CHANGE_MAPINFO_STATE = 'CHANGE_MAPINFO_STATE';
const NEW_MAPINFO_REQUEST = 'NEW_MAPINFO_REQUEST';
const PURGE_MAPINFO_RESULTS = 'PURGE_MAPINFO_RESULTS';
const CHANGE_MAPINFO_FORMAT = 'CHANGE_MAPINFO_FORMAT';
const SHOW_MAPINFO_MARKER = 'SHOW_MAPINFO_MARKER';
const HIDE_MAPINFO_MARKER = 'HIDE_MAPINFO_MARKER';
const SHOW_REVERSE_GEOCODE = 'SHOW_REVERSE_GEOCODE';
const HIDE_REVERSE_GEOCODE = 'HIDE_REVERSE_GEOCODE';
const GET_VECTOR_INFO = 'GET_VECTOR_INFO';
const NO_QUERYABLE_LAYERS = 'NO_QUERYABLE_LAYERS';
const CLEAR_WARNING = 'CLEAR_WARNING';
const FEATURE_INFO_CLICK = 'FEATURE_INFO_CLICK';
const TOGGLE_MAPINFO_STATE = 'TOGGLE_MAPINFO_STATE';

/**
 * Private
 * @return a LOAD_FEATURE_INFO action with the response data to a wms GetFeatureInfo
 */
function loadFeatureInfo(reqId, data, rParams, lMetaData) {
    return {
        type: LOAD_FEATURE_INFO,
        data: data,
        reqId: reqId,
        requestParams: rParams,
        layerMetadata: lMetaData
    };
}

/**
 * Private
 * @return a ERROR_FEATURE_INFO action with the error occured
 */
function errorFeatureInfo(reqId, e, rParams, lMetaData) {
    return {
        type: ERROR_FEATURE_INFO,
        error: e,
        reqId: reqId,
        requestParams: rParams,
        layerMetadata: lMetaData
    };
}

/**
 * Private
 * @return a EXCEPTIONS_FEATURE_INFO action with the wms exception occured
 *         during a GetFeatureInfo request.
 */
function exceptionsFeatureInfo(reqId, exceptions, rParams, lMetaData) {
    return {
        type: EXCEPTIONS_FEATURE_INFO,
        reqId: reqId,
        exceptions: exceptions,
        requestParams: rParams,
        layerMetadata: lMetaData
    };
}

function noQueryableLayers() {
    return {
        type: NO_QUERYABLE_LAYERS
    };
}

function clearWarning() {
    return {
        type: CLEAR_WARNING
    };
}

function newMapInfoRequest(reqId, reqConfig) {
    return {
        type: NEW_MAPINFO_REQUEST,
        reqId: reqId,
        request: reqConfig
    };
}

function getVectorInfo(layer, request, metadata) {
    return {
        type: GET_VECTOR_INFO,
        layer,
        request,
        metadata
    };
}


/**
 * Sends a GetFeatureInfo request and dispatches the right action
 * in case of success, error or exceptions.
 *
 * @param basePath {string} base path to the service
 * @param requestParams {object} map of params for a getfeatureinfo request.
 */
function getFeatureInfo(basePath, requestParams, lMetaData, options = {}) {
    const param = assign({}, options, requestParams);
    const reqId = uuid.v1();
    return (dispatch) => {
        dispatch(newMapInfoRequest(reqId, param));
        axios.get(basePath, {params: param}).then((response) => {
            if (response.data.exceptions) {
                dispatch(exceptionsFeatureInfo(reqId, response.data.exceptions, requestParams, lMetaData));
            } else {
                dispatch(loadFeatureInfo(reqId, response.data, requestParams, lMetaData));
            }
        }).catch((e) => {
            dispatch(errorFeatureInfo(reqId, e, requestParams, lMetaData));
        });
    };
}

function changeMapInfoState(enabled) {
    return {
        type: CHANGE_MAPINFO_STATE,
        enabled: enabled
    };
}

function purgeMapInfoResults() {
    return {
        type: PURGE_MAPINFO_RESULTS
    };
}

/**
 * Set a new format for GetFeatureInfo request.
 * @param mimeType {string} correct value are:
 *   - "text/plain"
 *   - "text/html"
 *   - "text/javascript"
 *   - "application/json"
 *   - "application/vnd.ogc.gml"
 *   - "application/vnd.ogc.gml/3.1.1"
 */
function changeMapInfoFormat(mimeType) {
    return {
        type: CHANGE_MAPINFO_FORMAT,
        infoFormat: mimeType
    };
}

function showMapinfoMarker() {
    return {
        type: SHOW_MAPINFO_MARKER
    };
}

function hideMapinfoMarker() {
    return {
        type: HIDE_MAPINFO_MARKER
    };
}

function revGeocodeInfo(results) {
    return {
        type: SHOW_REVERSE_GEOCODE,
        reverseGeocodeData: results.data
    };
}

function showMapinfoRevGeocode(latlng) {
    return (dispatch) => {
        GeoCodingApi.reverseGeocode(latlng).then((response) => {
            dispatch(revGeocodeInfo(response));
        }).catch((e) => {
            dispatch(revGeocodeInfo(e));
        });
    };
}

function hideMapinfoRevGeocode() {
    return {
        type: HIDE_REVERSE_GEOCODE
    };
}

function toggleMapInfoState() {
    return {
        type: TOGGLE_MAPINFO_STATE
    };
}

module.exports = {
    ERROR_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    LOAD_FEATURE_INFO,
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    CHANGE_MAPINFO_FORMAT,
    SHOW_MAPINFO_MARKER,
    HIDE_MAPINFO_MARKER,
    SHOW_REVERSE_GEOCODE,
    HIDE_REVERSE_GEOCODE,
    GET_VECTOR_INFO,
    NO_QUERYABLE_LAYERS,
    CLEAR_WARNING,
    FEATURE_INFO_CLICK,
    TOGGLE_MAPINFO_STATE,
    getFeatureInfo,
    changeMapInfoState,
    newMapInfoRequest,
    purgeMapInfoResults,
    changeMapInfoFormat,
    showMapinfoMarker,
    hideMapinfoMarker,
    revGeocodeInfo,
    hideMapinfoRevGeocode,
    showMapinfoRevGeocode,
    getVectorInfo,
    noQueryableLayers,
    clearWarning,
    errorFeatureInfo,
    loadFeatureInfo,
    toggleMapInfoState
};
