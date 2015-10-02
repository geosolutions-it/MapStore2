/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, CHANGE_LAYER_PROPERTIES} = require('../actions/config');
var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER, CHANGE_ZOOM_LVL, LAYER_LOADING, LAYER_LOAD} = require('../actions/map');

var ConfigUtils = require('../utils/ConfigUtils');
var assign = require('object-assign');

function mapConfig(state = null, action) {
    switch (action.type) {
        case MAP_CONFIG_LOADED:
            return action.legacy ? ConfigUtils.convertFromLegacy(action.config) : ConfigUtils.normalizeConfig(action.config.map);
        case MAP_CONFIG_LOAD_ERROR:
            return {
                loadingError: action.error
            };
        case CHANGE_MAP_VIEW:
            return assign({}, state, {
                center: action.center,
                zoom: action.zoom,
                bbox: action.bbox,
                size: action.size,
                mapStateSource: action.mapStateSource
            });
        case CHANGE_LAYER_PROPERTIES: {
            let layers = state.layers.slice(0);
            if (layers[action.position].visibility !== action.newProperties.visibility && action.newProperties.group === "background") {
                layers = layers.map(layer => {
                    let newLayer = assign({}, layer);
                    if (newLayer.group === "background") {
                        newLayer.visibility = false;
                    }
                    return newLayer;
                } );
            }
            layers[action.position] = action.newProperties;
            return assign({}, state, {
                layers: layers
            });
        }
        case CHANGE_MOUSE_POINTER:
            return assign({}, state, {
                mousePointer: action.pointer
            });
        case CHANGE_ZOOM_LVL:
            return assign({}, state, {
                zoom: action.zoom,
                mapStateSource: action.mapStateSource
            });
        case LAYER_LOADING: {
            let loadingLayers = (state && state.loadingLayers && state.loadingLayers.splice(0)) || [];
            loadingLayers.push(action.layerId);
            return assign({}, state, {
                loadingLayers: loadingLayers
            });
        }
        case LAYER_LOAD: {
            let loadingLayers = (state && state.loadingLayers && state.loadingLayers.splice(0)) || [];
            loadingLayers = loadingLayers.filter((el) => {
                return el !== action.layerId;
            });
            return assign({}, state, {
                loadingLayers: loadingLayers
            });
        }
        default:
            return state;
    }
}

module.exports = mapConfig;
