/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {SET_CREATION_STEP, SET_RESOURCE, CLEAR_CONTEXT_CREATOR, CHANGE_ATTRIBUTE} from "../actions/contextcreator";
import {set} from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case SET_CREATION_STEP: {
        return set('stepId', action.stepId, state);
    }
    case SET_RESOURCE: {
        return set('newContext', action.resource && action.resource.data || {}, set('resource', action.resource, state));
    }
    case CLEAR_CONTEXT_CREATOR: {
        return {};
    }
    case CHANGE_ATTRIBUTE: {
        return action.key === 'name' ?
            set('resource.name', action.value, state) :
            set(`newContext.${action.key}`, action.value, state);
    }
    default:
        return state;
    }
};
