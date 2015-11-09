/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_LOCATE_STATE} = require('../actions/locate');

const assign = require('object-assign');

function locate(state = null, action) {
    switch (action.type) {
        case CHANGE_LOCATE_STATE:
            return assign({}, state, {
                enabled: action.enabled
            });
        default:
            return state;
    }
}

module.exports = locate;
