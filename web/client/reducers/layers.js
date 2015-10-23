/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {LAYER_LOADING, LAYER_LOAD, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES, TOGGLE_NODE, SORT_NODE, REMOVE_NODE, UPDATE_NODE} =
    require('../actions/layers');

var assign = require('object-assign');
var {isObject, isArray} = require('lodash');

const deepChange = (nodes, findValue, propName, propValue) => {
    if (nodes && isArray(nodes)) {
        return nodes.map((node) => {
            if (isObject(node)) {
                return node.name === findValue ?
                    assign({}, node, {[propName]: propValue}) :
                    assign({}, node, {nodes: deepChange(node.nodes, findValue, propName, propValue)});
            }
            return node;
        });
    }
    return [];
};

const getNode = (nodes, name) => {
    if (nodes && isArray(nodes)) {
        let group = nodes.reduce((previous, node) => {
            if (previous) {
                return previous;
            }
            if (node && node.name === name) {
                return node;
            }
            if (node && node.nodes && node.nodes.length > 0) {
                return getNode(node.nodes, name);
            }
            return previous;
        }, null);
        return group;
    }
    return null;
};

function layers(state = [], action) {
    switch (action.type) {
        case LAYER_LOADING: {
            const newLayers = (state.flat || []).map((layer) => {
                return layer.name === action.layerId ? assign({}, layer, {loading: true}) : layer;
            });
            return assign({}, state, {flat: newLayers});
        }
        case LAYER_LOAD: {
            const newLayers = (state.flat || []).map((layer) => {
                return layer.name === action.layerId ? assign({}, layer, {loading: false}) : layer;
            });
            return assign({}, state, {flat: newLayers});
        }
        case CHANGE_LAYER_PROPERTIES: {
            const flatLayers = (state.flat || []);
            let isBackground = flatLayers.reduce(
                    (background, layer) => background || (layer.name === action.layer && layer.group === 'background'),
            false);
            const newLayers = flatLayers.map((layer) => {
                if (layer.name === action.layer) {
                    return assign({}, layer, action.newProperties);
                } else if (layer.group === 'background' && isBackground && action.newProperties.visibility) {
                    // TODO remove
                    return assign({}, layer, {visibility: false});
                }
                return assign({}, layer);
            });
            return assign({}, state, {flat: newLayers});
        }
        case TOGGLE_NODE: {
            let nodeSelector = action.nodeType === 'layers' ? 'flat' : 'groups';
            let nodes = state[nodeSelector] || [];
            const newNodes = deepChange(nodes, action.node, 'expanded', action.status);
            return assign({}, state, {[nodeSelector]: newNodes});
        }
        case SORT_NODE: {
            let node = getNode(state.groups || [], action.node);
            let nodes = node && node.nodes || action.node === 'root' && state.groups || null;
            if (nodes) {
                let reorderedNodes = action.order.map((idx) => {
                    return nodes[idx];
                });
                const newNodes = action.node === 'root' ? reorderedNodes :
                    deepChange(state.groups, action.node, 'nodes', reorderedNodes);
                return assign({}, state, {groups: newNodes});
            }
            /*let node = state.groups[action.node] && state.groups[action.node].order || null;
            if (!order) {
                order = action.order;
            } else {
                order = action.order.map((idx) => {
                    return order[idx];
                });
            }
            let node = assign({}, state.groups[action.node] || {}, {order: order});
            let nodes = assign({}, state.groups, {[action.node]: node});
            return assign({}, state, {groups: nodes});*/
        }
        default:
            return state;
    }
}

/*function layers(state = {groups: {}, layers: {}}, action) {
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
            let node = assign(
                {},
                (state[action.nodeType] ? state[action.nodeType][action.node] : {}) || {},
                {removed: true}
            );
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        case UPDATE_NODE: {
            let updates = assign(
                {},
                ((state[action.nodeType] ? state[action.nodeType][action.node] : {}) || {}).updates || {},
                action.options
            );
            let node = assign(
                {},
                (state[action.nodeType] ? state[action.nodeType][action.node] : {}) || {},
                {updates: updates}
            );
            let nodes = assign({}, state[action.nodeType], {[action.node]: node});
            return assign({}, state, {[action.nodeType]: nodes});
        }
        case CHANGE_LAYER_PROPERTIES: {
            let isBackground = state.layers.reduce(
                    (background, layer) => background || (layer.name === action.layer && layer.group === 'background'),
            false);
            let newLayers = state.layers.map((layer) => {
                if (layer.name === action.layer) {
                    return assign({}, layer, action.newProperties);
                } else if (layer.group === 'background' && isBackground && action.newProperties.visibility) {
                    // TODO remove
                    return assign({}, layer, {visibility: false});
                }
                return assign({}, layer);
            });
            return assign({}, state, {
                layers: newLayers
            });
        }
        case CHANGE_GROUP_PROPERTIES: {
            let newLayers = state.layers.map((layer) => {
                if (layer.group === action.group || layer.group.indexOf(action.group + ".") === 0) {
                    return assign({}, layer, action.newProperties);
                }
                return assign({}, layer);
            });
            return assign({}, state, {
                layers: newLayers
            });
        }
        default:
            return state;
    }
}*/

module.exports = layers;
