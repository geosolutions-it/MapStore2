/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {CHANGE_MAP_VIEW, CHANGE_MOUSE_POINTER,
    CHANGE_ZOOM_LVL, CHANGE_MAP_CRS, CHANGE_MAP_SCALES, PAN_TO,
    CHANGE_MAP_STYLE, CHANGE_ROTATION, UPDATE_VERSION, ZOOM_TO_POINT,
    RESIZE_MAP, CHANGE_MAP_LIMITS, SET_MAP_RESOLUTIONS,
    TOGGLE_UNSAVED_MAP_CHANGES_DIALOG, REGISTER_EVENT_LISTENER, UNREGISTER_EVENT_LISTENER} = require('../actions/map');

var assign = require('object-assign');
var MapUtils = require('../utils/MapUtils');
var CoordinatesUtils = require('../utils/CoordinatesUtils');

function mapConfig(state = {eventListeners: {}}, action) {
    switch (action.type) {
    case CHANGE_MAP_VIEW:
        const {type, ...params} = action;
        return assign({}, state, params);
    case CHANGE_MOUSE_POINTER:
        return assign({}, state, {
            mousePointer: action.pointer
        });
    case CHANGE_ZOOM_LVL:
        return assign({}, state, {
            zoom: action.zoom,
            mapStateSource: action.mapStateSource
        });
    case CHANGE_MAP_LIMITS:
        return assign({}, state, {
            limits: {
                restrictedExtent: action.restrictedExtent,
                crs: action.crs,
                minZoom: action.minZoom
            }
        });
    case CHANGE_MAP_CRS:
        return assign({}, state, {
            projection: action.crs
        });
    case CHANGE_MAP_SCALES:
        if (action.scales) {
            const dpi = state && state.mapOptions && state.mapOptions.view && state.mapOptions.view.DPI || null;
            const resolutions = MapUtils.getResolutionsForScales(action.scales, state && state.projection || "EPSG:4326", dpi);
            // add or update mapOptions.view.resolutions
            return assign({}, state, {
                mapOptions: assign({}, state && state.mapOptions,
                    {
                        view: assign({}, state && state.mapOptions && state.mapOptions.view, {
                            resolutions: resolutions,
                            scales: action.scales
                        })
                    })
            });
        } else if (state && state.mapOptions && state.mapOptions.view && state.mapOptions.view && state.mapOptions.view.resolutions) {
            // TODO: this block is removing empty objects from the state, check if it really needed
            // deeper clone
            let newState = assign({}, state);
            newState.mapOptions = assign({}, newState.mapOptions);
            newState.mapOptions.view = assign({}, newState.mapOptions.view);
            // remove resolutions
            delete newState.mapOptions.view.resolutions;
            // cleanup state
            if (Object.keys(newState.mapOptions.view).length === 0) {
                delete newState.mapOptions.view;
            }
            if (Object.keys(newState.mapOptions).length === 0) {
                delete newState.mapOptions;
            }
            return newState;
        }
        return state;
    case SET_MAP_RESOLUTIONS: {
        return assign({}, state, {
            resolutions: action.resolutions
        });
    }
    case ZOOM_TO_POINT: {
        return assign({}, state, {
            center: CoordinatesUtils.reproject(action.pos, action.crs, 'EPSG:4326'),
            zoom: action.zoom,
            mapStateSource: null
        });
    }
    case PAN_TO: {
        // action.center now can be also an array (with the coord specified in 4326)
        const center = CoordinatesUtils.reproject(
            action.center,
            action.center.crs || 'EPSG:4326',
            'EPSG:4326');
        return assign({}, state, {
            center,
            mapStateSource: null
        });
    }
    case CHANGE_MAP_STYLE: {
        return assign({}, state, {mapStateSource: action.mapStateSource, style: action.style, resize: state.resize ? state.resize + 1 : 1});
    }
    case RESIZE_MAP: {
        return assign({}, state, {resize: state.resize ? state.resize + 1 : 1});
    }
    case CHANGE_ROTATION: {
        let newBbox = assign({}, state.bbox, {rotation: action.rotation});
        return assign({}, state, {bbox: newBbox, mapStateSource: action.mapStateSource});
    }
    case UPDATE_VERSION: {
        return assign({}, state, {version: action.version});
    }
    case TOGGLE_UNSAVED_MAP_CHANGES_DIALOG: {
        return assign({}, state, { showUnsavedMapChangesDialog: !(state && state.showUnsavedMapChangesDialog) });
    }
    case REGISTER_EVENT_LISTENER: {
        return assign({}, state,
            {eventListeners: assign({}, state.eventListeners || {},
                {[action.eventName]: [...(state.eventListeners && state.eventListeners[action.eventName] || []), action.toolName]})});
    }
    case UNREGISTER_EVENT_LISTENER: {
        let data = state;
        if (state.eventListeners) {
            const filteredEventNameTools = state.eventListeners[action.eventName].filter(tool => tool !== action.toolName) || [];
            data = assign({}, state,
                {eventListeners: assign({}, state.eventListeners,
                    {[action.eventName]: filteredEventNameTools})});
        }
        return data;
    }
    default:
        return state;
    }
}

module.exports = mapConfig;
