/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {ACTIVATE_BUTTON} = require('../actions/fullScreen');

function fullScreen(state = null, action) {
    switch (action.type) {
        case ACTIVATE_BUTTON:
            return {
                activeKey: action.activeKey
            };
        default:
            return state;
    }
}

module.exports = fullScreen;