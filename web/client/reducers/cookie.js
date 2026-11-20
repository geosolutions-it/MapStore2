/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    SET_COOKIE_VISIBILITY,
    SET_PRIVACY_CHOICE,
    ADD_PRIVACY_ACCESS,
    REMOVE_PRIVACY_ACCESS
} from '../actions/cookie';

function cookie(state = {}, action) {
    switch (action.type) {
    case SET_COOKIE_VISIBILITY: {
        return Object.assign({}, state, {showCookiePanel: action.status});
    }
    case SET_PRIVACY_CHOICE: {
        return {...state, privacyChoice: action.choice};
    }
    case ADD_PRIVACY_ACCESS: {
        const accesses = state.privacyAccesses || [];
        return accesses.includes(action.id) ? state : {...state, privacyAccesses: [...accesses, action.id]};
    }
    case REMOVE_PRIVACY_ACCESS: {
        return {...state, privacyAccesses: (state.privacyAccesses || []).filter(id => id !== action.id)};
    }
    default:
        return state;
    }
}

export default cookie;
