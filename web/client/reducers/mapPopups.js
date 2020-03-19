/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ADD_MAP_POPUP, REMOVE_MAP_POPUP, CLEAN_MAP_POPUPS} from '../actions/mapPopups';
import {arrayDelete} from '../utils/ImmutableUtils';

const initialState = {popups: []};
export default function(state = initialState, action) {
    switch (action.type) {
    case ADD_MAP_POPUP: {
        const {popup, single} = action;
        return {...state, popups: single && [popup] || (state.popups || []).concat([popup])};
    }
    case REMOVE_MAP_POPUP: {
        const {id} = action;
        return arrayDelete("popups", {id}, state);
    }
    case CLEAN_MAP_POPUPS: {
        return {...state, popups: []};
    }
    default:
        return state;
    }
}
