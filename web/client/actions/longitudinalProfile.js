/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {SET_CONTROL_PROPERTY} from "../actions/controls";
import { CONTROL_DOCK_NAME } from '../plugins/longitudinalProfile/constants';

export const SETUP = "LONGITUDINAL_PROFILE:SETUP";
export const INITIALIZED = "LONGITUDINAL_PROFILE:INITIALIZED";
export const TEAR_DOWN = "LONGITUDINAL_PROFILE:TEAR_DOWN";
export const ADD_PROFILE_DATA = "LONGITUDINAL_PROFILE:ADD_PROFILE_DATA";
export const TOGGLE_MODE = "LONGITUDINAL_PROFILE:TOGGLE_MODE";
export const LOADING = "LONGITUDINAL_PROFILE:LOADING";
export const CHANGE_CRS = "LONGITUDINAL_PROFILE:CHANGE_CRS";
export const CHANGE_REFERENTIAL = "LONGITUDINAL_PROFILE:CHANGE_REFERENTIAL";
export const CHANGE_DISTANCE = "LONGITUDINAL_PROFILE:CHANGE_DISTANCE";
export const CHANGE_PITCH = "LONGITUDINAL_PROFILE:CHANGE_PITCH";
export const CHANGE_CHART_TITLE = "LONGITUDINAL_PROFILE:CHANGE_CHART_TITLE";
export const CHANGE_GEOMETRY = "LONGITUDINAL_PROFILE:CHANGE_GEOMETRY";
export const TOGGLE_MAXIMIZE = "LONGITUDINAL_PROFILE:TOGGLE_MAXIMIZE";
export const ADD_MARKER = "LONGITUDINAL_PROFILE:ADD_MARKER";
export const HIDE_MARKER = "LONGITUDINAL_PROFILE:HIDE_MARKER";

export const setup = (config) => ({
    type: SETUP,
    config
});

export const initialized = () => ({
    type: INITIALIZED
});

export const tearDown = () => ({
    type: TEAR_DOWN
});

export const openDock = () => ({
    type: SET_CONTROL_PROPERTY,
    control: CONTROL_DOCK_NAME,
    property: 'enabled',
    value: true
});

export const closeDock = () => ({
    type: SET_CONTROL_PROPERTY,
    control: CONTROL_DOCK_NAME,
    property: 'enabled',
    value: false
});

export const toggleMode = (mode) => ({
    type: TOGGLE_MODE,
    mode
});

export const addProfileData = (infos, points, projection) => ({
    type: ADD_PROFILE_DATA,
    infos,
    points,
    projection
});

export const loading = (state) => ({
    type: LOADING,
    state
});
export const changeCRS = (crs) => ({
    type: CHANGE_CRS,
    crs
});
export const changeReferential = (referential) => ({
    type: CHANGE_REFERENTIAL,
    referential
});
export const changeDistance = (distance) => ({
    type: CHANGE_DISTANCE,
    distance
});
export const changePitch = (pitch) => ({
    type: CHANGE_PITCH,
    pitch
});
export const changeChartTitle = (chartTitle) => ({
    type: CHANGE_CHART_TITLE,
    chartTitle
});
export const changeGeometry = (geometry) => ({
    type: CHANGE_GEOMETRY,
    geometry
});
export const toggleMaximize = () => ({
    type: TOGGLE_MAXIMIZE
});
export const addMarker = (point) => ({
    type: ADD_MARKER,
    point
});
export const hideMarker = () => ({
    type: HIDE_MARKER
});
