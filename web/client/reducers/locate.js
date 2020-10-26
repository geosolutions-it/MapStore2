/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CHANGE_LOCATE_STATE, LOCATE_ERROR } from '../actions/locate';

import assign from 'object-assign';

function locate(state = {state: "DISABLED"}, action) {
    switch (action.type) {
    case CHANGE_LOCATE_STATE:
        return assign({}, state, {
            state: action.state
        });
    case LOCATE_ERROR:
        return assign({}, state, {
            error: action.error
        });
    default:
        return state;
    }

}

export default locate;
