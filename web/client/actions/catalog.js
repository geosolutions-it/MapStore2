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
const {find} = require('lodash');

const RECORD_LIST_LOADED = 'CATALOG:RECORD_LIST_LOADED';
const RESET_CATALOG = 'CATALOG:RESET_CATALOG';
const RECORD_LIST_LOAD_ERROR = 'CATALOG:RECORD_LIST_LOAD_ERROR';
const CHANGE_CATALOG_FORMAT = 'CATALOG:CHANGE_CATALOG_FORMAT';
const ADD_LAYER_ERROR = 'CATALOG:ADD_LAYER_ERROR';
const CHANGE_SELECTED_SERVICE = 'CATALOG:CHANGE_SELECTED_SERVICE';
const CHANGE_CATALOG_MODE = 'CATALOG:CHANGE_CATALOG_MODE';
const ADD_CATALOG_SERVICE = 'CATALOG:ADD_CATALOG_SERVICE';
const CHANGE_NEW_TITLE = 'CATALOG:CHANGE_NEW_TITLE';
const CHANGE_NEW_TYPE = 'CATALOG:CHANGE_NEW_TYPE';
const FOCUS_SERVICES_LIST = 'CATALOG:FOCUS_SERVICES_LIST';
const CHANGE_NEW_URL = 'CATALOG:CHANGE_NEW_URL';
const ADD_SERVICE = 'CATALOG:ADD_SERVICE';
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
function changeNewTitle(title) {
    return {
        type: CHANGE_NEW_TITLE,
        title
    };
}
function changeNewType(newType) {
    return {
        type: CHANGE_NEW_TYPE,
        newType
    };
}
function changeNewUrl(url) {
    return {
        type: CHANGE_NEW_URL,
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
                        dispatch(changeLayerProperties(id, {
                            search: {
                                url: description.owsURL,
                                type: 'wfs'
                            }
                        }));
                    }
                }

            });
        }

    };
}
function addLayerError(error) {
    return {
        type: ADD_LAYER_ERROR,
        error
    };
}

module.exports = {
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    CHANGE_CATALOG_FORMAT, changeCatalogFormat,
    ADD_LAYER_ERROR, addLayerError,
    RESET_CATALOG, resetCatalog,
    CHANGE_SELECTED_SERVICE, changeSelectedService,
    CHANGE_CATALOG_MODE, changeCatalogMode,
    ADD_SERVICE, addService,
    CHANGE_NEW_TITLE, changeNewTitle,
    CHANGE_NEW_TYPE, changeNewType,
    CHANGE_NEW_URL, changeNewUrl,
    FOCUS_SERVICES_LIST, focusServicesList,
    ADD_CATALOG_SERVICE, addCatalogService,
    getRecords,
    textSearch,
    addLayer: addLayerAndDescribe
};
