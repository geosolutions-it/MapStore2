/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { SET_EDITING, SET_EDITOR_AVAILABLE, SHOW_CONNECTIONS, TRIGGER_SAVE_MODAL, TRIGGER_SAVE_AS_MODAL, DASHBOARD_LOADING, DASHBOARD_LOADED, DASHBOARD_SAVED, DASHBOARD_RESET, SAVE_ERROR} = require('../actions/dashboard');
const {INSERT, UPDATE, DELETE} = require('../actions/widgets');
const {set} = require('../utils/ImmutableUtils');
const {castArray} = require('lodash');
function dashboard(state = {
    showConnections: true
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
        return set("resource", action.resource, state);
    }
    case DASHBOARD_RESET: {
        return set("resource", undefined, state);
    }
    case SAVE_ERROR: {
        return set('saveErrors', castArray(action.error), state);
    }
    case DASHBOARD_SAVED: {
        return set('saveErrors', undefined, state);
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
module.exports = dashboard;
