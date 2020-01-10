/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {SET_CREATION_STEP, MAP_VIEWER_LOADED, SHOW_MAP_VIEWER_RELOAD_CONFIRM,
    SET_RESOURCE, IS_VALID_CONTEXT_NAME, CONTEXT_NAME_CHECKED, CLEAR_CONTEXT_CREATOR, CHANGE_ATTRIBUTE, LOADING} from "../actions/contextcreator";
import {set} from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case SET_CREATION_STEP: {
        return set('stepId', action.stepId, state);
    }
    case MAP_VIEWER_LOADED: {
        return set('mapViewerLoaded', action.status, state);
    }
    case SHOW_MAP_VIEWER_RELOAD_CONFIRM: {
        return set('showReloadConfirm', action.show, state);
    }
    case SET_RESOURCE: {
        const {data, ...resource} = action.resource;
        return set('newContext', data || {}, set('resource', resource, state));
    }
    case IS_VALID_CONTEXT_NAME: {
        return set('isValidContextName', action.valid, state);
    }
    case CONTEXT_NAME_CHECKED: {
        return set('contextNameChecked', action.checked, state);
    }
    case CLEAR_CONTEXT_CREATOR: {
        return {};
    }
    case CHANGE_ATTRIBUTE: {
        return action.key === 'name' ?
            set('resource.name', action.value, state) :
            set(`newContext.${action.key}`, action.value, state);
    }
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
};
