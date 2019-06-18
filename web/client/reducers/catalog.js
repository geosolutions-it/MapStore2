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
    CHANGE_TITLE,
    CHANGE_TEXT,
    CHANGE_AUTOLOAD,
    CHANGE_TYPE,
    CHANGE_URL,
    FOCUS_SERVICES_LIST,
    ADD_CATALOG_SERVICE,
    DELETE_CATALOG_SERVICE,
    SAVING_SERVICE,
    TOGGLE_THUMBNAIL,
    CHANGE_METADATA_TEMPLATE,
    TOGGLE_TEMPLATE,
    TOGGLE_ADVANCED_SETTINGS
} = require('../actions/catalog');
const {
    MAP_CONFIG_LOADED
} = require('../actions/config');
const { set } = require('../utils/ImmutableUtils');

const {isNil} = require('lodash');
const assign = require('object-assign');
const emptyService = {
    url: "",
    type: "wms",
    title: "",
    isNew: true,
    autoload: false,
    showAdvancedSettings: false,
    showTemplate: false,
    hideThumbnail: false,
    metadataTemplate: "<p>${description}</p>"
};

function catalog(state = {
    "default": {
        services: {},
        selectedService: "",
        newService: {}
    },
    services: {},
    selectedService: "",
    newService: {}
}, action) {
    switch (action.type) {
    case SAVING_SERVICE:
        return assign({}, state, {
            saving: action.status
        });
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
            newService: action.isNew ? emptyService : assign({}, state.services && state.services[state.selectedService || ""] || {}, {oldService: state.selectedService || ""}),
            mode: action.mode,
            result: null,
            loadingError: null,
            layerError: null});
    case MAP_CONFIG_LOADED: {
        if (state && !isNil(state.default)) {
            if (action.config && !isNil(action.config.catalogServices)) {
                return assign({}, state, {services: action.config.catalogServices.services, selectedService: action.config.catalogServices.selectedService });
            }
            return assign({}, state, {services: state.default.services, selectedService: state.default.selectedService });
        }
        return state;
    }
    case FOCUS_SERVICES_LIST:
        return set("openCatalogServiceList", action.status, state);
    case CHANGE_TEXT:
        return set("searchOptions.text", action.text, state);
    case CHANGE_TITLE:
        return set("newService.title", action.title, state);
    case CHANGE_URL:
        return set("newService.url", action.url, state);
    case CHANGE_AUTOLOAD:
        return set("newService.autoload", action.autoload, state);
    case CHANGE_TYPE: {
        const type = action.newType.toLowerCase();
        let templateOptions = {};
        if (type !== "csw") {
            // reset the template options
            templateOptions = {showTemplate: false, metadataTemplate: ""};
        }
        return assign({}, state, {newService: assign({}, state.newService, {type, ...templateOptions})});
    }
    case ADD_CATALOG_SERVICE: {
        let newServices;
        if (action.service.isNew) {
            let service = assign({}, action.service);
            delete service.isNew;
            newServices = assign({}, state.services, {[action.service.title]: service});
        } else {
            let services = assign({}, state.services);
            delete services[action.service.oldService];
            newServices = assign({}, services, {[action.service.title]: action.service});
        }
        return action.service.title !== "" && action.service.url !== "" ?
            assign({}, state, {
                services: newServices,
                selectedService: action.service.title,
                mode: "view",
                result: null,
                loadingError: null,
                searchOptions: assign({}, state.searchOptions, {
                    text: ""
                }),
                layerError: null
            }) : state;
    }
    case CHANGE_SELECTED_SERVICE: {
        if (action.service !== state.selectedService) {
            return assign({}, state, {
                selectedService: action.service,
                result: null,
                loadingError: null,
                layerError: null
            });
        }
        return state;
    }
    case DELETE_CATALOG_SERVICE: {
        let newServices;
        let selectedService = "";
        newServices = assign({}, state.services);
        delete newServices[action.service];
        if (Object.keys(newServices).length) {
            selectedService = newServices[Object.keys(newServices)[0]].title;
        }
        return assign({}, state, {
            services: newServices,
            selectedService,
            mode: "view",
            result: null,
            loadingError: null,
            layerError: null
        });
    }
    case TOGGLE_THUMBNAIL: {
        return set("newService.hideThumbnail", !state.newService.hideThumbnail, state);
    }
    case CHANGE_METADATA_TEMPLATE: {
        return set("newService.metadataTemplate", action.metadataTemplate, state);
    }
    case TOGGLE_TEMPLATE: {
        let newState = set("newService.showTemplate", !state.newService.showTemplate, state);
        if (newState.newService.showTemplate) {
            newState = set("newService.metadataTemplate", newState.newService.metadataTemplate || "<p>${description}</p>", newState);
        }
        return newState;
    }
    case TOGGLE_ADVANCED_SETTINGS: {
        return set("newService.showAdvancedSettings", !state.newService.showAdvancedSettings, state);
    }
    default:
        return state;
    }
}

module.exports = catalog;
