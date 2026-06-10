/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    AUTOREFRESH_TICK,
    AUTOREFRESH_START,
    AUTOREFRESH_STOP,
    AUTOREFRESH_UPDATE_ACTIVE_LAYER,
    AUTOREFRESH_UPDATE_AVAILABLE_LAYERS,
    AUTOREFRESH_DELETE_ACTIVE_LAYER,
    AUTOREFRESH_UPDATE_ACTIVE_LAYERS} from "../actions/autorefresh";


const defaultState = {
    enabled: false,
    availableLayers: {},
    activeLayers: {},
    ticks: {},
    archivedTicks: {}
};

const autorefresh = (state = {...defaultState}, action) => {
    const activeLayers = {...state.activeLayers};

    switch (action.type) {
    case AUTOREFRESH_START:
        return {
            ...state,
            enabled: true,
            ticks: {}
        };
    case AUTOREFRESH_STOP:
        return {
            ...state,
            enabled: false,
            archivedTicks: {
                ...state.archivedTicks,
                ...state.ticks
            }
        };
    case AUTOREFRESH_TICK:
        return {
            ...state,
            ticks: action.ticks,
            archivedTicks: {
                ...state.archivedTicks,
                ...action.ticks
            }
        };
    case AUTOREFRESH_UPDATE_ACTIVE_LAYERS:
        return {
            ...state,
            activeLayers: action.activeLayers,
            enabled: Object.keys(action.activeLayers).length > 0 && state.enabled ? state.enabled : false
        };
    case AUTOREFRESH_UPDATE_AVAILABLE_LAYERS:
        const availableLayers = {
            ...state.availableLayers,
            ...action.availableLayers
        };
        const actives = {
            ...state.activeLayers
        };

        Object.keys(availableLayers).forEach(layerId => {
            if (availableLayers[layerId].autorefreshInterval > -1) {
                actives[layerId] = availableLayers[layerId];
            }
            if (actives[layerId]) {
                delete availableLayers[layerId];
            }
        });

        return {
            ...state,
            availableLayers: availableLayers,
            activeLayers: actives
        };
    case AUTOREFRESH_UPDATE_ACTIVE_LAYER:
        if (action.layer.autorefreshInterval === -1) {
            delete activeLayers[action.layer.id];
        } else {
            activeLayers[action.layer.id] = {
                ...activeLayers[action.layer.id],
                ...action.layer
            };
        }

        return {
            ...state,
            activeLayers,
            enabled: Object.keys(activeLayers).length > 0 && state.enabled ? state.enabled : false
        };
    case AUTOREFRESH_DELETE_ACTIVE_LAYER:
        const al = {
            ...state.availableLayers
        };

        delete activeLayers[action.layerId];
        delete al[action.layerId];

        return {
            ...state,
            activeLayers,
            availableLayers: al,
            enabled: Object.keys(activeLayers).length > 0 && state.enabled ? state.enabled : false
        };
    default:
        return state;
    }
};

export default autorefresh;
