/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    SET_COOKIE_VISIBILITY,
    SET_PRIVACY_CHOICE
} from '../actions/cookie';

function cookie(state = {}, action) {
    switch (action.type) {
    case SET_COOKIE_VISIBILITY: {
        return Object.assign({}, state, {showCookiePanel: action.status});
    }
    case SET_PRIVACY_CHOICE: {
        return {...state, privacyChoice: action.choice};
    }
    default:
        return state;
    }
}

export default cookie;
