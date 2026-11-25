/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SHOW_RESULT } from '../actions/extensionsManager';

// The result is kept in the store because loading extensions renders the manager tabs again.
export default (state = {}, action) => {
    switch (action.type) {
    case SHOW_RESULT:
        return { ...state, result: action.result };
    default:
        return state;
    }
};
