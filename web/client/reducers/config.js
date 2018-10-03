/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {MAP_CONFIG_LOADED, MAP_INFO_LOAD_START, MAP_INFO_LOADED, MAP_INFO_LOAD_ERROR, MAP_CONFIG_LOAD_ERROR} = require('../actions/config');
const {MAP_CREATED, DETAILS_LOADED} = require('../actions/maps');

const assign = require('object-assign');
const ConfigUtils = require('../utils/ConfigUtils');

function mapConfig(state = null, action) {
    let map;
    switch (action.type) {
    case MAP_CONFIG_LOADED:
        let size = state && state.map && state.map.present && state.map.present.size || state && state.map && state.map.size;

        let hasVersion = action.config && action.config.version >= 2;
            // we get from the configuration what will be used as the initial state
        let mapState = action.legacy && !hasVersion ? ConfigUtils.convertFromLegacy(action.config) : ConfigUtils.normalizeConfig(action.config.map);
        let newMapState = {
            ...mapState,
            layers: mapState.layers.map( l => {
                if (l.group === "background" && (l.type === "ol" || l.type === "OpenLayers.Layer")) {
                    l.type = "empty";
                }
                return l;
            })
        };
        newMapState.map = assign({}, newMapState.map, {mapId: action.mapId, size, version: hasVersion ? action.config.version : 1});
        // we store the map initial state for future usage
        return assign({}, newMapState, {mapInitialConfig: {...newMapState.map, mapId: action.mapId}});
    case MAP_CONFIG_LOAD_ERROR:
        return {
            loadingError: {...action.error, mapId: action.mapId}
        };
    case MAP_INFO_LOAD_START:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId === action.mapId) {
            map = assign({}, map, {info: {loading: true}});
            return assign({}, state, {map: map});
        }
        return state;
    case MAP_INFO_LOAD_ERROR: {
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId === action.mapId) {
            map = assign({}, map, {info: {error: action.error}});
            return assign({}, state, {map: map});
        }
        return state;
    }
    case MAP_INFO_LOADED:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId === action.mapId) {
            map = assign({}, map, {info: action.info});
            return assign({}, state, {map: map});
        }
        return state;
    case DETAILS_LOADED:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId.toString() === action.mapId.toString()) {
            map = assign({}, map, {
                info:
                    assign({}, map.info, {
                        details: action.detailsUri
                })
            });
            return assign({}, state, {map: map});
        }
        return state;
    case MAP_CREATED: {
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map) {
            const {name, description, canDelete = false, canCopy = false, canEdit= false} = action.metadata || {};
            // version needed to avoid automapupdate to start
            map = assign({}, map, {mapId: action.resourceId, info: {...map.info, name, description, canEdit, canDelete, canCopy}, version: 2});
            return assign({}, state, {map: map});
        }
    }
    default:
        return state;
    }
}

module.exports = mapConfig;
