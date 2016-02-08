/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {TOGGLE_GRATICULE} = require('../actions/controls');
var assign = require('object-assign');

function controls(state = {graticule: false}, action) {
    switch (action.type) {
        case TOGGLE_GRATICULE: {
            return assign({}, state,
                {
                    graticule: !state.graticule
                }
            );
        }
        default:
            return state;
    }
}

module.exports = controls;
