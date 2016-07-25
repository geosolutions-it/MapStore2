/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {LAYER_LOADING, LAYER_LOAD, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES,
    TOGGLE_NODE, SORT_NODE, REMOVE_NODE, UPDATE_NODE, ADD_LAYER,
    SHOW_SETTINGS, HIDE_SETTINGS, UPDATE_SETTINGS, INVALID_LAYER} = require('../actions/layers');

var assign = require('object-assign');
var {isObject, isArray} = require('lodash');

const LayersUtils = require('../utils/LayersUtils');

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
                const layerGroup = layer.group || 'Default';
                if (layerGroup === action.group || layerGroup.indexOf(action.group + ".") === 0) {

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
        case INVALID_LAYER: {
            const flatLayers = (state.flat || []);

            const newLayers = flatLayers.map((layer) => {
                if (layer.id === action.options.id) {
                    return assign({}, layer, {invalid: true});
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
        case ADD_LAYER: {
            let newLayers = (state.flat || []).concat();
            let newGroups = (state.groups || []).concat();
            const newLayer = (action.layer.id) ? action.layer : assign({}, action.layer, {id: action.layer.name + "__" + newLayers.length});
            newLayers.push(newLayer);
            const groupName = newLayer.group || 'Default';
            if (groupName !== "background") {
                let node = getNode(newGroups, groupName );
                if (node) {
                    newGroups = deepChange(state.groups, groupName, 'nodes', node.nodes.concat(newLayer.id));
                } else {
                    const newGroup = LayersUtils.getLayersByGroup([newLayer]);
                    newGroups = newGroup.concat(newGroups);
                }
            }
            return {
                    flat: newLayers,
                    groups: newGroups
            };
        }
        case SHOW_SETTINGS: {
            let settings = assign({}, state.settings, {
                expanded: true,
                node: action.node,
                nodeType: action.nodeType,
                options: action.options
            });
            return assign({}, state, {
                settings: settings
            });
        }
        case HIDE_SETTINGS: {
            let settings = assign({}, state.Settings, {
                expanded: false,
                node: null,
                nodeType: null,
                options: {}
            });
            return assign({}, state, {
                settings: settings
            });
        }
        case UPDATE_SETTINGS: {
            const options = assign({},
                state.settings && state.settings.options,
                action.options
            );
            const settings = assign({}, state.settings, {options: options});
            return assign({}, state, {
                settings: settings
            });
        }
        default:
            return state;
    }
}

module.exports = layers;
