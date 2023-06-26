/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import {updateAdditionalLayer} from "../actions/additionallayers";
import {SET_CONTROL_PROPERTY} from "../actions/controls";
import {
    updateDockPanelsList
} from "../actions/maplayout";
import {error} from "../actions/notifications";
import {
    CONTROL_DOCK_NAME,
    LONGITUDINAL_OWNER,
    LONGITUDINAL_VECTOR_LAYER_ID,
    LONGITUDINAL_VECTOR_LAYER_ID_POINT
} from '../plugins/longitudinalProfile/constants';
import {configSelector} from "../selectors/longitudinalProfile";

export const ADD_MARKER = "LONGITUDINAL_PROFILE:ADD_MARKER";
export const ADD_PROFILE_DATA = "LONGITUDINAL_PROFILE:ADD_PROFILE_DATA";
export const CHANGE_CHART_TITLE = "LONGITUDINAL_PROFILE:CHANGE_CHART_TITLE";
export const CHANGE_CRS = "LONGITUDINAL_PROFILE:CHANGE_CRS";
export const CHANGE_DISTANCE = "LONGITUDINAL_PROFILE:CHANGE_DISTANCE";
export const CHANGE_GEOMETRY = "LONGITUDINAL_PROFILE:CHANGE_GEOMETRY";
export const CHANGE_REFERENTIAL = "LONGITUDINAL_PROFILE:CHANGE_REFERENTIAL";
export const HIDE_MARKER = "LONGITUDINAL_PROFILE:HIDE_MARKER";
export const INITIALIZED = "LONGITUDINAL_PROFILE:INITIALIZED";
export const LOADING = "LONGITUDINAL_PROFILE:LOADING";
export const SETUP = "LONGITUDINAL_PROFILE:SETUP";
export const TEAR_DOWN = "LONGITUDINAL_PROFILE:TEAR_DOWN";
export const TOGGLE_MAXIMIZE = "LONGITUDINAL_PROFILE:TOGGLE_MAXIMIZE";
export const TOGGLE_MODE = "LONGITUDINAL_PROFILE:TOGGLE_MODE";

/**
 * add a vector point layer with a marker style on the map (used to trigger an epic stream)
 * @prop {Object} point
 * @prop {Object} point.lat latitude
 * @prop {Object} point.lng longitude
 * @prop {Object} point.projection the crs of the point // [ ] not sure this is needed
 */
export const addMarker = (point) => ({
    type: ADD_MARKER,
    point
});

/**
 * add profile data results in the state
 * @prop {Object} infos
 * @prop {Object[]} points the list of points used to draw the line chart
 * @prop {string} projection output projection
 */
export const addProfileData = (infos, points, projection) => ({
    type: ADD_PROFILE_DATA,
    infos,
    points,
    projection
});

/**
 * action used to change the chart title
 * @prop {string} chartTitle the chart title
 */
export const changeChartTitle = (chartTitle) => ({
    type: CHANGE_CHART_TITLE,
    chartTitle
});

/**
 * action used to change the crs to be associated to the DXF
 * @prop {string} crs the crs to be associated to the DXF
 */
export const changeCRS = (crs) => ({
    type: CHANGE_CRS,
    crs
});

/**
 * action used to change the distance
 * @prop {number} distance the distance to use to calculate points for the profile
 */
export const changeDistance = (distance) => ({
    type: CHANGE_DISTANCE,
    distance
});

/**
 * action used to change the geometry
 * @prop {Object} geometry the geometry object of a GeoJSON Feature
 */
export const changeGeometry = (geometry) => ({
    type: CHANGE_GEOMETRY,
    geometry
});

/**
 * action used to change the referential
 * @prop {string} referential the layer name to be used in the wps process
 */
export const changeReferential = (referential) => ({
    type: CHANGE_REFERENTIAL,
    referential
});

/**
 * action used to close the dock panel
 */
export const closeDock = () => ({
    type: SET_CONTROL_PROPERTY,
    control: CONTROL_DOCK_NAME,
    property: 'enabled',
    value: false
});

/**
 * action used to hide the marker when hovering the line chart
 */
export const hideMarker = () => ({
    type: HIDE_MARKER
});

/**
 * action used to complete setup phase
 */
export const initialized = () => ({
    type: INITIALIZED
});

/**
 * action used to manage loading status
 * @prop {boolean} state the flag used to manage loading status
 */
export const loading = (state) => ({
    type: LOADING,
    state
});

/**
 * action used to open the dock panel
 */
export const openDock = () => ({
    type: SET_CONTROL_PROPERTY,
    control: CONTROL_DOCK_NAME,
    property: 'enabled',
    value: true
});

/**
 * action used to setup the the config of the longitudinal profile plugin
 * @prop {Object} config the properties of the config (see Plugin documentation)
 */
export const setupPlugin = (config) => {
    return {
        type: SETUP,
        config
    };
};

/**
 * action used to show a notification error message
 * @prop {string} message the message id to use with a localized string
 */
export const showError = (message) => error({
    message: message,
    title: "errorTitleDefault",
    position: "tc",
    autoDismiss: 10
});

/**
 * action used to deactivate the plugin
 */
export const tearDown = () => ({
    type: TEAR_DOWN
});

/**
 * action used to toggle maximize state of the chart
 */
export const toggleMaximize = () => ({
    type: TOGGLE_MAXIMIZE
});

/**
 * action used to change the referential
 * @prop {string} mode the mode to use for providing the linestring, can be "idle", "draw", "import"
 */
export const toggleMode = (mode) => ({
    type: TOGGLE_MODE,
    mode
});
/**
 * action used to setup
 */
export const setup = (config) => {
    return (dispatch, getState) => {
        dispatch(setupPlugin(config));
        const { referentials, distances, defaultDistance, defaultReferentialName } = config || configSelector(getState());
        const defaultReferential = referentials.find(el => el.layerName === defaultReferentialName);
        if (defaultReferentialName && !defaultReferential) {
            dispatch(error({ title: "Error", message: "longitudinalProfile.errors.defaultReferentialNotFound", autoDismiss: 10 }));
        }

        dispatch(updateDockPanelsList(CONTROL_DOCK_NAME, "add", "right"));
        dispatch(changeReferential(defaultReferentialName ?? referentials[0].layerName));
        dispatch(changeDistance(defaultDistance ?? distances[0]));
        dispatch(updateAdditionalLayer(
            LONGITUDINAL_VECTOR_LAYER_ID,
            LONGITUDINAL_OWNER,
            'overlay',
            {
                id: LONGITUDINAL_VECTOR_LAYER_ID,
                features: [],
                type: "vector",
                name: "selectedLine",
                visibility: true
            }));
        dispatch(updateAdditionalLayer(
            LONGITUDINAL_VECTOR_LAYER_ID_POINT,
            LONGITUDINAL_OWNER,
            'overlay',
            {
                id: LONGITUDINAL_VECTOR_LAYER_ID_POINT,
                features: [],
                type: "vector",
                name: "point",
                visibility: true
            }));
        dispatch(initialized());
    };
};
