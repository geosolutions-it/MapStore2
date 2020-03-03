/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SHOW_NEW_MAP_DIALOG,
    SET_NEW_MAP_CONTEXT,
    HAS_CONTEXTS,
    LOADING
} from '../actions/createnewmap';

import {set} from '../utils/ImmutableUtils';

export default (state = {}, action) => {
    switch (action.type) {
    case SHOW_NEW_MAP_DIALOG: {
        return set('showNewMapDialog', action.show, state);
    }
    case SET_NEW_MAP_CONTEXT: {
        return set('newMapContext', action.context, state);
    }
    case HAS_CONTEXTS: {
        return set('hasContexts', action.value, state);
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
