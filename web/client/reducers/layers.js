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
    HIDE_LAYER_METADATA,
    REPLACE_LAYERS
} from '../actions/layers';

import { TOGGLE_CONTROL } from '../actions/controls';

import { REFRESH_SECURITY_LAYERS, CLEAR_SECURITY } from '../actions/security';
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
            return Object.assign({}, state, {refreshError: []});
        }
        return state;
    }
    case LAYER_LOADING: {
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? Object.assign({}, layer, {loading: true}) : layer;
        });
        return Object.assign({}, state, {flat: newLayers});
    }
    case LAYER_LOAD: {
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? Object.assign({}, layer, {
                loading: false, previousLoadingError: layer.loadingError, loadingError: action.error ? "Error" : false
            }) : layer;
        });
        return Object.assign({}, state, {flat: newLayers});
    }
    case LAYER_ERROR: {
        const isError = action.tilesCount === action.tilesErrorCount;
        const newLayers = (state.flat || []).map((layer) => {
            return layer.id === action.layerId ? Object.assign({}, layer, {
                previousLoadingError: layer.loadingError, loadingError: isError ? 'Error' : 'Warning'
            }) : layer;
        });
        return Object.assign({}, state, {flat: newLayers});
    }
    case REFRESH_LAYERS: {
        return Object.assign({}, state, {refreshing: action.layers, refreshError: []});
    }
    case LAYERS_REFRESH_ERROR: {
        const newLayers = (state.refreshing || []).filter((layer) => {
            return action.layers.filter((l) => l.layer === layer.id).length === 0;
        });
        const errors = action.layers.map((err) => ({
            layer: err.fullLayer.title,
            error: action.error
        }));
        return Object.assign({}, state, {refreshing: newLayers, refreshError: [...(state.refreshError || []), ...errors]});
    }
    case LAYERS_REFRESHED: {
        const newLayers = (state.refreshing || []).filter((layer) => {
            return action.layers.filter((l) => l.layer === layer.id).length === 0;
        });
        return Object.assign({}, state, {refreshing: newLayers});
    }
    case REFRESH_SECURITY_LAYERS: {
        const newLayers = state?.flat?.map(l => {
            return l.security ? {
                ...l,
                security: {
                    ...l.security,
                    rand: uuidv1()
                }
            } : l;
        });
        return {
            ...state,
            flat: newLayers
        };
    }
    case CLEAR_SECURITY: {
        const newLayers = state?.flat?.map(l => {
            return l?.security?.sourceId === action.protectedId ? {
                ...l,
                security: undefined
            } : l;
        });
        return {
            ...state,
            flat: newLayers
        };
    }
    case CHANGE_LAYER_PARAMS:
    case CHANGE_LAYER_PROPERTIES: {
        const flatLayers = (state.flat || []);
        const backgroundLayer = flatLayers.find(layer => layer.id === action.layer && layer.group === 'background');
        // in case a background layer is changing the visibility to true
        // we should set false all the other ones
        const updateVisibility = !!action?.newProperties?.visibility;
        const updatedFlatLayers = !(backgroundLayer && updateVisibility)
            ? flatLayers
            : flatLayers.map((layer) => layer.group === 'background' &&
                (
                    (backgroundLayer.type === 'terrain' && layer.type === 'terrain')
                    || (backgroundLayer.type !== 'terrain' && layer.type !== 'terrain')
                )
                ? ({ ...layer, visibility: false })
                : layer
            );

        const newLayers = updatedFlatLayers.map((layer) => {
            if ( includes(castArray(action.layer), layer.id )) {
                return Object.assign(
                    {},
                    layer,
                    action.newProperties,
                    action.params
                        ? {
                            params: Object.assign({}, layer.params, action.params)
                        }
                        : {});
            }
            return Object.assign({}, layer);
        });
        return Object.assign({}, state, {flat: newLayers});
    }
    case CHANGE_GROUP_PROPERTIES: {
        let newLayers = state.flat.map((layer) => {
            const layerGroup = layer.group || DEFAULT_GROUP_ID;
            if (layerGroup === action.group || layerGroup.indexOf(`${action.group}.`) === 0) {
                return Object.assign({}, layer, action.newProperties);
            }
            return Object.assign({}, layer);
        });
        return Object.assign({}, state, {
            flat: newLayers
        });
    }
    case TOGGLE_NODE: {
        let nodeSelector = action.nodeType === 'layers' ? 'flat' : 'groups';
        let nodes = state[nodeSelector] || [];
        const newNodes = deepChange(nodes, action.node, 'expanded', action.status);
        return Object.assign({}, state, {[nodeSelector]: newNodes});
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
            return Object.assign({}, state, {groups: newNodes, flat: newLayers});
        }
        return state;
    }
    case REPLACE_LAYERS: {
        return {
            ...state,
            layers: action.layers
        };
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
            return Object.assign({}, state, {
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
        const newLayer = (layer.id) ? layer : Object.assign({}, layer, {id: getLayerId(layer)});
        newLayers.push(newLayer);
        const groupId = newLayer.group || DEFAULT_GROUP_ID;
        if (groupId !== "background") {
            newGroups = moveNode(newGroups, newLayer.id, groupId, newLayers, action.foreground);
        }
        let orderedNewLayers = sortLayers ? sortLayers(newGroups, newLayers) : newLayers;
        return Object.assign({}, state, {
            flat: orderedNewLayers,
            groups: newGroups
        });
    }
    case REMOVE_LAYER: {
        const newGroups = deepRemove(state.groups, action.layerId);
        const newLayers = state.flat.filter((layer) => layer.id !== action.layerId);
        return Object.assign({}, state, {
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
        return Object.assign({}, state, {
            groups: newGroups
        });
    }
    case SHOW_SETTINGS: {
        let settings = Object.assign({}, state.settings, {
            expanded: true,
            node: action.node,
            nodeType: action.nodeType,
            options: action.options
        });
        return Object.assign({}, state, {
            settings: settings,
            editLayerName: false,
            layerNameIsBeingChecked: false,
            layerNameChangeError: false
        });
    }
    case HIDE_SETTINGS: {
        let settings = Object.assign({}, state.settings, {
            expanded: false,
            node: null,
            nodeType: null,
            options: {}
        });
        return Object.assign({}, state, {
            settings: settings,
            editLayerName: false,
            layerNameIsBeingChecked: false,
            layerNameChangeError: false
        });
    }

    case UPDATE_SETTINGS: {
        const options = Object.assign({},
            state.settings && state.settings.options,
            action.options
        );
        const settings = Object.assign({}, state.settings, {options: options});
        return Object.assign({}, state, {
            settings: settings
        });
    }
    case CLEAR_LAYERS: {
        return Object.assign({}, state, {
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
        return Object.assign({}, state, {
            filter: action.text || ''
        });
    }
    case SHOW_LAYER_METADATA: {
        let layerMetadata = Object.assign({}, state.layerMetadata, {
            metadataRecord: action.metadataRecord,
            expanded: true,
            maskLoading: action.maskLoading
        });
        return Object.assign({}, state, {
            layerMetadata
        });
    }
    case HIDE_LAYER_METADATA: {
        let layerMetadata = Object.assign({}, state.layerMetadata, {
            metadataRecord: {},
            expanded: false
        });
        return Object.assign({}, state, {
            layerMetadata
        });
    }
    default:
        return state;
    }
}

export default layers;
