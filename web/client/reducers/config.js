/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {MAP_CONFIG_LOADED, MAP_CONFIG_LOAD_ERROR, CHANGE_LAYER_PROPERTIES, CHANGE_GROUP_PROPERTIES} = require('../actions/config');
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
            let isBackground = state.layers.reduce(
                    (background, layer) => background || (layer.name === action.layer && layer.group === 'background'),
            false);
            let layers = state.layers.map((layer) => {
                if (layer.name === action.layer) {
                    return assign({}, layer, action.newProperties);
                } else if (layer.group === 'background' && isBackground && action.newProperties.visibility) {
                    // TODO remove
                    return assign({}, layer, {visibility: false});
                }
                return assign({}, layer);
            });
            return assign({}, state, {
                layers: layers
            });
        }
        case CHANGE_GROUP_PROPERTIES: {
            let layers = state.layers.map((layer) => {
                if (layer.group === action.group || layer.group.indexOf(action.group + ".") === 0) {
                    return assign({}, layer, action.newProperties);
                }
                return assign({}, layer);
            });
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
        default:
            return state;
    }
}

module.exports = mapConfig;
