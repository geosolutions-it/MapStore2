/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {
    ADD_PROFILE_DATA,
    CHANGE_CRS,
    CHANGE_CHART_TITLE,
    CHANGE_DISTANCE,
    CHANGE_GEOMETRY,
    CHANGE_REFERENTIAL,
    INITIALIZED,
    LOADING,
    SETUP,
    TEAR_DOWN,
    TOGGLE_MAXIMIZE,
    TOGGLE_MODE
} from "../actions/longitudinalProfile";
import { LONGITUDINAL_DISTANCES, DEFAULT_NODATA_THRESHOLD } from '../plugins/longitudinalProfile/constants';

const DEFAULT_STATE = {
    initialized: false,
    loading: false,
    maximized: false,
    mode: "idle",
    geometry: {},
    infos: {},
    points: [],
    projection: "",
    crsSelectedDXF: "EPSG:3857",
    config: {
        chartTitle: "",
        wpsurl: "/geoserver/wps",
        identifier: "gs:LongitudinalProfile",
        referentials: [],
        distances: LONGITUDINAL_DISTANCES,
        defaultDistance: 100,
        defaultReferentialName: ""
    }
};

export default function longitudinalProfile(state = DEFAULT_STATE, action) {
    const type = action.type;
    switch (type) {
    case ADD_PROFILE_DATA:
        const {
            infos,
            points,
            projection
        } = action;
        return {
            ...state,
            infos,
            points,
            projection
        };
    case CHANGE_DISTANCE:
        return {
            ...state,
            config: {
                ...state.config,
                distance: action.distance
            }
        };
    case CHANGE_CHART_TITLE:
        return {
            ...state,
            config: {
                ...state.config,
                chartTitle: action.chartTitle
            }
        };
    case CHANGE_CRS:
        return {
            ...state,
            crsSelectedDXF: action.crs
        };
    case CHANGE_GEOMETRY:
        return {
            ...state,
            geometry: action.geometry
        };
    case CHANGE_REFERENTIAL:
        return {
            ...state,
            config: {
                ...state.config,
                referential: action.referential
            }
        };
    case INITIALIZED:
        return {
            ...state,
            initialized: true
        };

    case LOADING:
        return {
            ...state,
            loading: action.state
        };
    case SETUP:
        return {
            ...state,
            config: {
                ...state.config,
                noDataThreshold: DEFAULT_NODATA_THRESHOLD,
                ...action.config
            }
        };
    case TOGGLE_MAXIMIZE:
        return {
            ...state,
            maximized: !state.maximized
        };
    case TOGGLE_MODE:
        return {
            ...state,
            mode: state.mode !== action.mode ? action.mode : "idle"
        };
    case TEAR_DOWN:
        return {
            ...DEFAULT_STATE,
            initialized: state.initialized,
            config: state.config
        };
    default:
        return state;
    }
}
