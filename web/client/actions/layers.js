/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const CHANGE_LAYER_PROPERTIES = 'CHANGE_LAYER_PROPERTIES';
export const CHANGE_LAYER_PARAMS = 'LAYERS:CHANGE_LAYER_PARAMS';
export const CHANGE_GROUP_PROPERTIES = 'CHANGE_GROUP_PROPERTIES';
export const TOGGLE_NODE = 'TOGGLE_NODE';
export const CONTEXT_NODE = 'CONTEXT_NODE';
export const SORT_NODE = 'SORT_NODE';
export const REMOVE_NODE = 'REMOVE_NODE';
export const UPDATE_NODE = 'UPDATE_NODE';
export const MOVE_NODE = 'MOVE_NODE';
export const LAYER_LOADING = 'LAYER_LOADING';
export const LAYER_LOAD = 'LAYER_LOAD';
export const LAYER_ERROR = 'LAYER_ERROR';
export const ADD_LAYER = 'ADD_LAYER';
export const ADD_GROUP = 'ADD_GROUP';
export const REMOVE_LAYER = 'REMOVE_LAYER';
export const SHOW_SETTINGS = 'SHOW_SETTINGS';
export const HIDE_SETTINGS = 'HIDE_SETTINGS';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export const REFRESH_LAYERS = 'REFRESH_LAYERS';
export const UPDATE_LAYERS_DIMENSION = 'LAYERS:UPDATE_LAYERS_DIMENSION';
export const LAYERS_REFRESHED = 'LAYERS_REFRESHED';
export const LAYERS_REFRESH_ERROR = 'LAYERS_REFRESH_ERROR';
export const BROWSE_DATA = 'LAYERS:BROWSE_DATA';
export const DOWNLOAD = 'LAYERS:DOWNLOAD';
export const CLEAR_LAYERS = 'LAYERS:CLEAR_LAYERS';
export const SELECT_NODE = 'LAYERS:SELECT_NODE';
export const FILTER_LAYERS = 'LAYERS:FILTER_LAYERS';
export const SHOW_LAYER_METADATA = 'LAYERS:SHOW_LAYER_METADATA';
export const HIDE_LAYER_METADATA = 'LAYERS:HIDE_LAYER_METADATA';
export const UPDATE_SETTINGS_PARAMS = 'LAYERS:UPDATE_SETTINGS_PARAMS';
export const REPLACE_LAYERS = 'LAYERS:REPLACE_LAYERS';

/**
 * full replacement of layers in layers state
 * @param {object[]} layers the new layers to replace in the state
 */
export function replaceLayers(layers) {
    return {
        type: REPLACE_LAYERS,
        layers
    };
}
export function showSettings(node, nodeType, options) {
    return {
        type: SHOW_SETTINGS,
        node: node,
        nodeType: nodeType,
        options: options
    };
}

export function hideSettings() {
    return {
        type: HIDE_SETTINGS
    };
}

export function updateSettings(options) {
    return {
        type: UPDATE_SETTINGS,
        options
    };
}

export function changeLayerProperties(layer, properties) {
    return {
        type: CHANGE_LAYER_PROPERTIES,
        newProperties: properties,
        layer: layer

    };
}

/**
 * Change params for a layer. Useful for WMS layers, when you need to change only the params (i.e. dimension) merging with existing ones.
 * @memberof actions.layers
 export * @function
 * @param {string|string[]} layer id(s) of the layers to change
 * @param {object} params the params to change
 */
export function changeLayerParams(layer, params) {
    return {
        type: CHANGE_LAYER_PARAMS,
        layer,
        params
    };
}

export function changeGroupProperties(group, properties) {
    return {
        type: CHANGE_GROUP_PROPERTIES,
        newProperties: properties,
        group: group

    };
}

export function toggleNode(node, type, status) {
    return {
        type: TOGGLE_NODE,
        node: node,
        nodeType: type,
        status: !status
    };
}

export function contextNode(node) {
    return {
        type: CONTEXT_NODE,
        node: node
    };
}

export function sortNode(node, order, sortLayers = null) {
    return {
        type: SORT_NODE,
        node: node,
        order: order,
        sortLayers
    };
}

export function removeNode(node, type, removeEmpty = false) {
    return {
        type: REMOVE_NODE,
        node: node,
        nodeType: type,
        removeEmpty
    };
}

export function updateNode(node, type, options) {
    return {
        type: UPDATE_NODE,
        node: node,
        nodeType: type,
        options: options
    };
}

/**
 * Move a node in state.groups from one parent to another
 * @memberof actions.layers
 export * @function
 * @param {object} node an id of a node to move
 * @param {object} groupId an id of a group node to move current node into
 * @param {number} index a position that inserted node should have(ordering)
 */
export function moveNode(node, groupId, index) {
    return {
        type: MOVE_NODE,
        node,
        groupId,
        index
    };
}

export function layerLoading(layerId) {
    return {
        type: LAYER_LOADING,
        layerId: layerId
    };
}

export function layerLoad(layerId, error) {
    return {
        type: LAYER_LOAD,
        layerId,
        error
    };
}

export function layerError(layerId, tilesCount, tilesErrorCount) {
    return {
        type: LAYER_ERROR,
        layerId: layerId,
        tilesCount,
        tilesErrorCount
    };
}

export function addLayer(layer, foreground = true) {
    return {
        type: ADD_LAYER,
        layer,
        foreground
    };
}
/**
 * Add a new group
 * @memberof actions.layers
 export * @function
 * @param {string} group title of group
 * @param {string} parent parent group described with dot notation (eg parent.nested )
 * @param {object} options Additional properties to assign to the group. They will override the default ones.
 * @param {boolean} asFirst added at the top of the groups
 */
export function addGroup(group, parent, options, asFirst = false) {
    return {
        type: ADD_GROUP,
        group,
        parent,
        options,
        asFirst
    };
}

export function removeLayer(layerId) {
    return {
        type: REMOVE_LAYER,
        layerId: layerId
    };
}
export function refreshLayerVersion(layer, version) {
    return {
        type: CHANGE_LAYER_PROPERTIES,
        layer,
        newProperties: {
            _v_: version || new Date().getTime()
        }
    };
}
export function refreshLayers(layers, options) {
    return {
        type: REFRESH_LAYERS,
        layers,
        options
    };
}

export function layersRefreshed(layers) {
    return {
        type: LAYERS_REFRESHED,
        layers
    };
}

export function layersRefreshError(layers, error) {
    return {
        type: LAYERS_REFRESH_ERROR,
        layers,
        error
    };
}
export function updateLayerDimension(dimension, value, options, layers) {
    return {
        type: UPDATE_LAYERS_DIMENSION,
        dimension,
        value,
        options,
        layers
    };
}
export function browseData(layer) {
    return {
        type: BROWSE_DATA,
        layer
    };
}
export function download(layer) {
    return {
        type: DOWNLOAD,
        layer
    };
}
export function clearLayers() {
    return {
        type: CLEAR_LAYERS
    };
}

export function selectNode(id, nodeType, ctrlKey) {
    return {
        type: SELECT_NODE,
        id,
        nodeType,
        ctrlKey
    };
}

export function filterLayers(text) {
    return {
        type: FILTER_LAYERS,
        text
    };
}

export function showLayerMetadata(metadataRecord, maskLoading) {
    return {
        type: SHOW_LAYER_METADATA,
        metadataRecord,
        maskLoading
    };
}

export function hideLayerMetadata() {
    return {
        type: HIDE_LAYER_METADATA
    };
}

export function updateSettingsParams(newParams, update) {
    return {
        type: UPDATE_SETTINGS_PARAMS,
        newParams,
        update
    };
}
