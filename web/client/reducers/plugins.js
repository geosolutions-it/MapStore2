/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var { LOAD_PLUGINS } = require('../actions/plugins');
var assign = require('object-assign');

function plugins(state = {}, action) {
    switch (action.type) {
        case LOAD_PLUGINS: {
            return assign({}, state,
                action.plugins
            );
        }
        default:
            return state;
    }
}

module.exports = plugins;
