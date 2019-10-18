/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SET_CURRENT_CONTEXT, LOADING, SET_RESOURCE } from "../actions/context";
import {set} from '../utils/ImmutableUtils';
export default (state = {}, action) => {
    switch (action.type) {
    case SET_CURRENT_CONTEXT: {
        return set('currentContext', action.context, state);
    }
    case SET_RESOURCE: {
        return set('resource', action.resource, state);
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
