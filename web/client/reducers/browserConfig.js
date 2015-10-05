/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var { CHANGE_BROWSER_PROPERTIES} = require('../actions/config');
var assign = require('object-assign');

function browserConfig(state = null, action) {
    switch (action.type) {
        case CHANGE_BROWSER_PROPERTIES: {
            return assign({}, state,
                action.newProperties
                );
        }
        default:
            return state;
    }
}

module.exports = browserConfig;
