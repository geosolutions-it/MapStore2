/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {EDIT_NEW, INSERT, EDIT, DELETE, EDITOR_CHANGE, EDITOR_SETTING_CHANGE, CHANGE_LAYOUT} = require('../actions/widgets');
const set = require('lodash/fp/set');
const {arrayUpsert, arrayDelete} = require('../utils/ImmutableUtils');

const emptyState = {
    dependencies: {
        viewport: "map.bbox"
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
function widgets(state = emptyState, action) {
    switch (action.type) {
        case EDITOR_SETTING_CHANGE: {
            return set(`builder.settings.${action.key}`, action.value, state);
        }
        case EDIT_NEW: {
            return set(`builder.editor`, action.widget,
                set("builder.settings", action.settings || emptyState.settings, state));

        }
        case EDIT: {
            return set(`builder.editor`, action.widget, state);
        }
        case EDITOR_CHANGE: {
            return set(`builder.editor.${action.key}`, action.value, state);
        }
        case INSERT:
           return arrayUpsert(`containers[${action.target}].widgets`, {
               id: action.id,
               ...action.widget
           }, {
               id: action.widget.id || action.id
           }, state);
        case DELETE:
            return arrayDelete(`containers[${action.target}].widgets`, {
                id: action.widget.id
            }, state);
        case CHANGE_LAYOUT: {
            return set(`containers[${action.target}].layout`, action.layout, state);
        }
        default:
            return state;
    }
}

module.exports = widgets;
