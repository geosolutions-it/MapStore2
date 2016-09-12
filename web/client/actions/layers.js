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
const SORT_NODE = 'SORT_NODE';
const REMOVE_NODE = 'REMOVE_NODE';
const UPDATE_NODE = 'UPDATE_NODE';
const LAYER_LOADING = 'LAYER_LOADING';
const LAYER_LOAD = 'LAYER_LOAD';
const INVALID_LAYER = 'INVALID_LAYER';
const ADD_LAYER = 'ADD_LAYER';
const SHOW_SETTINGS = 'SHOW_SETTINGS';
const HIDE_SETTINGS = 'HIDE_SETTINGS';
const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

// const DESCRIBE_LAYER_LOADED = 'DESCRIBE_LAYER_LOADED';
// const DESCRIBE_LAYER_LOAD_ERROR = 'DESCRIBE_LAYER_LOAD_ERROR';
const WMS = require('../api/WMS');
const WFS = require('../api/WFS');
const WCS = require('../api/WCS');
const _ = require('lodash');

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

function sortNode(node, order, sortLayers = null) {
    return {
        type: SORT_NODE,
        node: node,
        order: order,
        sortLayers
    };
}

function removeNode(node, type) {
    return {
        type: REMOVE_NODE,
        node: node,
        nodeType: type
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

function layerLoad(layerId) {
    return {
        type: LAYER_LOAD,
        layerId: layerId
    };
}

function addLayer(layer) {
    return {
        type: ADD_LAYER,
        layer
    };
}

function invalidLayer(layerType, options) {
    return {
        type: INVALID_LAYER,
        layerType,
        options
    };
}

function getDescribeLayer(url, layer, options) {
    return (dispatch /* , getState */) => {
        return WMS.describeLayer(url, layer.name, options).then((describeLayer) => {
            if (describeLayer && describeLayer.owsType === "WFS") {
                return WFS.describeFeatureType(url, describeLayer.name).then((describeFeatureType) => {
                    // TODO move the management of this geometryType in the proper components, getting the describeFeatureType entry:
                    let types = _.get(describeFeatureType, "complexType[0].complexContent.extension.sequence.element");
                    let geometryType = _.head(types && types.filter( elem => (elem.name === "the_geom" || elem.type.prefix.indexOf("gml") === 0)));
                    geometryType = geometryType && geometryType.type.localPart;
                    describeLayer.geometryType = geometryType && geometryType.split("PropertyType")[0];
                    return dispatch(updateNode(layer.id, "id", {describeLayer, describeFeatureType}));
                }).catch(() => {
                    return dispatch(updateNode(layer.id, "id", {describeLayer: describeLayer || {"error": "no describe feature found"}}));
                });
            } else if ( describeLayer && describeLayer.owsType === "WCS" ) {
                WCS.describeCoverage(url, describeLayer.name).then((describeCoverage) => {
                    // TODO move the management of this bands in the proper components, getting the describeFeatureType entry:
                    let axis = _.get(describeCoverage, "wcs:CoverageDescriptions.wcs:CoverageDescription.wcs:Range.wcs:Field.wcs:Axis.wcs:AvailableKeys.wcs:Key");
                    if (axis && typeof axis === "string") {
                        describeLayer.bands = [1 + ""];
                    } else {
                        describeLayer.bands = axis.map((el, index) => ((index + 1) + "")); // array of 1 2 3 because the sld do not recognize the name
                    }

                    dispatch(updateNode(layer.id, "id", {describeLayer, describeCoverage}));
                }).catch(() => {
                    return dispatch(updateNode(layer.id, "id", {describeLayer: describeLayer || {"error": "no describe coverage found"}}));
                });
            }
            return dispatch(updateNode(layer.id, "id", {describeLayer: describeLayer || {"error": "no describe Layer found"}}));

        });
    };
}

function getLayerCapabilities(layer, options) {
    // geoserver's specific.
    let reqUrl = layer.url;
    let urlParts = reqUrl.split("/geoserver/");
    if (urlParts.length === 2) {
        let layerParts = layer.name.split(":");
        if (layerParts.length === 2) {
            reqUrl = urlParts[0] + "/geoserver/" + layerParts [0] + "/" + layerParts[1] + "/" + urlParts[1];
        }

    }
    return (dispatch) => {
        // TODO, look ad current cached capabilities;
        return WMS.getCapabilities(reqUrl, options).then((capabilities) => {
            let layers = _.get(capabilities, "capability.layer.layer");
            let layerCapability;

            layerCapability = _.head(layers.filter( ( capability ) => {
                if (layer.name.split(":").length === 2 && capability.name.split(":").length === 2 ) {
                    return layer.name === capability.name;
                } else if (capability.name.split(":").length === 2) {
                    return (layer.name === capability.name.split(":")[1]);
                } else if (layer.name.split(":").length === 2) {
                    return layer.name.split(":")[1] === capability.name;
                }
                return layer.name === capability.name;
            }));
            if (layerCapability) {
                dispatch(updateNode(layer.id, "id", {capabilities: layerCapability, boundingBox: layerCapability.latLonBoundingBox}));
            }
            // return dispatch(updateNode(layer.id, "id", {capabilities: capabilities || {"error": "no describe Layer found"}}));

        }).catch((error) => {
            dispatch(updateNode(layer.id, "id", {capabilities: {error: "error getting capabilities", details: error}} ));

            // return dispatch(updateNode(layer.id, "id", {capabilities: capabilities || {"error": "no describe Layer found"}}));

        });
    };
}


module.exports = {changeLayerProperties, changeGroupProperties, toggleNode, sortNode, removeNode, invalidLayer,
    updateNode, layerLoading, layerLoad, addLayer, showSettings, hideSettings, updateSettings,
    getDescribeLayer, getLayerCapabilities,
    CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES, TOGGLE_NODE, SORT_NODE,
    REMOVE_NODE, UPDATE_NODE, LAYER_LOADING, LAYER_LOAD, ADD_LAYER,
    SHOW_SETTINGS, HIDE_SETTINGS, UPDATE_SETTINGS, INVALID_LAYER
};
