/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import {
    SET_EDITING,
    SET_EDITOR_AVAILABLE,
    SHOW_CONNECTIONS,
    TRIGGER_SAVE_MODAL,
    TRIGGER_SAVE_AS_MODAL,
    DASHBOARD_LOADING,
    DASHBOARD_LOADED,
    DASHBOARD_SAVED,
    DASHBOARD_RESET,
    SAVE_ERROR,
    DASHBOARD_SET_SELECTED_SERVICE,
    DASHBOARD_UPDATE_SERVICES,
    DASHBOARD_ADD_NEW_SERVICE,
    DASHBOARD_CATALOG_MODE,
    DASHBOARD_DELETE_SERVICE,
    DASHBOARD_SAVE_SERVICE_LOADING,
    INIT_PLUGIN
} from '../actions/dashboard';

import { INSERT, UPDATE, DELETE } from '../actions/widgets';
import { set } from '../utils/ImmutableUtils';
import { castArray } from 'lodash';
import {
    SET_CREDENTIALS,
    CLEAR_SECURITY
} from '../actions/security';

function dashboard(state = {
    showConnections: true,
    services: null,
    saveServiceLoading: false
}, action) {
    switch (action.type) {
    case INIT_PLUGIN: {
        return { ...state, ...action?.options };
    }
    case SET_EDITOR_AVAILABLE: {
        return set("editor.available", action.available, state);
    }
    case SET_EDITING: {
        return set("editing", action.editing, state);
    }
    case UPDATE:
    case INSERT:
    case DELETE:
        return set("editing", action.editing, state);
    case SHOW_CONNECTIONS:
        return set("showConnections", action.show, state);
    case TRIGGER_SAVE_MODAL:
        return set("showSaveModal", action.show, set('saveErrors', undefined, state));
    case TRIGGER_SAVE_AS_MODAL:
        return set("showSaveAsModal", action.show, set('saveErrors', undefined, state));
    case DASHBOARD_LOADED: {
        return {
            ...state,
            originalData: action.data,
            resource: action.resource,
            services: action.data?.catalogs
        };
    }
    case DASHBOARD_RESET: {
        return {
            ...state,
            originalData: undefined,
            resource: undefined,
            mode: "view",
            services: undefined
        };
    }
    case SAVE_ERROR: {
        return set('saveErrors', castArray(action.error), state);
    }
    case DASHBOARD_SAVED: {
        return set('saveErrors', undefined, state);
    }

    case DASHBOARD_SET_SELECTED_SERVICE: {
        return  {
            ...state,
            services: state.services || action.services,
            selectedService: action.service?.key || "",
            protectedId: action.service?.protectedId
        };
    }
    case SET_CREDENTIALS: {
        let protectedId = action.protectedService.protectedId;
        return {
            ...state,
            protectedId
        };
    }
    case CLEAR_SECURITY: {
        return {
            ...state,
            protectedId: undefined
        };
    }
    case DASHBOARD_UPDATE_SERVICES: {
        return set('services', action.services, state);
    }

    case DASHBOARD_CATALOG_MODE: {
        return  {
            ...state,
            mode: action.mode,
            isNew: action.isNew,
            saveServiceLoading: false
        };
    }

    case DASHBOARD_SAVE_SERVICE_LOADING: {
        return {
            ...state,
            saveServiceLoading: action.loading
        };
    }

    case DASHBOARD_ADD_NEW_SERVICE: {
        let { services, service } = action;
        service.isNew = false;
        service.showAdvancedSettings = false;
        delete service.old;
        services[service.key] = service;
        const selectedService = service.key;
        return  {
            ...state,
            services,
            selectedService,
            mode: "view"
        };
    }

    case DASHBOARD_DELETE_SERVICE: {
        const services = action.services;
        const deletedService = action.service;
        if (services[deletedService.key] || services[deletedService.old?.key]) {
            delete services[deletedService.key] || services[deletedService.old?.key];
        }
        const selectedService = Object.keys(services)[0] || "";
        return {
            ...state,
            services,
            mode: "view",
            selectedService
        };
    }
    case DASHBOARD_LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
}
export default dashboard;
