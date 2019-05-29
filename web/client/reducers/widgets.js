/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { EDIT_NEW, INSERT, EDIT, UPDATE_PROPERTY, DELETE, EDITOR_CHANGE, EDITOR_SETTING_CHANGE, CHANGE_LAYOUT, CLEAR_WIDGETS, DEFAULT_TARGET,
ADD_DEPENDENCY, REMOVE_DEPENDENCY, LOAD_DEPENDENCIES, RESET_DEPENDENCIES} = require('../actions/widgets');
const {
    MAP_CONFIG_LOADED
} = require('../actions/config');
const {
    DASHBOARD_LOADED,
    DASHBOARD_RESET
} = require('../actions/dashboard');

const set = require('lodash/fp/set');
const { get, find} = require('lodash');
const {arrayUpsert, arrayDelete} = require('../utils/ImmutableUtils');

const emptyState = {
    dependencies: {
        viewport: "map.bbox",
        center: "map.center",
        zoom: "map.zoom"
    },
    containers: {
        floating: {
            widgets: []
        }
    },
    builder: {
        settings: {
            step: 0
        }
    }
};
/**
 * Manages the state of the widgets
 * @prop {array} widgets version identifier
 *
 * @example
 *{
 *  widgets: {
 *    containers: {
 *       floating: {
 *          widgets: [{
 *              //...
 *          }]
 *       }
 *    }
 *  }
 *}
 * @memberof reducers
 */
function widgetsReducer(state = emptyState, action) {
    switch (action.type) {
        case EDITOR_SETTING_CHANGE: {
            return set(`builder.settings.${action.key}`, action.value, state);
        }
        case EDIT_NEW: {
            return set(`builder.editor`, action.widget,
                set("builder.settings", action.settings || emptyState.settings, state));
        }
        case EDIT: {
            return set(`builder.editor`, {
                ...action.widget,
                // for backward compatibility widgets without widgetType are charts
                widgetType: action.widget && action.widget.widgetType || 'chart'
            }, set("builder.settings.step",
                    (action.widget && action.widget.widgetType || 'chart') === 'chart'
                    ? 1
                    : 0
                , state));
        }
        case EDITOR_CHANGE: {
            return set(`builder.editor.${action.key}`, action.value, state);
        }
        case INSERT:
            let tempState = arrayUpsert(`containers[${action.target}].widgets`, {
                id: action.id,
                ...action.widget,
                dataGrid: action.id && {y: 0, x: 0, w: 1, h: 1}
            }, {
                id: action.widget.id || action.id
            }, state);

            return tempState;
        case UPDATE_PROPERTY:
            return arrayUpsert(`containers[${action.target}].widgets`,
                // update the widget setting the value to the existing object
                set(
                    action.key,
                    action.value,
                    find(get(state, `containers[${action.target}].widgets`), {
                        id: action.id
                    }),
                ), {
                    id: action.id
                }, state);
        case DELETE:
            return arrayDelete(`containers[${action.target}].widgets`, {
                id: action.widget.id
            }, state);
        case DASHBOARD_LOADED:
            const { data } = action;
            return set(`containers[${DEFAULT_TARGET}]`, {
                ...data
            }, state);
        case MAP_CONFIG_LOADED:
            const { widgetsConfig } = (action.config || {});
            return set(`containers[${DEFAULT_TARGET}]`, {
                ...widgetsConfig
            }, state);
        case CHANGE_LAYOUT: {
            return set(`containers[${action.target}].layout`, action.layout)(set(`containers[${action.target}].layouts`, action.allLayouts, state));
        }
        case CLEAR_WIDGETS:
        case DASHBOARD_RESET: {
            return set(`containers[${DEFAULT_TARGET}]`, emptyState.containers[DEFAULT_TARGET], state);
        }
        case ADD_DEPENDENCY: {
            const {key, value} = action;
            return set(`dependencies[${key}]`, value, state);
        }
        case REMOVE_DEPENDENCY: {
            const {key} = action;
            return set(`dependencies[${key}]`, null, state);
        }
        case LOAD_DEPENDENCIES:
            const {dependencies} = action;
            return set(`dependencies`, dependencies, state);
        case RESET_DEPENDENCIES:
            return set('dependencies', emptyState.dependencies, state);
        default:
            return state;
    }
}

module.exports = widgetsReducer;
