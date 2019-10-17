/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SET_CURRENT_CONTEXT } from "../actions/context";
import {set} from '../utils/ImmutableUtils';
export default (state, action) => {
    switch (action.type) {
    case SET_CURRENT_CONTEXT:
        return set('currentContext', action.context, state);
    default:
        break;
    }
    return state;
};
