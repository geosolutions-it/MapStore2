/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const CHANGE_LAYER_PROPERTIES = 'CHANGE_LAYER_PROPERTIES';
const CHANGE_GROUP_PROPERTIES = 'CHANGE_GROUP_PROPERTIES';
const TOGGLE_NODE = 'TOGGLE_NODE';
const CONTEXT_NODE = 'CONTEXT_NODE';
const SORT_NODE = 'SORT_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const UPDATE_NODE = 'UPDATE_NODE';
const LAYER_LOADING = 'LAYER_LOADING';
const LAYER_LOAD = 'LAYER_LOAD';
const LAYER_ERROR = 'LAYER_ERROR';
const ADD_LAYER = 'ADD_LAYER';
const REMOVE_LAYER = 'REMOVE_LAYER';
const SHOW_SETTINGS = 'SHOW_SETTINGS';
const HIDE_SETTINGS = 'HIDE_SETTINGS';
const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
const REFRESH_LAYERS = 'REFRESH_LAYERS';
const LAYERS_REFRESHED = 'LAYERS_REFRESHED';
const LAYERS_REFRESH_ERROR = 'LAYERS_REFRESH_ERROR';
const BROWSE_DATA = 'LAYERS:BROWSE_DATA';
const CLEAR_LAYERS = 'LAYERS:CLEAR_LAYERS';
const SELECT_NODE = 'LAYERS:SELECT_NODE';
const FILTER_LAYERS = 'LAYERS:FILTER_LAYERS';
const SHOW_LAYER_METADATA = 'LAYERS:SHOW_LAYER_METADATA';
const HIDE_LAYER_METADATA = 'LAYERS:HIDE_LAYER_METADATA';

function showSettings(node, nodeType, options) {
    return {
        type: SHOW_SETTINGS,
        node: node,
        nodeType: nodeType,
        options: options
    };
}

function hideSettings() {
    return {
        type: HIDE_SETTINGS
    };
}

function updateSettings(options) {
    return {
        type: UPDATE_SETTINGS,
        options
    };
}

function changeLayerProperties(layer, properties) {
    return {
        type: CHANGE_LAYER_PROPERTIES,
        newProperties: properties,
        layer: layer

    };
}

function changeGroupProperties(group, properties) {
    return {
        type: CHANGE_GROUP_PROPERTIES,
        newProperties: properties,
        group: group

    };
}

function toggleNode(node, type, status) {
    return {
        type: TOGGLE_NODE,
        node: node,
        nodeType: type,
        status: !status
    };
}

function contextNode(node) {
    return {
        type: CONTEXT_NODE,
        node: node
    };
}

function sortNode(node, order, sortLayers = null) {
    return {
        type: SORT_NODE,
        node: node,
        order: order,
        sortLayers
    };
}

function removeNode(node, type, properties) {
    return {
        type: REMOVE_NODE,
        node: node,
        nodeType: type,
        properties
    };
}

function updateNode(node, type, options) {
    return {
        type: UPDATE_NODE,
        node: node,
        nodeType: type,
        options: options
    };
}

function layerLoading(layerId) {
    return {
        type: LAYER_LOADING,
        layerId: layerId
    };
}

function layerLoad(layerId, error) {
    return {
        type: LAYER_LOAD,
        layerId,
        error
    };
}

function layerError(layerId, tilesCount, tilesErrorCount) {
    return {
        type: LAYER_ERROR,
        layerId: layerId,
        tilesCount,
        tilesErrorCount
    };
}

function addLayer(layer, foreground = true) {
    return {
        type: ADD_LAYER,
        layer,
        foreground
    };
}

function removeLayer(layerId) {
    return {
        type: REMOVE_LAYER,
        layerId: layerId
    };
}
function refreshLayerVersion(layer, version) {
    return {
        type: CHANGE_LAYER_PROPERTIES,
        layer,
        newProperties: {
            _v_: version || new Date().getTime()
        }
    };
}
function refreshLayers(layers, options) {
    return {
        type: REFRESH_LAYERS,
        layers,
        options
    };
}

function layersRefreshed(layers) {
    return {
        type: LAYERS_REFRESHED,
        layers
    };
}

function layersRefreshError(layers, error) {
    return {
        type: LAYERS_REFRESH_ERROR,
        layers,
        error
    };
}
function browseData(layer) {
    return {
        type: BROWSE_DATA,
        layer
    };
}
function clearLayers() {
    return {
        type: CLEAR_LAYERS
    };
}

function selectNode(id, nodeType, ctrlKey) {
    return {
        type: SELECT_NODE,
        id,
        nodeType,
        ctrlKey
    };
}

function filterLayers(text) {
    return {
        type: FILTER_LAYERS,
        text
    };
}

function showLayerMetadata(metadataRecord, maskLoading) {
    return {
        type: SHOW_LAYER_METADATA,
        metadataRecord,
        maskLoading
    };
}

function hideLayerMetadata() {
    return {
        type: HIDE_LAYER_METADATA
    };
}

module.exports = {changeLayerProperties, changeGroupProperties, toggleNode, sortNode, removeNode, contextNode,
    updateNode, layerLoading, layerLoad, layerError, addLayer, removeLayer, showSettings, hideSettings, updateSettings, refreshLayers,
    layersRefreshed, layersRefreshError, refreshLayerVersion, browseData, clearLayers, selectNode, filterLayers, showLayerMetadata, hideLayerMetadata,
    CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES, TOGGLE_NODE, SORT_NODE,
    REMOVE_NODE, UPDATE_NODE, LAYER_LOADING, LAYER_LOAD, LAYER_ERROR, ADD_LAYER, REMOVE_LAYER,
    SHOW_SETTINGS, HIDE_SETTINGS, UPDATE_SETTINGS, CONTEXT_NODE, REFRESH_LAYERS, LAYERS_REFRESHED, LAYERS_REFRESH_ERROR, BROWSE_DATA, CLEAR_LAYERS, SELECT_NODE, FILTER_LAYERS, SHOW_LAYER_METADATA, HIDE_LAYER_METADATA
};
