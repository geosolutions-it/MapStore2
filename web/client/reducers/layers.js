/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {LAYER_LOADING, LAYER_LOAD, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES,
    TOGGLE_NODE, SORT_NODE, REMOVE_NODE, UPDATE_NODE, UPDATE_NODE_TEMP} = require('../actions/layers');

var assign = require('object-assign');
var {isObject, isArray} = require('lodash');

const deepChange = (nodes, findValue, propName, propValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.map((node) => {
            if (isObject(node)) {
                return node.id === findValue ?
                    assign({}, node, {[propName]: propValue}) :
                    assign({}, node, {nodes: deepChange(node.nodes, findValue, propName, propValue)});
            }
            return node;
        });
    }
    return [];
};

const deepRemove = (nodes, findValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.filter((node) => node.name !== findValue).map((node) => isObject(node) ? assign({}, node, node.nodes ? {
            nodes: deepRemove(node.nodes, findValue, node.name + '.')
        } : {}) : node);
    }
    return nodes;
};

const getNode = (nodes, name) => {
    if (nodes && isArray(nodes)) {
        return nodes.reduce((previous, node) => {
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
    }
    return null;
};

function layers(state = [], action) {
    switch (action.type) {
        case LAYER_LOADING: {
            const newLayers = (state.flat || []).map((layer) => {
                return layer.id === action.layerId ? assign({}, layer, {loading: true}) : layer;
            });
            return assign({}, state, {flat: newLayers});
        }
        case LAYER_LOAD: {
            const newLayers = (state.flat || []).map((layer) => {
                return layer.id === action.layerId ? assign({}, layer, {loading: false}) : layer;
            });
            return assign({}, state, {flat: newLayers});
        }
        case CHANGE_LAYER_PROPERTIES: {
            const flatLayers = (state.flat || []);
            let isBackground = flatLayers.reduce(
                    (background, layer) => background || (layer.id === action.layer && layer.group === 'background'),
            false);
            const newLayers = flatLayers.map((layer) => {
                if (layer.id === action.layer) {
                    return assign({}, layer, action.newProperties);
                } else if (layer.group === 'background' && isBackground && action.newProperties.visibility) {
                    // TODO remove
                    return assign({}, layer, {visibility: false});
                }
                return assign({}, layer);
            });
            return assign({}, state, {flat: newLayers});
        }
        case CHANGE_GROUP_PROPERTIES: {
            let newLayers = state.flat.map((layer) => {
                if (layer.group === action.group || layer.group.indexOf(action.group + ".") === 0) {
                    return assign({}, layer, action.newProperties);
                }
                return assign({}, layer);
            });
            return assign({}, state, {
                flat: newLayers
            });
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
                let newLayers = action.sortLayers ? action.sortLayers(newNodes, state.flat) : state.flat;
                return assign({}, state, {groups: newNodes, flat: newLayers});
            }
        }
        case UPDATE_NODE: {
            const flatLayers = (state.flat || []);
            const selector = action.nodeType === 'groups' ? 'group' : 'id';

            const newLayers = flatLayers.map((layer) => {
                if (layer[selector] === action.node || layer[selector].indexOf(action.node + '.') === 0) {
                    return assign({}, layer, action.options);
                }
                return assign({}, layer);
            });
            return assign({}, state, {flat: newLayers});
        }
        case UPDATE_NODE_TEMP: {
            const flatLayers = (state.flat || []);
            const selector = action.nodeType === 'groups' ? 'group' : 'id';

            const newLayers = flatLayers.map((layer) => {
                if (layer[selector] === action.node || layer[selector].indexOf(action.node + '.') === 0) {
                    return assign({}, layer, {
                        temp: action.options
                    });
                }
                return assign({}, layer);
            });
            return assign({}, state, {flat: newLayers});
        }
        case REMOVE_NODE: {
            if (action.nodeType === 'groups') {
                const newGroups = deepRemove(state.groups, action.node);
                const newLayers = state.flat.filter((layer) => layer.group !== action.node && layer.group.indexOf(action.node + '.') !== 0);

                return {
                    flat: newLayers,
                    groups: newGroups
                };
            }
            // TODO: layers
        }
        default:
            return state;
    }
}

module.exports = layers;
