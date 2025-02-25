/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import csw from '../api/CSW';
import wms from '../api/WMS';
import wmts from '../api/WMTS';
import backgrounds from '../api/mapBackground';
var API = {
    csw,
    wms,
    wmts,
    backgrounds
};

export const ADD_LAYERS_FROM_CATALOGS = 'CATALOG:ADD_LAYERS_FROM_CATALOGS';
export const ADD_LAYER_AND_DESCRIBE = 'CATALOG:ADD_LAYER_AND_DESCRIBE';
export const TEXT_SEARCH = 'CATALOG:TEXT_SEARCH';
export const RECORD_LIST_LOADED = 'CATALOG:RECORD_LIST_LOADED';
export const RESET_CATALOG = 'CATALOG:RESET_CATALOG';
export const CATALOG_CLOSE = 'CATALOG:CATALOG_CLOSE';
export const RECORD_LIST_LOAD_ERROR = 'CATALOG:RECORD_LIST_LOAD_ERROR';
export const CHANGE_CATALOG_FORMAT = 'CATALOG:CHANGE_CATALOG_FORMAT';
export const ADD_LAYER_ERROR = 'CATALOG:ADD_LAYER_ERROR';
export const DESCRIBE_ERROR = "CATALOG:DESCRIBE_ERROR";
export const CHANGE_SELECTED_SERVICE = 'CATALOG:CHANGE_SELECTED_SERVICE';
export const CHANGE_CATALOG_MODE = 'CATALOG:CHANGE_CATALOG_MODE';
export const CHANGE_METADATA_TEMPLATE = 'CATALOG:CHANGE_METADATA_TEMPLATE';
export const CHANGE_TITLE = 'CATALOG:CHANGE_TITLE';
export const CHANGE_TEXT = 'CATALOG:CHANGE_TEXT';
export const CHANGE_TYPE = 'CATALOG:CHANGE_TYPE';
export const CHANGE_SERVICE_PROPERTY = 'CATALOG:CHANGE_SERVICE_PROPERTY';
export const CHANGE_SERVICE_FORMAT = 'CATALOG:CHANGE_SERVICE_FORMAT';
export const FOCUS_SERVICES_LIST = 'CATALOG:FOCUS_SERVICES_LIST';
export const CHANGE_URL = 'CATALOG:CHANGE_URL';
export const ADD_CATALOG_SERVICE = 'CATALOG:ADD_CATALOG_SERVICE';
export const UPDATE_CATALOG_SERVICES = 'CATALOG:UPDATE_CATALOG_SERVICES';
export const DELETE_CATALOG_SERVICE = 'CATALOG:DELETE_CATALOG_SERVICE';
export const ADD_SERVICE = 'CATALOG:ADD_SERVICE';
export const DELETE_SERVICE = 'CATALOG:DELETE_SERVICE';
export const SAVING_SERVICE = 'CATALOG:SAVING_SERVICE';
export const CATALOG_INITED = 'CATALOG:INIT';
export const GET_METADATA_RECORD_BY_ID = 'CATALOG:GET_METADATA_RECORD_BY_ID';
export const SET_LOADING = 'CATALOG:SET_LOADING';
export const SHOW_FORMAT_ERROR = 'CATALOG:SHOW_FORMAT_ERROR';
export const TOGGLE_TEMPLATE = 'CATALOG:TOGGLE_TEMPLATE';
export const TOGGLE_THUMBNAIL = 'CATALOG:TOGGLE_THUMBNAIL';
export const TOGGLE_ADVANCED_SETTINGS = 'CATALOG:TOGGLE_ADVANCED_SETTINGS';
export const FORMAT_OPTIONS_FETCH = 'CATALOG:FORMAT_OPTIONS_FETCH';
export const FORMAT_OPTIONS_LOADING = 'CATALOG:FORMAT_OPTIONS_LOADING';
export const SET_FORMAT_OPTIONS = 'CATALOG:SET_FORMAT_OPTIONS';
export const NEW_SERVICE_STATUS = 'CATALOG:NEW_SERVICE_STATUS';
export const INIT_PLUGIN = 'CATALOG:INIT_PLUGIN';

/**
 * Adds a list of layers from the given catalogs to the map
 * @param {string[]} layers list with workspace to be added in the map
 * @param {string[] | object[] } sources catalog names related to each layer
 * @param {object[]} options related to each layer. Can be used to overwrite default configuration or parameters
 */
export function addLayersMapViewerUrl(layers = [], sources = [], options = []) {
    return {
        type: ADD_LAYERS_FROM_CATALOGS,
        layers,
        sources,
        options
    };
}
/**
 * Searches for a layer in the related catalog
 * @param {object} params
 * @param {string} params.format format of the catalog
 * @param {string} params.url catalog url
 * @param {number} params.startPosition initial position to start search, default 1
 * @param {number} params.maxRecords max number of records returned
 * @param {string} params.text layer name
 * @param {object} params.options layer name
 */
export function textSearch({format, url, startPosition, maxRecords, text, options = {}} = {}) {
    return {
        type: TEXT_SEARCH,
        format,
        url,
        startPosition,
        maxRecords,
        text,
        options
    };
}
export function recordsLoaded(options, result) {
    return {
        type: RECORD_LIST_LOADED,
        searchOptions: options,
        result: result
    };
}
export function changeCatalogFormat(format) {
    return {
        type: CHANGE_CATALOG_FORMAT,
        format
    };
}
export function savingService(status) {
    return {
        type: SAVING_SERVICE,
        status
    };
}
export function setLoading(loading = false) {
    return {
        type: SET_LOADING,
        loading
    };
}
export function changeSelectedService(service) {
    return {
        type: CHANGE_SELECTED_SERVICE,
        service
    };
}
export function focusServicesList(status) {
    return {
        type: FOCUS_SERVICES_LIST,
        status
    };
}
export function changeCatalogMode(mode, isNew) {
    return {
        type: CHANGE_CATALOG_MODE,
        mode,
        isNew
    };
}
export function changeTitle(title) {
    return {
        type: CHANGE_TITLE,
        title
    };
}
export function changeText(text) {
    return {
        type: CHANGE_TEXT,
        text
    };
}

export function changeServiceProperty(property, value) {
    return {
        type: CHANGE_SERVICE_PROPERTY,
        property,
        value
    };
}
export function changeServiceFormat(format) {
    return {
        type: CHANGE_SERVICE_FORMAT,
        format
    };
}
export function changeType(newType) {
    return {
        type: CHANGE_TYPE,
        newType
    };
}
export function changeUrl(url) {
    return {
        type: CHANGE_URL,
        url
    };
}
export function addService(options) {
    return {
        type: ADD_SERVICE,
        options
    };
}
export function addCatalogService(service) {
    return {
        type: ADD_CATALOG_SERVICE,
        service
    };
}
/**
 *
 * @param {object[]} services list of services to full replace catalog ones
 */
export function updateCatalogServices(services) {
    return {
        type: UPDATE_CATALOG_SERVICES,
        services
    };
}
export function deleteCatalogService(service) {
    return {
        type: DELETE_CATALOG_SERVICE,
        service
    };
}
export function deleteService() {
    return {
        type: DELETE_SERVICE
    };
}

export function resetCatalog() {
    return {
        type: RESET_CATALOG
    };
}

export function recordsLoadError(e) {
    return {
        type: RECORD_LIST_LOAD_ERROR,
        error: e
    };
}

export function catalogInited() {
    return {
        type: CATALOG_INITED
    };
}

export function initCatalog(apis = API) {
    return (dispatch) => {
        Object.keys(apis).forEach((name) => {
            apis[name].reset();
        });
        dispatch(catalogInited());
    };
}

export function catalogClose() {
    return {
        type: CATALOG_CLOSE
    };
}

export function getRecords(format, url, startPosition = 1, maxRecords, filter, options) {
    return (dispatch) => {
        // TODO auth (like) let opts = GeoStoreApi.getAuthOptionsFromState(getState(), {params: {start: 0, limit: 20}, baseURL: geoStoreUrl });
        dispatch(setLoading(true));
        API[format].getRecords(url, startPosition, maxRecords, filter, options).then((result) => {
            if (result.error) {
                dispatch(recordsLoadError(result));
            } else {
                dispatch(recordsLoaded({
                    url,
                    startPosition,
                    maxRecords,
                    filter
                }, result));
            }
        }).catch((e) => {
            dispatch(recordsLoadError(e));
        });
    };
}

export function describeError(layer, error) {
    return {
        type: DESCRIBE_ERROR,
        layer,
        error
    };
}

export function addLayerAndDescribe(layer, {zoomToLayer = false} = {}) {
    return {
        type: ADD_LAYER_AND_DESCRIBE,
        layer,
        zoomToLayer
    };
}

export const addLayer = addLayerAndDescribe;
export function addLayerError(error) {
    return {
        type: ADD_LAYER_ERROR,
        error
    };
}
export function getMetadataRecordById(metadataOptions) {
    return {
        type: GET_METADATA_RECORD_BY_ID,
        metadataOptions
    };
}
export const changeMetadataTemplate = (metadataTemplate) => ({type: CHANGE_METADATA_TEMPLATE, metadataTemplate});
export const toggleAdvancedSettings = () => ({type: TOGGLE_ADVANCED_SETTINGS});
export const toggleTemplate = () => ({type: TOGGLE_TEMPLATE});
export const toggleThumbnail = () => ({type: TOGGLE_THUMBNAIL});
export const formatOptionsFetch = (url, force) => ({type: FORMAT_OPTIONS_FETCH, url, force});
export const formatsLoading = (loading) => ({type: FORMAT_OPTIONS_LOADING, loading});
export const setSupportedFormats = (formats, url) => ({type: SET_FORMAT_OPTIONS, formats, url});
export const showFormatError = (status) => ({type: SHOW_FORMAT_ERROR, status});

import {error} from './notifications';

export function recordsNotFound(records = "") {
    return error({
        title: "catalog.notification.errorTitle",
        message: "catalog.notification.errorSearchingRecords",
        values: {records}
    });
}
export const setNewServiceStatus = (status) => {
    return {
        type: NEW_SERVICE_STATUS,
        status
    };
};

export const initPlugin = (options) => {
    return {
        type: INIT_PLUGIN,
        options
    };
};
