/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {ACTIVATE_PANEL} = require('../actions/floatingPanel');

function floatingPanel(state = null, action) {
    switch (action.type) {
        case ACTIVATE_PANEL:
            return {
                activeKey: action.activeKey
            };
        default:
            return state;
    }
}

module.exports = floatingPanel;
