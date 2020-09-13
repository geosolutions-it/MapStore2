/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
const UPDATE_FEATURE_INFO_CLICK_POINT  = 'IDENTIFY:UPDATE_FEATURE_INFO_CLICK_POINT';
const TOGGLE_HIGHLIGHT_FEATURE = "IDENTIFY:TOGGLE_HIGHLIGHT_FEATURE";
const TOGGLE_MAPINFO_STATE = 'TOGGLE_MAPINFO_STATE';
const UPDATE_CENTER_TO_MARKER = 'UPDATE_CENTER_TO_MARKER';
const CHANGE_PAGE = 'IDENTIFY:CHANGE_PAGE';
const CLOSE_IDENTIFY = 'IDENTIFY:CLOSE_IDENTIFY';
const CHANGE_FORMAT = 'IDENTIFY:CHANGE_FORMAT';
const TOGGLE_SHOW_COORD_EDITOR = 'IDENTIFY:TOGGLE_SHOW_COORD_EDITOR';
const EDIT_LAYER_FEATURES = 'IDENTIFY:EDIT_LAYER_FEATURES';
const SET_CURRENT_EDIT_FEATURE_QUERY = 'IDENTIFY:CURRENT_EDIT_FEATURE_QUERY';
const SET_MAP_TRIGGER = 'IDENTIFY:SET_MAP_TRIGGER';

const TOGGLE_EMPTY_MESSAGE_GFI = "IDENTIFY:TOGGLE_EMPTY_MESSAGE_GFI";
const toggleEmptyMessageGFI = () => ({type: TOGGLE_EMPTY_MESSAGE_GFI});

/**
 * Private
 * @return a LOAD_FEATURE_INFO action with the response data to a wms GetFeatureInfo
 */
function loadFeatureInfo(reqId, data, rParams, lMetaData, layer) {
    return {
        type: LOAD_FEATURE_INFO,
        data: data,
        reqId: reqId,
        requestParams: rParams,
        layerMetadata: lMetaData,
        layer
    };
}

/**
 * Private
 * @return a ERROR_FEATURE_INFO action with the error occurred
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
 * @return a EXCEPTIONS_FEATURE_INFO action with the wms exception occurred
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

function getVectorInfo(layer, request, metadata, queryableLayers) {
    return {
        type: GET_VECTOR_INFO,
        layer,
        request,
        metadata,
        queryableLayers
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

/**
 * Update center to marker if it's not in visible extent
 */

function updateCenterToMarker(status) {
    return {
        type: UPDATE_CENTER_TO_MARKER,
        status
    };
}
/**
 * Carries data needed for Get Feature Info request
 * @param {object} point point clicked in this shape {latlng: {lat:1, lng:2}, pixel:{x:33 y:33}, modifiers:{} }
 * @param {string} layer the name of the layer without workspace
 * @param {object[]} [filterNameList=[]] list of layers to perform the GFI request
 * @param {object} [overrideParams={}] a map based on name as key and objec as value for overriding request params
 * @param {string} [itemId=null] id of the item needed for filtering results
 */
function featureInfoClick(point, layer, filterNameList = [], overrideParams = {}, itemId = null) {
    return {
        type: FEATURE_INFO_CLICK,
        point,
        layer,
        filterNameList,
        overrideParams,
        itemId
    };
}

function updateFeatureInfoClickPoint(point) {
    return {
        type: UPDATE_FEATURE_INFO_CLICK_POINT,
        point
    };
}

function toggleHighlightFeature(enabled) {
    return {
        type: TOGGLE_HIGHLIGHT_FEATURE,
        enabled
    };
}

/**
 * Changes the current page of the feature info.
 * The index is relative only to valid responses, excluding invalid.(see validResponsesSelector)
 * @param {number} index index of the page
 */
function changePage(index) {
    return {
        type: CHANGE_PAGE,
        index
    };
}

const closeIdentify = () => ({
    type: CLOSE_IDENTIFY
});

/**
 * change format of coordinate editor
 * @prop {string} format
*/
const changeFormat = (format) => ({
    type: CHANGE_FORMAT,
    format
});

/**
 * action for toggling the state of the showCoordinateEditor flag
 * @prop {boolean} showCoordinateEditor
*/
const toggleShowCoordinateEditor = (showCoordinateEditor) => ({
    type: TOGGLE_SHOW_COORD_EDITOR,
    showCoordinateEditor
});

const editLayerFeatures = (layer) => ({
    type: EDIT_LAYER_FEATURES,
    layer
});

const setCurrentEditFeatureQuery = (query) => ({
    type: SET_CURRENT_EDIT_FEATURE_QUERY,
    query
});

const setMapTrigger = (trigger) => ({
    type: SET_MAP_TRIGGER,
    trigger
});

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
    TOGGLE_HIGHLIGHT_FEATURE, toggleHighlightFeature,
    CHANGE_PAGE, changePage,
    TOGGLE_MAPINFO_STATE,
    UPDATE_CENTER_TO_MARKER,
    CLOSE_IDENTIFY,
    TOGGLE_EMPTY_MESSAGE_GFI, toggleEmptyMessageGFI,
    TOGGLE_SHOW_COORD_EDITOR, toggleShowCoordinateEditor,
    CHANGE_FORMAT, changeFormat,
    closeIdentify,
    exceptionsFeatureInfo,
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
    toggleMapInfoState,
    updateCenterToMarker,
    featureInfoClick,
    UPDATE_FEATURE_INFO_CLICK_POINT, updateFeatureInfoClickPoint,
    EDIT_LAYER_FEATURES, editLayerFeatures,
    SET_CURRENT_EDIT_FEATURE_QUERY, setCurrentEditFeatureQuery,
    SET_MAP_TRIGGER, setMapTrigger
};
