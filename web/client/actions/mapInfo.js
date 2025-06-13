/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import GeoCodingApi from '../api/Nominatim';

export const LOAD_FEATURE_INFO = 'LOAD_FEATURE_INFO';
export const ERROR_FEATURE_INFO = 'ERROR_FEATURE_INFO';
export const EXCEPTIONS_FEATURE_INFO = 'EXCEPTIONS_FEATURE_INFO';
export const CHANGE_MAPINFO_STATE = 'CHANGE_MAPINFO_STATE';
export const NEW_MAPINFO_REQUEST = 'NEW_MAPINFO_REQUEST';
export const PURGE_MAPINFO_RESULTS = 'PURGE_MAPINFO_RESULTS';
export const CHANGE_MAPINFO_FORMAT = 'CHANGE_MAPINFO_FORMAT';
export const SHOW_MAPINFO_MARKER = 'SHOW_MAPINFO_MARKER';
export const HIDE_MAPINFO_MARKER = 'HIDE_MAPINFO_MARKER';
export const SHOW_REVERSE_GEOCODE = 'SHOW_REVERSE_GEOCODE';
export const HIDE_REVERSE_GEOCODE = 'HIDE_REVERSE_GEOCODE';
export const NO_QUERYABLE_LAYERS = 'NO_QUERYABLE_LAYERS';
export const CLEAR_WARNING = 'CLEAR_WARNING';
export const FEATURE_INFO_CLICK = 'FEATURE_INFO_CLICK';
export const UPDATE_FEATURE_INFO_CLICK_POINT  = 'IDENTIFY:UPDATE_FEATURE_INFO_CLICK_POINT';
export const TOGGLE_HIGHLIGHT_FEATURE = "IDENTIFY:TOGGLE_HIGHLIGHT_FEATURE";
export const TOGGLE_MAPINFO_STATE = 'TOGGLE_MAPINFO_STATE';
export const UPDATE_CENTER_TO_MARKER = 'UPDATE_CENTER_TO_MARKER';
export const CHANGE_PAGE = 'IDENTIFY:CHANGE_PAGE';
export const CLOSE_IDENTIFY = 'IDENTIFY:CLOSE_IDENTIFY';
export const CHANGE_FORMAT = 'IDENTIFY:CHANGE_FORMAT';
export const TOGGLE_SHOW_COORD_EDITOR = 'IDENTIFY:TOGGLE_SHOW_COORD_EDITOR';
export const EDIT_LAYER_FEATURES = 'IDENTIFY:EDIT_LAYER_FEATURES';
export const SET_CURRENT_EDIT_FEATURE_QUERY = 'IDENTIFY:CURRENT_EDIT_FEATURE_QUERY';
export const SET_MAP_TRIGGER = 'IDENTIFY:SET_MAP_TRIGGER';

export const TOGGLE_EMPTY_MESSAGE_GFI = "IDENTIFY:TOGGLE_EMPTY_MESSAGE_GFI";

export const SET_SHOW_IN_MAP_POPUP = "IDENTIFY:SET_SHOW_IN_MAP_POPUP";
export const IDENTIFY_IS_MOUNTED = "IDENTIFY:IDENTIFY_IS_MOUNTED";
export const INIT_PLUGIN = 'IDENTIFY:INIT_PLUGIN';

export const toggleEmptyMessageGFI = () => ({type: TOGGLE_EMPTY_MESSAGE_GFI});

/**
 * Private
 * @return a LOAD_FEATURE_INFO action with the response data to a wms GetFeatureInfo
 */
export function loadFeatureInfo(reqId, data, rParams, lMetaData, layer, queryParamZoomOption = null) {
    return {
        type: LOAD_FEATURE_INFO,
        data: data,
        reqId: reqId,
        requestParams: rParams,
        layerMetadata: lMetaData,
        layer,
        queryParamZoomOption
    };
}

/**
 * Private
 * @return a ERROR_FEATURE_INFO action with the error occurred
 */
export function errorFeatureInfo(reqId, e, rParams, lMetaData) {
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
export function exceptionsFeatureInfo(reqId, exceptions, rParams, lMetaData) {
    return {
        type: EXCEPTIONS_FEATURE_INFO,
        reqId: reqId,
        exceptions: exceptions,
        requestParams: rParams,
        layerMetadata: lMetaData
    };
}

export function noQueryableLayers() {
    return {
        type: NO_QUERYABLE_LAYERS
    };
}

export function clearWarning() {
    return {
        type: CLEAR_WARNING
    };
}

export function newMapInfoRequest(reqId, reqConfig) {
    return {
        type: NEW_MAPINFO_REQUEST,
        reqId: reqId,
        request: reqConfig
    };
}

export function changeMapInfoState(enabled) {
    return {
        type: CHANGE_MAPINFO_STATE,
        enabled: enabled
    };
}

export function purgeMapInfoResults() {
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
 *   - "application/geo+json"
 *   - "application/vnd.ogc.gml"
 *   - "application/vnd.ogc.gml/3.1.1"
 */
export function changeMapInfoFormat(mimeType) {
    return {
        type: CHANGE_MAPINFO_FORMAT,
        infoFormat: mimeType
    };
}

export function showMapinfoMarker() {
    return {
        type: SHOW_MAPINFO_MARKER
    };
}

export function hideMapinfoMarker() {
    return {
        type: HIDE_MAPINFO_MARKER
    };
}

export function revGeocodeInfo(results) {
    return {
        type: SHOW_REVERSE_GEOCODE,
        reverseGeocodeData: results.data
    };
}

export function showMapinfoRevGeocode(latlng) {
    return (dispatch) => {
        GeoCodingApi.reverseGeocode(latlng).then((response) => {
            dispatch(revGeocodeInfo(response));
        }).catch((e) => {
            dispatch(revGeocodeInfo(e));
        });
    };
}

export function hideMapinfoRevGeocode() {
    return {
        type: HIDE_REVERSE_GEOCODE
    };
}

export function toggleMapInfoState() {
    return {
        type: TOGGLE_MAPINFO_STATE
    };
}

/**
 * Update center to marker if it's not in visible extent
 */

export function updateCenterToMarker(status) {
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
 * @param {string} [ignoreVisibilityLimits=false] a boolean flag for ignoring layer visibility limits restrictions to apply GFI
 * @param {number[]} [bbox=[]] bbox of the identified fearure in the form of [minx, miny, maxx, maxy]
 * @param {object} queryParamZoomOption the override zoom option
 * @param {number} queryParamZoomOption.overrideZoomLvl the override zoom level value if exist to make map zoom within this value
 * @param {boolean} queryParamZoomOption.isCoordsProvided a flag to skip zooming to identified feature to use map zoom level if center/marker or bbox provided
 */
export function featureInfoClick(point, layer, filterNameList = [], overrideParams = {}, itemId = null, ignoreVisibilityLimits = false, bbox = null, queryParamZoomOption = null) {
    return {
        type: FEATURE_INFO_CLICK,
        point,
        layer,
        filterNameList,
        overrideParams,
        itemId,
        ignoreVisibilityLimits,
        bbox,
        queryParamZoomOption
    };
}

export function updateFeatureInfoClickPoint(point) {
    return {
        type: UPDATE_FEATURE_INFO_CLICK_POINT,
        point
    };
}

export function toggleHighlightFeature(enabled) {
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
export function changePage(index) {
    return {
        type: CHANGE_PAGE,
        index
    };
}

export const closeIdentify = () => ({
    type: CLOSE_IDENTIFY
});

/**
 * change format of coordinate editor
 * @prop {string} format
*/
export const changeFormat = (format) => ({
    type: CHANGE_FORMAT,
    format
});

/**
 * action for toggling the state of the showCoordinateEditor flag
 * @prop {boolean} showCoordinateEditor
*/
export const toggleShowCoordinateEditor = (showCoordinateEditor) => ({
    type: TOGGLE_SHOW_COORD_EDITOR,
    showCoordinateEditor
});

export const editLayerFeatures = (layer) => ({
    type: EDIT_LAYER_FEATURES,
    layer
});

export const setCurrentEditFeatureQuery = (query) => ({
    type: SET_CURRENT_EDIT_FEATURE_QUERY,
    query
});

export const setMapTrigger = (trigger) => ({
    type: SET_MAP_TRIGGER,
    trigger
});

/**
 * Sets the 'showInMapPopup' value in the state.
 * @param {boolean} value the value to set
 */
export const setShowInMapPopup = (value) => ({
    type: SET_SHOW_IN_MAP_POPUP,
    value
});

/**
 * Action performed when the identify plugin mounts
 * @param {boolean} isMounted
 * @returns {{type: string, identifyIsMounted: boolean}}
 */
export const checkIdentifyIsMounted = (isMounted)=> ({
    type: IDENTIFY_IS_MOUNTED,
    isMounted
});

export const onInitPlugin = (cfg) => ({type: INIT_PLUGIN, cfg});
