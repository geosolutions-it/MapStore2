/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { THEME_SELECTED, THEME_LOADED } from '../actions/theme';

function theme(state = {}, action) {
    switch (action.type) {
    case THEME_SELECTED:
        return {
            ...state,
            selectedTheme: action.theme
        };
    case THEME_LOADED:
        return {
            ...state,
            loaded: true
        };
    default:
        return state;
    }
}

export default theme;
