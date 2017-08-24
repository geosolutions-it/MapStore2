/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    RECORD_LIST_LOADED,
    RECORD_LIST_LOAD_ERROR,
    CHANGE_CATALOG_FORMAT,
    ADD_LAYER_ERROR,
    RESET_CATALOG,
    CHANGE_SELECTED_SERVICE,
    CHANGE_CATALOG_MODE,
    CHANGE_NEW_TITLE,
    CHANGE_NEW_TYPE,
    CHANGE_NEW_URL,
    ADD_CATALOG_SERVICE
} = require('../actions/catalog');
const assign = require('object-assign');
const emptyService = {
    title: "",
    type: "wms",
    url: ""
};

function catalog(state = {
    newService: emptyService
}, action) {
    switch (action.type) {
    case RECORD_LIST_LOADED:
        return assign({}, state, {
            result: action.result,
            searchOptions: action.searchOptions,
            loadingError: null,
            layerError: null
        });
    case RESET_CATALOG:
        return assign({}, state, {
            result: null,
            loadingError: null,
            searchOptions: null/*
                MV: saida added but maybe they are unused,
                at least action.format doesnt exist in the action,

                format: action.format,
                layerError: null*/
        });
    case RECORD_LIST_LOAD_ERROR:
        return assign({}, state, {
            result: null,
            searchOptions: null,
            loadingError: action.error,
            layerError: null
        });
    case CHANGE_CATALOG_FORMAT:
        return assign({}, state, {
            result: null,
            loadingError: null,
            format: action.format,
            layerError: null
        });
    case ADD_LAYER_ERROR:
        return assign({}, state, {layerError: action.error});
    case CHANGE_CATALOG_MODE:
        return assign({}, state, {
            newService: emptyService,
            mode: action.mode,
            result: null,
            loadingError: null,
            layerError: null});
    case CHANGE_NEW_TITLE:
        return assign({}, state, {newService: assign({}, state.newService, {title: action.title})});
    case CHANGE_NEW_URL:
        return assign({}, state, {newService: assign({}, state.newService, {url: action.url})});
    case CHANGE_NEW_TYPE:
        return assign({}, state, {newService: assign({}, state.newService, {type: action.newType.toLowerCase()})});
    case ADD_CATALOG_SERVICE:
        let newServices = assign({}, state.services, {[action.service.title]: action.service});
        return action.service.title !== "" && action.service.url !== "" ?
            assign({}, state, {
                services: newServices,
                selectedService: action.service.title,
                mode: "view",
                result: null,
                loadingError: null,
                layerError: null
            }) : state;
    case CHANGE_SELECTED_SERVICE:
        return assign({}, state, {
            selectedService: action.service,
            result: null,
            loadingError: null,
            layerError: null
        });
    default:
        return state;
    }
}

module.exports = catalog;
