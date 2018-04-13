/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { SET_EDITING, SET_EDITOR_AVAILABLE, SHOW_CONNECTIONS, TRIGGER_SAVE_MODAL, DASHBOARD_LOADED} = require('../actions/dashboard');
const {INSERT, UPDATE, DELETE} = require('../actions/widgets');
const {set} = require('../utils/ImmutableUtils');
function dashboard(state = {}, action) {
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
            return set("showSaveModal", action.show, state);
        case DASHBOARD_LOADED: {
            return set("metadata", action.metadata, state);
        }
        default:
            return state;
    }
}
module.exports = dashboard;
