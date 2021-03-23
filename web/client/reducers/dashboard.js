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
    DASHBOARD_CATALOG_MODE
} from '../actions/dashboard';

import { INSERT, UPDATE, DELETE } from '../actions/widgets';
import { set } from '../utils/ImmutableUtils';
import { castArray } from 'lodash';

function dashboard(state = {
    showConnections: true,
    services: null
}, action) {
    switch (action.type) {
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
        return set('originalData', undefined, set("resource", undefined, state));
    }
    case SAVE_ERROR: {
        return set('saveErrors', castArray(action.error), state);
    }
    case DASHBOARD_SAVED: {
        return set('saveErrors', undefined, state);
    }

    case DASHBOARD_SET_SELECTED_SERVICE: {
        return set('selectedService', action.service, state);
    }

    case DASHBOARD_UPDATE_SERVICES: {
        return set('services', action.services, state);
    }

    case DASHBOARD_CATALOG_MODE: {
        return  {
            ...state,
            mode: action.mode,
            isNew: action.isNew
        };
    }

    case DASHBOARD_ADD_NEW_SERVICE: {
        const { services, service } = action;
        const selectedService = service;
        return  {
            ...state,
            services,
            selectedService,
            mode: "view"
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
