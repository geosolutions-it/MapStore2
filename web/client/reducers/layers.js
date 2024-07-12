/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    LAYER_LOADING,
    LAYER_LOAD,
    LAYER_ERROR,
    CHANGE_LAYER_PARAMS,
    CHANGE_LAYER_PROPERTIES,
    CHANGE_GROUP_PROPERTIES,
    TOGGLE_NODE,
    SORT_NODE,
    REMOVE_NODE,
    UPDATE_NODE,
    MOVE_NODE,
    ADD_LAYER,
    REMOVE_LAYER,
    ADD_GROUP,
    SHOW_SETTINGS,
    HIDE_SETTINGS,
    UPDATE_SETTINGS,
    REFRESH_LAYERS,
    LAYERS_REFRESH_ERROR,
    LAYERS_REFRESHED,
    CLEAR_LAYERS,
    SELECT_NODE,
    FILTER_LAYERS,
    SHOW_LAYER_METADATA,
    HIDE_LAYER_METADATA
} from '../actions/layers';

import { TOGGLE_CONTROL } from '../actions/controls';
import assign from 'object-assign';
import uuidv1 from 'uuid/v1';
import { isString, includes, castArray } from 'lodash';
import {
    getNode,
    deepChange,
    sortLayers,
    removeEmptyGroups,
    getLayerId,
    normalizeLayer,
    sortGroups,
    deepRemove,
    changeNodeConfiguration,
    moveNode,
    DEFAULT_GROUP_ID,
    ROOT_GROUP_ID,
    getSelectedNodes
} from '../utils/LayersUtils';

const insertNode = (nodes, node, parent, asFirst = false) => {
    if (!parent) {
        return asFirst ? [node, ...nodes] : [...nodes, node];
    }
    return nodes.map(n => isString(n) ? n : (n.id === parent ? {
        ...n,
        nodes: asFirst ? [node, ...n.nodes] : [...n.nodes, node]
    } : {
        ...n,
        nodes: insertNode(n.nodes, node, parent, asFirst)
    }));
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
            const layerGroup = layer.group || DEFAULT_GROUP_ID;
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
        const newNodes = deepChange(nodes, action.node, 'expanded', action.status);
        return assign({}, state, {[nodeSelector]: newNodes});
    }
    case SORT_NODE: {
        let node = getNode(state.groups || [], action.node);
        let nodes = node && node.nodes || action.node === ROOT_GROUP_ID && state.groups || null;
        if (nodes) {
            let reorderedNodes = action.order.map((idx) => {
                return nodes[idx];
            });
            const newNodes = action.node === ROOT_GROUP_ID ? reorderedNodes :
                deepChange(state.groups, action.node, 'nodes', reorderedNodes);
            let newLayers = action.sortLayers ? action.sortLayers(newNodes, state.flat) : state.flat;
            return assign({}, state, {groups: newNodes, flat: newLayers});
        }
        return state;
    }
    case UPDATE_NODE: {
        const updatedNode = changeNodeConfiguration({
            layers: state.flat,
            groups: state.groups
        }, {
            node: action.node,
            nodeType: action.nodeType,
            options: action.options
        });
        return {
            ...state,
            ...(updatedNode.layers && { flat: updatedNode.layers }),
            ...(updatedNode.groups && { groups: updatedNode.groups })
        };
    }
    case MOVE_NODE: {
        const newState = sortGroups({
            groups: state.groups,
            layers: state.flat
        }, {
            node: action.node,
            index: action.index,
            groupId: action.groupId
        });
        if (newState === null) {
            return state;
        }
        return newState !== null
            ? {
                ...state,
                flat: newState.layers,
                groups: newState.groups
            }
            : state;
    }
    case REMOVE_NODE: {
        if (action.nodeType === 'groups') {
            const newGroups = deepRemove(state.groups, action.node);
            const newLayers = state.flat.filter((layer) => !layer.group || layer.group !== action.node && layer.group.indexOf(action.node + '.') !== 0);
            return {
                selected: getSelectedNodes(state?.selected || [], action?.node, true),
                flat: newLayers,
                groups: newGroups
            };
        }
        if (action.nodeType === 'layers') {
            const newGroups = action.removeEmpty ?
                removeEmptyGroups(deepRemove(state.groups, action.node)) :
                deepRemove(state.groups, action.node);
            const newLayers = state.flat.filter((layer) => layer.id !== action.node);
            return assign({}, state, {
                flat: newLayers,
                groups: newGroups,
                selected: (state?.selected || []).filter((selectedId) => selectedId !== action.node)
            });
        }
        return state;
    }
    case ADD_LAYER: {
        const layer = normalizeLayer(action.layer);
        let newLayers = (state.flat || []).concat();
        let newGroups = (state.groups || []).concat();
        const newLayer = (layer.id) ? layer : assign({}, layer, {id: getLayerId(layer)});
        newLayers.push(newLayer);
        const groupId = newLayer.group || DEFAULT_GROUP_ID;
        if (groupId !== "background") {
            newGroups = moveNode(newGroups, newLayer.id, groupId, newLayers, action.foreground);
        }
        let orderedNewLayers = sortLayers ? sortLayers(newGroups, newLayers) : newLayers;
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
        const defaultGroup = {
            id: DEFAULT_GROUP_ID,
            name: DEFAULT_GROUP_ID,
            title: DEFAULT_GROUP_ID,
            expanded: true,
            nodes: []
        };
        // ensure new added group are included in the default
        const parent = action.parent ?? DEFAULT_GROUP_ID;
        const groups = (state.groups || []).find((group) => group.id === DEFAULT_GROUP_ID)
            ? state.groups
            : [defaultGroup, ...state.groups];

        const newGroups = insertNode(
            groups,
            {
                id: parent + '.' + id,
                title: action.group,
                name: id,
                nodes: [],
                expanded: true,
                ...action.options
            },
            parent,
            action.asFirst
        );
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
            settings: settings,
            editLayerName: false,
            layerNameIsBeingChecked: false,
            layerNameChangeError: false
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
            settings: settings,
            editLayerName: false,
            layerNameIsBeingChecked: false,
            layerNameChangeError: false
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
        return {
            ...state,
            selected: getSelectedNodes(state?.selected || [], action?.id, action?.ctrlKey),
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
        };
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

export default layers;
