/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SHOW_TAGS_PANEL } from '../actions/tags';

const defaultState = {};

function tags(state = defaultState, action) {
    switch (action.type) {
    case SHOW_TAGS_PANEL: {
        return {
            ...state,
            show: action.show
        };
    }
    default:
        return state;
    }
}

export default tags;
