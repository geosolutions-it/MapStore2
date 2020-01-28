/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SET_CURRENT_CONTEXT, LOADING, SET_RESOURCE, CLEAR_CONTEXT, UPDATE_USER_PLUGIN, TOGGLE_FAVOURITE_TEMPLATE, SET_TEMPLATE_DATA,
    SET_TEMPLATE_LOADING, SET_MAP_TEMPLATES_LOADED } from "../actions/context";
import { find, get } from 'lodash';
import {set, arrayUpdate} from '../utils/ImmutableUtils';

/**
 * Reducers for context page and configs.
 * Example:
 * ```
 * {
 * currentContext: {// the context object
 *     plugins: {
 *         desktop: [...]
 *     },
 *     resource: {} // the original (geostore) resource, with canEdit, canWrite properties, id etc...
 *     loading: true|false
 *     loadingFlags: {
 *         saving: true|false // loading flags, to store more specific information about what is loading
 *     }
 * }
 * }
 * ```
 * @name context
 * @memberof reducers
 */
export default (state = {}, action) => {
    switch (action.type) {
    case SET_CURRENT_CONTEXT: {
        return set('currentContext', action.context, state);
    }
    case SET_RESOURCE: {
        return set('resource', action.resource, state);
    }
    case CLEAR_CONTEXT: {
        return {};
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    case UPDATE_USER_PLUGIN: {
        const plugin = find(get(state, 'currentContext.userPlugins', []), {name: action.name});
        if (plugin) {
            return arrayUpdate('currentContext.userPlugins', { ...plugin, ...action.values}, {name: action.name}, state);
        }
        return state;
    }
    case TOGGLE_FAVOURITE_TEMPLATE: {
        const templates = get(state, 'currentContext.templates', [])
            .map(template => template.id === action.id ? {...template, favourite: !template.favourite} : template);
        return set('currentContext.templates', templates, state);
    }
    case SET_TEMPLATE_DATA: {
        const templates = get(state, 'currentContext.templates', [])
            .map(template => template.id === action.id ? {...template, data: action.data, dataLoaded: true} : template);
        return set('currentContext.templates', templates, state);
    }
    case SET_TEMPLATE_LOADING: {
        const templates = get(state, 'currentContext.templates', [])
            .map(template => template.id === action.id ? {...template, loading: action.loadingValue} : template);
        return set('currentContext.templates', templates, state);
    }
    case SET_MAP_TEMPLATES_LOADED: {
        return set('mapTeplatesLoadError', action.error, set('mapTemplatesLoaded', action.loaded, state));
    }
    default:
        return state;
    }
};
