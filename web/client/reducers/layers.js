/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var { LAYER_LOADING, LAYER_LOAD, LAYER_ERROR, CHANGE_LAYER_PARAMS, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES,
    TOGGLE_NODE, SORT_NODE, REMOVE_NODE, UPDATE_NODE, MOVE_NODE, ADD_LAYER, REMOVE_LAYER, ADD_GROUP,
    SHOW_SETTINGS, HIDE_SETTINGS, UPDATE_SETTINGS, REFRESH_LAYERS, LAYERS_REFRESH_ERROR, LAYERS_REFRESHED, CLEAR_LAYERS, SELECT_NODE, FILTER_LAYERS, SHOW_LAYER_METADATA, HIDE_LAYER_METADATA
} = require('../actions/layers');

const {TOGGLE_CONTROL} = require('../actions/controls');

var assign = require('object-assign');
const uuidv1 = require('uuid/v1');
var {isObject, isArray, head, isString, includes, castArray} = require('lodash');

const LayersUtils = require('../utils/LayersUtils');

/**
Removes a group even if it is nested
It works for layers too
**/
const deepRemove = (nodes, findValue) => {
    if (nodes && isArray(nodes) && nodes.length > 0) {
        return nodes.filter((node) => (node.id && node.id !== findValue) || (isString(node) && node !== findValue )).map((node) => isObject(node) ? assign({}, node, node.nodes ? {
            nodes: deepRemove(node.nodes, findValue)
        } : {}) : node);
    }
    return nodes;
};

const moveNode = (groups, node, groupId, newLayers, foreground = true) => {
    // Remove node from old group
    let newGroups = deepRemove(groups, node);
    // Check if group to move to exists
    let group = LayersUtils.getNode(newGroups, groupId);
    if (!group) {
        // Create missing group
        group = head(LayersUtils.getLayersByGroup([LayersUtils.getNode(newLayers, node)]));
        // check for parent group if exist
        const parentGroup = groupId.split('.').reduce((tree, gName, idx) => {
            const gId = groupId.split(".", idx + 1).join('.');
            const parent = LayersUtils.getNode(newGroups, gId);
            return parent ? tree.concat(parent) : tree;
        }, []).pop();
        if (parentGroup) {
            group = LayersUtils.getNode([group], parentGroup.id).nodes[0];
            newGroups = LayersUtils.deepChange(newGroups, parentGroup.id, 'nodes', foreground ? [group].concat(parentGroup.nodes) : parentGroup.nodes.concat(group));
        } else {
            newGroups = [group].concat(newGroups);
        }
    } else {
        newGroups = LayersUtils.deepChange(newGroups, group.id, 'nodes', foreground ? [node].concat(group.nodes.slice(0)) : group.nodes.concat(node));
    }
    return newGroups;
};

const insertNode = (nodes, node, parent) => {
    if (!parent) {
        return [...nodes, node];
    }
    return nodes.map(n => isString(n) ? n : (n.id === parent ? {
        ...n,
        nodes: [...n.nodes, node]
    } : {
        ...n,
        nodes: insertNode(n.nodes, node, parent)
    }));
};

const updateGroupIds = (node, parentGroupId, newLayers) => {
    if (node) {
        if (isString(node.id)) {
            const lastDot = node.id.lastIndexOf('.');
            const newId = lastDot !== -1 ?
                parentGroupId + node.id.slice(lastDot + (parentGroupId === '' ? 1 : 0)) :
                parentGroupId + (parentGroupId === '' ? '' : '.') + node.id;
            return assign({}, node, {id: newId, nodes: node.nodes.map(x => updateGroupIds(x, newId, newLayers))});
        } else if (isString(node)) {
            // if it's just a string it means it is a layer id
            for (let layer of newLayers) {
                if (layer.id === node) {
                    layer.group = parentGroupId;
                }
            }
            return node;
        }
    }
    return node;
};

function layers(state = { flat: [] }, action) {
    switch (action.type) {
    case TOGGLE_CONTROL: {
        if (action.control === 'RefreshLayers') {
            return assign({}, state, {refreshError: []});
        }
        return state;
    }
    case LAYER_LOADING: {
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? assign({}, layer, {loading: true}) : layer;
        });
        return assign({}, state, {flat: newLayers});
    }
    case LAYER_LOAD: {
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? assign({}, layer, {
                loading: false, previousLoadingError: layer.loadingError, loadingError: action.error ? "Error" : false
            }) : layer;
        });
        return assign({}, state, {flat: newLayers});
    }
    case LAYER_ERROR: {
        const isError = action.tilesCount === action.tilesErrorCount;
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? assign({}, layer, {
                previousLoadingError: layer.loadingError, loadingError: isError ? 'Error' : 'Warning'
            }) : layer;
        });
        return assign({}, state, {flat: newLayers});
    }
    case REFRESH_LAYERS: {
        return assign({}, state, {refreshing: action.layers, refreshError: []});
    }
    case LAYERS_REFRESH_ERROR: {
        const newLayers = (state.refreshing || []).filter((layer) => {
            return action.layers.filter((l) => l.layer === layer.id).length === 0;
        });
        const errors = action.layers.map((err) => ({
            layer: err.fullLayer.title,
            error: action.error
        }));
        return assign({}, state, {refreshing: newLayers, refreshError: [...(state.refreshError || []), ...errors]});
    }
    case LAYERS_REFRESHED: {
        const newLayers = (state.refreshing || []).filter((layer) => {
            return action.layers.filter((l) => l.layer === layer.id).length === 0;
        });
        return assign({}, state, {refreshing: newLayers});
    }
    case CHANGE_LAYER_PARAMS:
    case CHANGE_LAYER_PROPERTIES: {
        const flatLayers = (state.flat || []);
        let isBackground = flatLayers.reduce(
            (background, layer) => background || (layer.id === action.layer && layer.group === 'background'),
            false);
        const newLayers = flatLayers.map((layer) => {
            if ( includes(castArray(action.layer), layer.id )) {
                return assign(
                    {},
                    layer,
                    action.newProperties,
                    action.params
                        ? {
                            params: assign({}, layer.params, action.params)
                        }
                        : {});
            } else if (layer.group === 'background' && isBackground && action.newProperties && action.newProperties.visibility) {
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
            if (layerGroup === action.group || layerGroup.indexOf(`${action.group}.`) === 0) {
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
        const newNodes = LayersUtils.deepChange(nodes, action.node, 'expanded', action.status);
        return assign({}, state, {[nodeSelector]: newNodes});
    }
    case SORT_NODE: {
        let node = LayersUtils.getNode(state.groups || [], action.node);
        let nodes = node && node.nodes || action.node === 'root' && state.groups || null;
        if (nodes) {
            let reorderedNodes = action.order.map((idx) => {
                return nodes[idx];
            });
            const newNodes = action.node === 'root' ? reorderedNodes :
                LayersUtils.deepChange(state.groups, action.node, 'nodes', reorderedNodes);
            let newLayers = action.sortLayers ? action.sortLayers(newNodes, state.flat) : state.flat;
            return assign({}, state, {groups: newNodes, flat: newLayers});
        }
        return state;
    }
    case UPDATE_NODE: {
        const selector = action.nodeType === 'groups' ? 'group' : 'id';
        if (selector === 'group') {
            const groups = state.groups ? [].concat(state.groups) : [];
            // updating correctly options in a (deep) subgroup
            let newGroups = LayersUtils.deepChange(groups, action.node, action.options);
            return assign({}, state, {groups: newGroups});
        }

        const flatLayers = (state.flat || []);

        // const newGroups = action.options && action.options.group && action.options.group !== layer;
        let sameGroup = action.options.hasOwnProperty("group") ? false : true;

        const newLayers = flatLayers.map((layer) => {
            if (layer[selector] === action.node || layer[selector].indexOf(action.node + '.') === 0) {
                if (layer.group === (action.options.group || 'Default')) {
                    // If the layer didn't change group, raise a flag to prevent groups update
                    sameGroup = true;
                }
                // Edit the layer with the new options
                return assign({}, layer, action.options);
            }
            return assign({}, layer);
        });
        let originalNode = head(flatLayers.filter((layer) => { return (layer[selector] === action.node || layer[selector].indexOf(action.node + '.') === 0); }));
        if (!sameGroup && originalNode ) {
            // Remove layers from old group
            const groupId = (action.options.group || 'Default');
            const newGroups = moveNode(state.groups, action.node, groupId, newLayers);

            let orderedNewLayers = LayersUtils.sortLayers ? LayersUtils.sortLayers(newGroups, newLayers) : newLayers;
            return assign({}, state, {
                flat: orderedNewLayers,
                groups: newGroups
            });
        }
        return assign({}, state, {flat: newLayers});
    }
    case MOVE_NODE: {
        const node = LayersUtils.getNode(state.groups || [], action.node);
        const layerNode = LayersUtils.getNode(state.flat, action.node);
        if (node && action.index >= 0 && node.id !== 'root' && node.id !== 'Default' && !(!!layerNode && action.groupId === 'root')) {
            const groupId = action.groupId || 'Default';
            const curGroupId = layerNode ? (layerNode.group || 'Default') : (() => {
                const groups = node.id.split('.');
                return groups[groups.length - 2] || 'root';
            })();

            if (groupId === curGroupId) {
                const curGroupNode = curGroupId === 'root' ? {nodes: state.groups} : LayersUtils.getNode(state.groups, curGroupId);
                let nodes = (curGroupNode && curGroupNode.nodes || []).slice();
                const nodeIndex = nodes.findIndex(x => (x.id || x) === (node.id || node));

                if (nodeIndex !== -1 && nodeIndex !== action.index) {
                    const swapCnt = Math.abs(action.index - nodeIndex);
                    const delta = nodeIndex < action.index ? 1 : -1;
                    let pos = nodeIndex;
                    for (let i = 0; i < swapCnt; ++i, pos += delta) {
                        const tmp = nodes[pos];
                        nodes[pos] = nodes[pos + delta];
                        nodes[pos + delta] = tmp;
                    }

                    const newGroups = curGroupId === 'root' ? nodes : LayersUtils.deepChange(state.groups, action.groupId, 'nodes', nodes);

                    return assign({}, state, {
                        flat: LayersUtils.sortLayers(newGroups, state.flat),
                        groups: newGroups
                    });
                }
            } else {
                const groupsWithRemovedNode = deepRemove(state.groups, node.id || node);
                const dstGroup = groupId === 'root' ? {nodes: groupsWithRemovedNode} : LayersUtils.getNode(groupsWithRemovedNode, action.groupId);
                if (dstGroup) {
                    const newLayers = state.flat.map(layer => assign({}, layer));
                    const newNode = updateGroupIds(node, groupId === 'root' ? '' : groupId, newLayers);
                    let newDestNodes = dstGroup.nodes.slice();
                    newDestNodes.splice(action.index, 0, newNode);
                    const newGroups = groupId === 'root' ?
                        newDestNodes :
                        LayersUtils.deepChange(groupsWithRemovedNode.slice(), dstGroup.id, 'nodes', newDestNodes);

                    return assign({}, state, {
                        flat: LayersUtils.sortLayers(newGroups, newLayers),
                        groups: newGroups
                    });
                }
            }
        }
        return state;
    }
    case REMOVE_NODE: {
        if (action.nodeType === 'groups') {
            const newGroups = deepRemove(state.groups, action.node);
            const newLayers = state.flat.filter((layer) => !layer.group || layer.group !== action.node && layer.group.indexOf(action.node + '.') !== 0);

            return {
                flat: newLayers,
                groups: newGroups
            };
        }
        if (action.nodeType === 'layers') {
            const newGroups = action.removeEmpty ?
                LayersUtils.removeEmptyGroups(deepRemove(state.groups, action.node)) :
                deepRemove(state.groups, action.node);
            const newLayers = state.flat.filter((layer) => layer.id !== action.node);
            return assign({}, state, {
                flat: newLayers,
                groups: newGroups
            });
        }
        return state;
    }
    case ADD_LAYER: {
        let newLayers = (state.flat || []).concat();
        let newGroups = (state.groups || []).concat();
        const newLayer = (action.layer.id) ? action.layer : assign({}, action.layer, {id: LayersUtils.getLayerId(action.layer, newLayers)});
        newLayers.push(newLayer);
        const groupId = newLayer.group || 'Default';
        if (groupId !== "background") {
            newGroups = moveNode(newGroups, newLayer.id, groupId, newLayers, action.foreground);
        }
        let orderedNewLayers = LayersUtils.sortLayers ? LayersUtils.sortLayers(newGroups, newLayers) : newLayers;
        return assign({}, state, {
            flat: orderedNewLayers,
            groups: newGroups
        });
    }
    case REMOVE_LAYER: {
        const newGroups = deepRemove(state.groups, action.layerId);
        const newLayers = state.flat.filter((layer) => layer.id !== action.layerId);
        return assign({}, state, {
            flat: newLayers,
            groups: newGroups
        });
    }
    case ADD_GROUP: {
        const id = uuidv1();
        const newGroups = insertNode(state.groups, {
            id: action.parent ? (action.parent + '.' + id) : id,
            title: action.group,
            name: id,
            nodes: [],
            expanded: true,
            ...action.options
        }, action.parent);
        return assign({}, state, {
            groups: newGroups
        });
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
        let settings = assign({}, state.settings, {
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
    case CLEAR_LAYERS: {
        return assign({}, state, {
            flat: [],
            groups: [],
            selected: []
        });
    }
    case SELECT_NODE: {
        let selected = state.selected ? [].concat(state.selected) : [];

        if (action.id && action.nodeType === 'group') {
            const groups = [].concat(state.groups);
            const group = LayersUtils.getNode(groups, action.id);
            const nodes = LayersUtils.getGroupNodes(group);

            if (action.ctrlKey && group) {
                if (selected.filter(s => s === action.id).length === 0) {
                    selected = selected.concat(nodes, [action.id]);
                } else {
                    selected = selected.filter(s => s !== action.id);
                    nodes.forEach((n) => {
                        selected = selected.filter(s => s !== n);
                    });
                }
            } else if (!action.ctrlKey && group) {
                if (selected.filter(s => s === action.id).length === 0) {
                    selected = [].concat(nodes, [action.id]);
                } else {
                    selected = [];
                }
            }
        } else if (action.id && action.nodeType === 'layer') {
            if (action.ctrlKey) {
                if (selected.filter(s => s === action.id).length === 0) {
                    selected.push(action.id);
                } else {
                    selected = selected.filter(s => s !== action.id);
                }
            } else {
                if (selected.filter(s => s === action.id).length === 0) {
                    selected = [action.id];
                } else {
                    selected = selected.length > 1 ? [action.id] : [];
                }
            }
        } else {
            selected = [];
        }

        return assign({}, state, {
            selected,
            settings: {
                expanded: false,
                node: null,
                nodeType: null,
                options: {}
            },
            layerMetadata: {
                expanded: false,
                metadataRecord: {},
                maskLoading: false
            }
        });
    }
    case FILTER_LAYERS: {
        return assign({}, state, {
            filter: action.text || ''
        });
    }
    case SHOW_LAYER_METADATA: {
        let layerMetadata = assign({}, state.layerMetadata, {
            metadataRecord: action.metadataRecord,
            expanded: true,
            maskLoading: action.maskLoading
        });
        return assign({}, state, {
            layerMetadata
        });
    }
    case HIDE_LAYER_METADATA: {
        let layerMetadata = assign({}, state.layerMetadata, {
            metadataRecord: {},
            expanded: false
        });
        return assign({}, state, {
            layerMetadata
        });
    }
    default:
        return state;
    }
}

module.exports = layers;
