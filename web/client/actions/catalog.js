/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var API = {
    csw: require('../api/CSW'),
    wms: require('../api/WMS'),
    wmts: require('../api/WMTS')
};

const {addLayer, changeLayerProperties} = require('./layers');

const LayersUtils = require('../utils/LayersUtils');
const ConfigUtils = require('../utils/ConfigUtils');
const {find} = require('lodash');
const {authkeyParamNameSelector} = require('../selectors/catalog');

const RECORD_LIST_LOADED = 'CATALOG:RECORD_LIST_LOADED';
const RESET_CATALOG = 'CATALOG:RESET_CATALOG';
const RECORD_LIST_LOAD_ERROR = 'CATALOG:RECORD_LIST_LOAD_ERROR';
const CHANGE_CATALOG_FORMAT = 'CATALOG:CHANGE_CATALOG_FORMAT';
const ADD_LAYER_ERROR = 'CATALOG:ADD_LAYER_ERROR';
const DESCRIBE_ERROR = "CATALOG:DESCRIBE_ERROR";
const CHANGE_SELECTED_SERVICE = 'CATALOG:CHANGE_SELECTED_SERVICE';
const CHANGE_CATALOG_MODE = 'CATALOG:CHANGE_CATALOG_MODE';
const CHANGE_TITLE = 'CATALOG:CHANGE_TITLE';
const CHANGE_TYPE = 'CATALOG:CHANGE_TYPE';
const CHANGE_AUTOLOAD = 'CATALOG:CHANGE_AUTOLOAD';
const FOCUS_SERVICES_LIST = 'CATALOG:FOCUS_SERVICES_LIST';
const CHANGE_URL = 'CATALOG:CHANGE_URL';
const ADD_CATALOG_SERVICE = 'CATALOG:ADD_CATALOG_SERVICE';
const DELETE_CATALOG_SERVICE = 'CATALOG:DELETE_CATALOG_SERVICE';
const ADD_SERVICE = 'CATALOG:ADD_SERVICE';
const DELETE_SERVICE = 'CATALOG:DELETE_SERVICE';
const SAVING_SERVICE = 'CATALOG:SAVING_SERVICE';
const CATALOG_INITED = 'CATALOG:INIT';
const GET_METADATA_RECORD_BY_ID = 'CATALOG:GET_METADATA_RECORD_BY_ID';

function recordsLoaded(options, result) {
    return {
        type: RECORD_LIST_LOADED,
        searchOptions: options,
        result: result
    };
}
function changeCatalogFormat(format) {
    return {
        type: CHANGE_CATALOG_FORMAT,
        format
    };
}
function savingService(status) {
    return {
        type: SAVING_SERVICE,
        status
    };
}
function changeSelectedService(service) {
    return {
        type: CHANGE_SELECTED_SERVICE,
        service
    };
}
function focusServicesList(status) {
    return {
        type: FOCUS_SERVICES_LIST,
        status
    };
}
function changeCatalogMode(mode, isNew) {
    return {
        type: CHANGE_CATALOG_MODE,
        mode,
        isNew
    };
}
function changeTitle(title) {
    return {
        type: CHANGE_TITLE,
        title
    };
}
function changeAutoload(autoload) {
    return {
        type: CHANGE_AUTOLOAD,
        autoload
    };
}
function changeType(newType) {
    return {
        type: CHANGE_TYPE,
        newType
    };
}
function changeUrl(url) {
    return {
        type: CHANGE_URL,
        url
    };
}
function addService() {
    return {
        type: ADD_SERVICE
    };
}
function addCatalogService(service) {
    return {
        type: ADD_CATALOG_SERVICE,
        service
    };
}
function deleteCatalogService(service) {
    return {
        type: DELETE_CATALOG_SERVICE,
        service
    };
}
function deleteService() {
    return {
        type: DELETE_SERVICE
    };
}

function resetCatalog() {
    return {
        type: RESET_CATALOG
    };
}

function recordsLoadError(e) {
    return {
        type: RECORD_LIST_LOAD_ERROR,
        error: e
    };
}

function catalogInited() {
    return {
        type: CATALOG_INITED
    };
}

function initCatalog(apis = API) {
    return (dispatch) => {
        Object.keys(apis).forEach((name) => {
            apis[name].reset();
        });
        dispatch(catalogInited());
    };
}

function getRecords(format, url, startPosition = 1, maxRecords, filter, options) {
    return (dispatch /* , getState */) => {
        // TODO auth (like) let opts = GeoStoreApi.getAuthOptionsFromState(getState(), {params: {start: 0, limit: 20}, baseURL: geoStoreUrl });
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
function textSearch(format, url, startPosition, maxRecords, text, options) {
    return (dispatch /* , getState */) => {
        // TODO auth (like) let opts = GeoStoreApi.getAuthOptionsFromState(getState(), {params: {start: 0, limit: 20}, baseURL: geoStoreUrl });
        API[format].textSearch(url, startPosition, maxRecords, text, options).then((result) => {
            if (result.error) {
                dispatch(recordsLoadError(result));
            } else {
                dispatch(recordsLoaded({
                    url,
                    startPosition,
                    maxRecords,
                    text
                }, result));
            }
        }).catch((e) => {
            dispatch(recordsLoadError(e));
        });
    };
}
function describeError(layer, error) {
    return {
        type: DESCRIBE_ERROR,
        layer,
        error
    };
}

function addLayerAndDescribe(layer) {
    return (dispatch, getState) => {
        const state = getState();
        const layers = state && state.layers && state.layers.flat;
        const id = LayersUtils.getLayerId(layer, layers || []);
        dispatch(addLayer({...layer, id}));
        if (layer.type === 'wms') {
            // try to describe layer
            return API.wms.describeLayers(layer.url, layer.name).then((results) => {
                if (results) {
                    let description = find(results, (desc) => desc.name === layer.name );
                    if (description && description.owsType === 'WFS') {
                        const filteredUrl = ConfigUtils.filterUrlParams(ConfigUtils.cleanDuplicatedQuestionMarks(description.owsURL), authkeyParamNameSelector(state));
                        dispatch(changeLayerProperties(id, {
                            search: {
                                url: filteredUrl,
                                type: 'wfs'
                            }
                        }));
                    }
                }

            }).catch((e) => dispatch(describeError(layer, e)));
        }

    };
}
function addLayerError(error) {
    return {
        type: ADD_LAYER_ERROR,
        error
    };
}
function getMetadataRecordById() {
    return {
        type: GET_METADATA_RECORD_BY_ID
    };
}

module.exports = {
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    CHANGE_CATALOG_FORMAT, changeCatalogFormat,
    ADD_LAYER_ERROR, addLayerError,
    DESCRIBE_ERROR,
    RESET_CATALOG, resetCatalog,
    CHANGE_SELECTED_SERVICE, changeSelectedService,
    CHANGE_CATALOG_MODE, changeCatalogMode,
    ADD_SERVICE, addService,
    CHANGE_AUTOLOAD, changeAutoload,
    CHANGE_TITLE, changeTitle,
    CHANGE_TYPE, changeType,
    CHANGE_URL, changeUrl,
    SAVING_SERVICE, savingService,
    FOCUS_SERVICES_LIST, focusServicesList,
    ADD_CATALOG_SERVICE, addCatalogService,
    DELETE_CATALOG_SERVICE, deleteCatalogService,
    DELETE_SERVICE, deleteService,
    CATALOG_INITED, initCatalog,
    GET_METADATA_RECORD_BY_ID, getMetadataRecordById,
    getRecords,
    textSearch,
    addLayer: addLayerAndDescribe
};
