/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_PENDING_CHANGES } from "../actions/save";

const defaultState = {
    pendingChanges: {}
};

function save(state = defaultState, action) {
    switch (action.type) {
    case SET_PENDING_CHANGES:
        return {
            ...state,
            pendingChanges: action.pendingChanges
        };
    default:
        return state;
    }
}

export default save;
