/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ON_TAB_SELECTED
} = require('../actions/contenttabs');

function contenttabs(state = {selected: "maps"}, action) {
    switch (action.type) {
        case ON_TAB_SELECTED: {
            return {selected: action.id || "maps"};
        }
        default:
            return state;
    }
}

module.exports = contenttabs;
