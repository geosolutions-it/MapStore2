/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const ADD_FILTER_FIELD = 'ADD_FILTER_FIELD';
export const REMOVE_FILTER_FIELD = 'REMOVE_FILTER_FIELD';
export const UPDATE_FILTER_FIELD = 'UPDATE_FILTER_FIELD';
export const UPDATE_EXCEPTION_FIELD = 'UPDATE_EXCEPTION_FIELD';
export const ADD_GROUP_FIELD = 'ADD_GROUP_FIELD';
export const UPDATE_LOGIC_COMBO = 'UPDATE_LOGIC_COMBO';
export const REMOVE_GROUP_FIELD = 'REMOVE_GROUP_FIELD';
export const CHANGE_CASCADING_VALUE = 'CHANGE_CASCADING_VALUE';
export const EXPAND_ATTRIBUTE_PANEL = 'EXPAND_ATTRIBUTE_PANEL';
export const EXPAND_SPATIAL_PANEL = 'EXPAND_SPATIAL_PANEL';
export const EXPAND_CROSS_LAYER = 'QUERYFORM:EXPAND_CROSS_LAYER';
export const SET_CROSS_LAYER_PARAMETER = 'QUERYFORM:SET_CROSS_LAYER_PARAMETER';
export const RESET_CROSS_LAYER_FILTER = 'QUERYFORM:RESET_CROSS_LAYER_FILTER';
export const SELECT_SPATIAL_METHOD = 'SELECT_SPATIAL_METHOD';
export const SELECT_VIEWPORT_SPATIAL_METHOD = 'SELECT_VIEWPORT_SPATIAL_METHOD';
export const UPDATE_GEOMETRY = 'UPDATE_GEOMETRY';
export const SELECT_SPATIAL_OPERATION = 'SELECT_SPATIAL_OPERATION';
export const CHANGE_SPATIAL_ATTRIBUTE = 'CHANGE_SPATIAL_ATTRIBUTE';
export const CHANGE_SPATIAL_FILTER_VALUE = 'CHANGE_SPATIAL_FILTER_VALUE';
export const REMOVE_SPATIAL_SELECT = 'REMOVE_SPATIAL_SELECT';
export const SHOW_SPATIAL_DETAILS = 'SHOW_SPATIAL_DETAILS';
export const QUERY_FORM_SEARCH = 'QUERY_FORM_SEARCH';
export const QUERY_FORM_RESET = 'QUERY_FORM_RESET';
// export  const WFS_LOAD_ERROR = 'WFS_LOAD_ERROR';
export const SHOW_GENERATED_FILTER = 'SHOW_GENERATED_FILTER';
export const CHANGE_DWITHIN_VALUE = 'CHANGE_DWITHIN_VALUE';

export const ZONE_SEARCH = 'ZONE_SEARCH';
export const ZONE_SEARCH_ERROR = 'ZONE_SEARCH_ERROR';
export const ZONE_FILTER = 'ZONE_FILTER';

// export  const OPEN_MENU = 'OPEN_MENU';

export const ZONE_CHANGE = 'ZONE_CHANGE';
export const ZONES_RESET = 'ZONES_RESET';

export const SIMPLE_FILTER_FIELD_UPDATE = 'SIMPLE_FILTER_FIELD_UPDATE';
export const ADD_SIMPLE_FILTER_FIELD = 'ADD_SIMPLE_FILTER_FIELD';
export const REMOVE_SIMPLE_FILTER_FIELD = 'REMOVE_SIMPLE_FILTER_FIELD';
export const REMOVE_ALL_SIMPLE_FILTER_FIELDS = 'REMOVE_ALL_SIMPLE_FILTER_FIELDS';
export const UPDATE_FILTER_FIELD_OPTIONS = 'UPDATE_FILTER_FIELD_OPTIONS';
export const LOADING_FILTER_FIELD_OPTIONS = 'LOADING_FILTER_FIELD_OPTIONS';
export const ADD_CROSS_LAYER_FILTER_FIELD = 'QUERYFORM:ADD_CROSS_LAYER_FILTER_FIELD';
export const UPDATE_CROSS_LAYER_FILTER_FIELD = 'QUERYFORM:UPDATE_CROSS_LAYER_FILTER_FIELD';
export const REMOVE_CROSS_LAYER_FILTER_FIELD = 'QUERYFORM:REMOVE_CROSS_LAYER_FILTER_FIELD';
export const UPDATE_CROSS_LAYER_FILTER_FIELD_OPTIONS = 'QUERYFORM:UPDATE_CROSS_LAYER_FILTER_FIELD_OPTIONS';
export const SET_AUTOCOMPLETE_MODE = 'SET_AUTOCOMPLETE_MODE';
export const TOGGLE_AUTOCOMPLETE_MENU = 'TOGGLE_AUTOCOMPLETE_MENU';
export const LOAD_FILTER = 'QUERYFORM:LOAD_FILTER';

import axios from '../libs/ajax';

export function addFilterField(groupId) {
    return {
        type: ADD_FILTER_FIELD,
        groupId: groupId
    };
}

export function addGroupField(groupId, index) {
    return {
        type: ADD_GROUP_FIELD,
        groupId: groupId,
        index: index
    };
}

export function removeFilterField(rowId) {
    return {
        type: REMOVE_FILTER_FIELD,
        rowId: rowId
    };
}

export function toggleMenu(rowId, status) {
    return {
        type: TOGGLE_AUTOCOMPLETE_MENU,
        rowId,
        status
    };
}

export function updateFilterField(rowId, fieldName, fieldValue, fieldType, fieldOptions = {}) {
    return {
        type: UPDATE_FILTER_FIELD,
        rowId: rowId,
        fieldName: fieldName,
        fieldValue: fieldValue,
        fieldType: fieldType,
        fieldOptions
    };
}

export function updateExceptionField(rowId, message) {
    return {
        type: UPDATE_EXCEPTION_FIELD,
        rowId: rowId,
        exceptionMessage: message
    };
}

export function updateLogicCombo(groupId, logic) {
    return {
        type: UPDATE_LOGIC_COMBO,
        groupId: groupId,
        logic: logic
    };
}

export function setAutocompleteMode(status) {
    return {
        type: SET_AUTOCOMPLETE_MODE,
        status
    };
}

export function removeGroupField(groupId) {
    return {
        type: REMOVE_GROUP_FIELD,
        groupId: groupId
    };
}

export function changeCascadingValue(attributes) {
    return {
        type: CHANGE_CASCADING_VALUE,
        attributes: attributes
    };
}

export function expandAttributeFilterPanel(expand) {
    return {
        type: EXPAND_ATTRIBUTE_PANEL,
        expand: expand
    };
}

export function expandSpatialFilterPanel(expand) {
    return {
        type: EXPAND_SPATIAL_PANEL,
        expand: expand
    };
}
export function expandCrossLayerFilterPanel(expand) {
    return {
        type: EXPAND_CROSS_LAYER,
        expand
    };
}
export function setCrossLayerFilterParameter(key, value) {
    return {
        type: SET_CROSS_LAYER_PARAMETER,
        key,
        value
    };
}
export function selectSpatialMethod(method, fieldName) {
    return {
        type: SELECT_SPATIAL_METHOD,
        fieldName: fieldName,
        method: method
    };
}

export function selectViewportSpatialMethod() {
    return {
        type: SELECT_VIEWPORT_SPATIAL_METHOD
    };
}
export function updateGeometrySpatialField(geometry) {
    return {
        type: UPDATE_GEOMETRY,
        geometry
    };
}

export function selectSpatialOperation(operation, fieldName) {
    return {
        type: SELECT_SPATIAL_OPERATION,
        fieldName: fieldName,
        operation: operation
    };
}

export function changeSpatialAttribute(attribute) {
    return {
        type: CHANGE_SPATIAL_ATTRIBUTE,
        attribute
    };
}

export function changeSpatialFilterValue({feature, srsName, collectGeometries, style, options, value} = {}) {
    return {
        type: CHANGE_SPATIAL_FILTER_VALUE,
        value,
        collectGeometries,
        options,
        geometry: feature && feature.geometry,
        feature,
        srsName,
        style
    };
}
export function removeSpatialSelection() {
    return {
        type: REMOVE_SPATIAL_SELECT
    };
}

export function showSpatialSelectionDetails(show) {
    return {
        type: SHOW_SPATIAL_DETAILS,
        show: show
    };
}

export function changeDwithinValue(distance) {
    return {
        type: CHANGE_DWITHIN_VALUE,
        distance: distance
    };
}

/* export function querySearchResponse(response) {
    return {
        type: QUERY_FORM_SEARCH,
        response: response
    };
}
export function wfsLoadError(e) {
    return {
        type: WFS_LOAD_ERROR,
        error: e
    };
}*/

export function search(searchUrl, filterObj) {
    return {
        type: QUERY_FORM_SEARCH,
        searchUrl,
        filterObj
    };
}

export function loadFilter(filter) {
    return {
        type: LOAD_FILTER,
        filter
    };
}
export function query(seachURL, data) {
    return {
        type: SHOW_GENERATED_FILTER,
        data: data
    };
    /* return (dispatch) => {
        return axios.post(seachURL, data).then((response) => {
            dispatch(querySearchResponse(response.data));
        }).catch((e) => {
            dispatch(wfsLoadError(e));
        });
    };*/
}

export function reset(skip) {
    return {
        type: QUERY_FORM_RESET,
        skip
    };
}

export function resetZones() {
    return {
        type: ZONES_RESET
    };
}

export function zoneFilter(searchResult, id) {
    return {
        type: ZONE_FILTER,
        data: searchResult,
        id: id
    };
}

export function zoneSearchError(error, id) {
    return {
        type: ZONE_SEARCH_ERROR,
        error: error,
        id: id
    };
}

export function zoneSearch(active, id) {
    return {
        type: ZONE_SEARCH,
        active: active,
        id: id
    };
}

export function zoneGetValues(url, filter, id) {
    return (dispatch) => {
        return axios.post(url, filter, {
            timeout: 10000,
            headers: {'Accept': 'application/json', 'Content-Type': 'text/plain'}
        }).then((response) => {
            let config = response.data;
            if (typeof config !== "object") {
                try {
                    config = JSON.parse(config);
                } catch (e) {
                    dispatch(zoneSearchError('Search result broken (' + url + ":   " + filter + '): ' + e.message, id));
                }
            }

            dispatch(zoneFilter(config, id));
            dispatch(zoneSearch(false, id));
        }).catch((e) => {
            dispatch(zoneSearchError(e, id));
        });
    };
}

/* export  function openMenu(active, id) {
    return {
        type: OPEN_MENU,
        active: active,
        id: id
    };
}*/

export function zoneChange(id, value) {
    return {
        type: ZONE_CHANGE,
        id: id,
        value: value
    };
}

export function simpleFilterFieldUpdate(id, properties) {
    return {
        type: SIMPLE_FILTER_FIELD_UPDATE,
        id,
        properties
    };
}

export function addSimpleFilterField(properties) {
    return {
        type: ADD_SIMPLE_FILTER_FIELD,
        properties
    };
}

export function removeSimpleFilterField(id) {
    return {
        type: REMOVE_SIMPLE_FILTER_FIELD,
        id
    };
}

export function removeAllSimpleFilterFields() {
    return {
        type: REMOVE_ALL_SIMPLE_FILTER_FIELDS
    };
}
export function addCrossLayerFilterField(groupId) {
    return {
        type: ADD_CROSS_LAYER_FILTER_FIELD,
        rowId: new Date().getTime(),
        groupId
    };
}
export function updateCrossLayerFilterField(rowId, fieldName, fieldValue, fieldType, fieldOptions = {}) {
    return {
        type: UPDATE_CROSS_LAYER_FILTER_FIELD,
        rowId,
        fieldName,
        fieldValue,
        fieldType,
        fieldOptions
    };
}
export function removeCrossLayerFilterField(rowId) {
    return {
        type: REMOVE_CROSS_LAYER_FILTER_FIELD,
        rowId
    };
}
export function resetCrossLayerFilter() {
    return {
        type: RESET_CROSS_LAYER_FILTER
    };
}

export function loadingFilterFieldOptions(status, filterField) {
    return {
        type: LOADING_FILTER_FIELD_OPTIONS,
        status,
        filterField
    };
}

export function updateFilterFieldOptions(filterField, options, valuesCount) {
    return {
        type: UPDATE_FILTER_FIELD_OPTIONS,
        filterField,
        options,
        valuesCount
    };
}

export function updateCrossLayerFilterFieldOptions(filterField, options, valuesCount) {
    return {
        type: UPDATE_CROSS_LAYER_FILTER_FIELD_OPTIONS,
        filterField,
        options,
        valuesCount
    };
}
