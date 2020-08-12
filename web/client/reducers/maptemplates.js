/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CLEAR_MAP_TEMPLATES, SET_TEMPLATES, TOGGLE_FAVOURITE_TEMPLATE, SET_TEMPLATE_DATA, SET_TEMPLATE_LOADING,
    SET_MAP_TEMPLATES_LOADED, SET_ALLOWED_TEMPLATES } from "../actions/maptemplates";
import { get } from 'lodash';
import { set } from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case CLEAR_MAP_TEMPLATES: {
        return {};
    }
    case SET_TEMPLATES: {
        return set('templates', action.templates, state);
    }
    case SET_ALLOWED_TEMPLATES: {
        return set('allowedTemplates', action.templates, state);
    }
    case TOGGLE_FAVOURITE_TEMPLATE: {
        const templates = get(state, 'templates', [])
            .map(template => template.id === action.id ? {...template, favourite: !template.favourite} : template);
        return set('templates', templates, state);
    }
    case SET_TEMPLATE_DATA: {
        const templates = get(state, 'templates', [])
            .map(template => template.id === action.id ? {...template, data: action.data, dataLoaded: true} : template);
        return set('templates', templates, state);
    }
    case SET_TEMPLATE_LOADING: {
        const templates = get(state, 'templates', [])
            .map(template => template.id === action.id ? {...template, loading: action.loadingValue} : template);
        return set('templates', templates, state);
    }
    case SET_MAP_TEMPLATES_LOADED: {
        return set('mapTeplatesLoadError', action.error, set('mapTemplatesLoaded', action.loaded, state));
    }
    default:
        return state;
    }
};
