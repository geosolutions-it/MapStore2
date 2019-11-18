/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {SEARCH_TEXT_CHANGED, LOADING, CONTEXTS_LIST_LOADED} from '../actions/contextmanager';
import {set} from '../utils/ImmutableUtils';
import {castArray} from 'lodash';

export default (state = {
    searchOptions: {
        params: {
            start: 0,
            limit: 12
        }
    },
    searchText: ''
}, action) => {
    switch (action.type) {
    case SEARCH_TEXT_CHANGED: {
        return set('searchText', action.searchText, state);
    }
    case CONTEXTS_LIST_LOADED: {
        return {
            ...state,
            results: action.results !== "" ? castArray(action.results) : [],
            success: action.success,
            totalCount: action.totalCount,
            searchText: action.searchText,
            searchOptions: action.searchOptions
        };
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
