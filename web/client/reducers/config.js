/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    MAP_CONFIG_LOADED,
    MAP_INFO_LOAD_START,
    MAP_INFO_LOADED,
    MAP_INFO_LOAD_ERROR,
    MAP_CONFIG_LOAD_ERROR,
    MAP_SAVE_ERROR,
    MAP_SAVED,
    RESET_MAP_SAVE_ERROR
} from '../actions/config';

import { MAP_CREATED } from '../actions/maps';
import { DETAILS_LOADED } from '../actions/details';
import { MAP_TYPE_CHANGED, VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import assign from 'object-assign';
import ConfigUtils from '../utils/ConfigUtils';
import { set, unset } from '../utils/ImmutableUtils';
import { normalizeLayer } from '../utils/LayersUtils';
import { castArray } from 'lodash';
import {
    getVisualizationModeFromMapLibrary,
    VisualizationModes
} from '../utils/MapTypeUtils';

function mapConfig(state = null, action) {
    let map;
    switch (action.type) {
    case LOCATION_CHANGE: {
        if (action?.payload?.action === 'REPLACE') {
            return state;
        }
        return {
            ...state,
            mapInitialConfig: {}
        };
    }
    case MAP_CONFIG_LOADED:
        let size = state && state.map && state.map.present && state.map.present.size || state && state.map && state.map.size;
        // bbox is taken from the state to keep widgets having correct dataset after map is saved or saved as.
        // bbox is not getting written to the map configuration on backend
        let bbox = state && state.map && state.map.present && state.map.present.bbox || state && state.map && state.map.bbox;

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
            }).map(normalizeLayer),
            mapConfigRawData: { ...action.config }
        };
        // if map is loaded from an already saved map keep the same id
        let mapId = state?.map?.mapId || state?.map?.present?.mapId;
        mapId = action.config?.fileName && mapId ? mapId : action.mapId;
        newMapState.map = assign({}, newMapState.map, {mapId, size, bbox, version: hasVersion ? action.config.version : 1});
        // we store the map initial state for future usage
        return assign({}, newMapState, {mapInitialConfig: {...newMapState.map, mapId: action.mapId}});
    case MAP_CONFIG_LOAD_ERROR:
        return {
            loadingError: {...action.error, mapId: action.mapId}
        };
    case MAP_INFO_LOAD_START:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId === action.mapId) {
            map = assign({}, map, {loadingInfo: true});
            return assign({}, state, {map: map});
        }
        return state;
    case MAP_INFO_LOAD_ERROR: {
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId === action.mapId) {
            map = assign({}, map, {loadingInfoError: action.error, loadingInfo: false});
            return assign({}, state, {map: map});
        }
        return state;
    }
    case MAP_INFO_LOADED:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && (`${map.mapId}` === `${action.mapId}` || !map.mapId && !action.mapId)) {
            map = assign({}, map, {info: action.merge ? {
                ...map.info,
                ...action.info
            } : action.info, loadingInfo: false});
            return assign({}, state, {map: map});
        }
        return state;
    case DETAILS_LOADED:
        let dashboardResource = state.dashboard?.resource;
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map && map.mapId?.toString() === action.id.toString()) {
            map = {
                ...map,
                info: {
                    ...map.info,
                    attributes: {
                        ...map.info?.attributes,
                        details: action.detailsUri || map.info?.attributes?.details,
                        detailsSettings: action.detailsSettings || map.info?.attributes?.detailsSettings
                    }
                }
            };
            return assign({}, state, {map: map});
        } else if (dashboardResource && dashboardResource.id?.toString() === action.id.toString()) {
            dashboardResource = assign({}, dashboardResource, {
                attributes:
                    assign({}, dashboardResource.attributes, {
                        details: action.detailsUri,
                        detailsSettings: action.detailsSettings
                    })
            });
            return assign({}, state, {dashboard: {
                ...state.dashboard, resource: dashboardResource
            }});
        }
        return state;
    case MAP_CREATED: {
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        if (map) {
            const {name, description, canDelete = false, canCopy = false, canEdit = false} = action.metadata || {};
            // version needed to avoid automapupdate to start
            map = assign({}, map, {mapId: action.resourceId, info: {...map.info, name, description, canEdit, canDelete, canCopy}, version: 2});
            return assign({}, state, {map: map});
        }
        return state;
    }
    case MAP_SAVE_ERROR:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        map = set('mapSaveErrors', castArray(action.error), map);
        return assign({}, state, {map: map});
    case MAP_SAVED:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        map = unset('mapSaveErrors', map);
        return assign({}, state, {map: map});
    case RESET_MAP_SAVE_ERROR:
        map = state?.map?.present || state?.map;
        map = unset('mapSaveErrors', map);
        return {...state, map};
    case VISUALIZATION_MODE_CHANGED:
    case MAP_TYPE_CHANGED:
        map = state && state.map && state.map.present ? state.map.present : state && state.map;
        const visualizationMode = action.mapType !== undefined
            ? getVisualizationModeFromMapLibrary(action.mapType)
            : action.visualizationMode || VisualizationModes._2D;
        map = set('visualizationMode', visualizationMode, map);
        return { ...state, map };
    default:
        return state;
    }
}

export default mapConfig;
