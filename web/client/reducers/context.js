/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CONTEXT_LOADED, SET_RESOURCE } from "../actions/context";
import {set} from '../utils/ImmutableUtils';
export default (state, action) => ({
    switch (action.type) {
        case CONTEXT_LOADED:
            set('currentContext', action.context);
            break;
        case SET_RESOURCE:
            set('resource', action.resource);
        default:
            return state;
    }
});
