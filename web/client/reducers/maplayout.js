/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {UPDATE_MAP_LAYOUT} = require('../actions/maplayout');
const assign = require('object-assign');

function mapLayout(state = { layout: {} }, action) {
    switch (action.type) {
    case UPDATE_MAP_LAYOUT: {
        return assign({}, state, {layout: assign({}, state.layout, action.layout)});
    }
    default:
        return state;
    }
}

module.exports = mapLayout;
