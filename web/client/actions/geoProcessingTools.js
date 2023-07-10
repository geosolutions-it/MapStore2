
/*
 * Copyright 2023 GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const CHECK_WPS_AVAILABILITY = "GPT:CHECK_WPS_AVAILABILITY";
export const CHECKING_WPS_AVAILABILITY = "GPT:CHECKING_WPS_AVAILABILITY";
export const CHECKED_WPS_AVAILABILITY = "GPT:CHECKED_WPS_AVAILABILITY";
export const GET_FEATURES = "GPT:GET_FEATURES";
export const ERROR_LOADING_DFT = "GPT:ERROR_LOADING_DFT";
export const SET_FEATURES = "GPT:SET_FEATURES";
export const SET_FEATURE_SOURCE_LOADING = "GPT:SET_FEATURE_SOURCE_LOADING";
export const SET_WPS_AVAILABILITY = "GPT:SET_WPS_AVAILABILITY";
export const SET_SELECTED_TOOL = "GPT:SET_SELECTED_TOOL";
export const SET_SOURCE_LAYER_ID = "GPT:SET_SOURCE_LAYER_ID";
export const SET_SOURCE_FEATURE_ID = "GPT:SET_SOURCE_FEATURE_ID";
export const SET_INTERSECTION_LAYER_ID = "GPT:SET_INTERSECTION_LAYER_ID";
/**
 * Actions for Geo Processing Tools
 * @memberof actions
 * @name GeoProcessingTools
 * @type {object}
 */

/**
 * action for checking WPS availability
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 * @param {string} source can be "source" or "intersection"
 */
export const checkWPSAvailability = (layerId, source) => ({
    type: CHECK_WPS_AVAILABILITY,
    layerId,
    source
});
/**
 * action for storing info of having checked WPS availability
 * @memberof actions.geoProcessingTools
 * @param  {boolean} status the status
 */
export const checkedWPSAvailability = (status) => ({
    type: CHECKED_WPS_AVAILABILITY,
    status
});
/**
 * action for setting the WPS availability
 * @memberof actions.geoProcessingTools
 * @param  {boolean} status the status
 */
export const checkingWPSAvailability = (status) => ({
    type: CHECKING_WPS_AVAILABILITY,
    status
});
/**
 * action for setting the WPS availability
 * @memberof actions.geoProcessingTools
 * @param  {boolean} status the status
 */
export const errorLoadingDFT = (layerId) => ({
    type: ERROR_LOADING_DFT,
    layerId
});
/**
 * action for triggering the get feature request given a source
 * @memberof actions.geoProcessingTools
 * @param {string} layerId the layer id
 * @param {string} source can be "source" or "intersection"
 */
export const getFeatures = (layerId, source) => ({
    type: GET_FEATURES,
    layerId,
    source
});
/**
 * action for triggering the set feature request given a source
 * @memberof actions.geoProcessingTools
 * @param {string} layerId the layer id
 * @param {string} source can be "source" or "intersection"
 */
export const setFeatures = (layerId, source, data) => ({
    type: SET_FEATURES,
    layerId,
    source,
    data
});
/**
 * action for the loading flag of the features
 * @memberof actions.geoProcessingTools
 * @param {string} status the status
 */
export const setFeatureSourceLoading = (status) => ({
    type: SET_FEATURE_SOURCE_LOADING,
    status
});

/**
 * action that sets if needed WPS are available (geo:Buffer and gs:IntersectionFeatureCollection, gs:CollectGeometries)
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 * @param  {boolean} status the status
 */
export const setWPSAvailability = (layerId, status) => ({
    type: SET_WPS_AVAILABILITY,
    layerId,
    status
});
/**
 * action that sets the tool
 * @memberof actions.geoProcessingTools
 * @param  {string} tool the tool id
 */
export const setSelectedTool = (tool) => ({
    type: SET_SELECTED_TOOL,
    tool
});
/**
 * action that sets the source layer id
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 */
export const setSourceLayerId = (layerId) => ({
    type: SET_SOURCE_LAYER_ID,
    layerId
});
/**
 * action that sets the source feature id
 * @memberof actions.geoProcessingTools
 * @param  {string} featureId the feature id
 */
export const setSourceFeatureId = (featureId) => ({
    type: SET_SOURCE_FEATURE_ID,
    featureId
});
/**
 * action that sets the intersection layer id
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 */
export const setIntersectionLayerId = (layerId) => ({
    type: SET_INTERSECTION_LAYER_ID,
    layerId
});
