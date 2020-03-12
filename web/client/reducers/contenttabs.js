/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ON_TAB_SELECTED,
    SET_TABS_HIDDEN
} = require('../actions/contenttabs');

function contenttabs(state = {selected: "maps"}, action) {
    switch (action.type) {
    case ON_TAB_SELECTED: {
        return {
            ...state,
            selected: action.id || "maps"
        };
    }
    case SET_TABS_HIDDEN: {
        return {
            ...state,
            hiddenTabs: {
                ...(state.hiddenTabs || {}),
                ...action.tabs
            }
        };
    }
    default:
        return state;
    }
}

module.exports = contenttabs;
