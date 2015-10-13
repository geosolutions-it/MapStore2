/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {TOGGLE_NODE} = require('../actions/layers');
var assign = require('object-assign');

function layers(state = {groups: {}, layers: {}}, action) {
    switch (action.type) {
        case TOGGLE_NODE: {
            let node = assign({}, state[action.nodeType][action.node] || {}, {expanded: action.status});
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        default:
            return state;
    }
}

module.exports = layers;
