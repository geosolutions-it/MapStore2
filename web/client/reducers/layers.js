/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {LAYER_LOADING, LAYER_LOAD} = require('../actions/map');
var {TOGGLE_NODE, SORT_NODE, REMOVE_NODE, UPDATE_NODE} = require('../actions/layers');

var assign = require('object-assign');

function layers(state = {groups: {}, layers: {}}, action) {
    switch (action.type) {
        case LAYER_LOADING: {
            let loadingLayers = (state && state.loadingLayers && state.loadingLayers.slice(0)) || [];
            if (loadingLayers.indexOf(action.layerId) === -1) {
                loadingLayers.push(action.layerId);
            }
            return assign({}, state, {
                loadingLayers: loadingLayers
            });
        }
        case LAYER_LOAD: {
            let loadingLayers = (state && state.loadingLayers && state.loadingLayers.slice(0)) || [];
            loadingLayers = loadingLayers.filter((el) => {
                return el !== action.layerId;
            });
            return assign({}, state, {
                loadingLayers: loadingLayers
            });
        }
        case TOGGLE_NODE: {
            let node = assign({}, state[action.nodeType][action.node] || {}, {expanded: action.status});
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        case SORT_NODE: {
            let order = state.groups[action.node] && state.groups[action.node].order || null;
            if (!order) {
                order = action.order;
            } else {
                order = action.order.map((idx) => {
                    return order[idx];
                });
            }
            let node = assign({}, state.groups[action.node] || {}, {order: order});
            let nodes = assign({}, state.groups, {[action.node]: node});
            return assign({}, state, {groups: nodes});
        }
        case REMOVE_NODE: {
            let node = assign({}, state[action.nodeType][action.node] || {}, {removed: true});
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        case UPDATE_NODE: {
            let updates = assign({}, (state[action.nodeType][action.node] || {}).updates || {}, action.options);
            let node = assign({}, state[action.nodeType][action.node] || {}, {updates: updates});
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        default:
            return state;
    }
}

module.exports = layers;
