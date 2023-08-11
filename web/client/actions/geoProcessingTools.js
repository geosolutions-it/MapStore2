
/*
 * Copyright 2023 GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const GPT_TOOL_BUFFER = "buffer";
export const GPT_TOOL_INTERSECTION = "intersection";
export const GPT_CONTROL_NAME = "GeoProcessingTools";

export const CHECK_WPS_AVAILABILITY = "GPT:CHECK_WPS_AVAILABILITY";
export const CHECKING_WPS_AVAILABILITY = "GPT:CHECKING_WPS_AVAILABILITY";
export const CHECKING_WPS_AVAILABILITY_INTERSECTION = "GPT:CHECKING_WPS_AVAILABILITY_INTERSECTION";
export const CHECKED_WPS_AVAILABILITY = "GPT:CHECKED_WPS_AVAILABILITY";
export const GET_FEATURES = "GPT:GET_FEATURES";
export const ERROR_LOADING_DFT = "GPT:ERROR_LOADING_DFT";
export const INIT_PLUGIN = "GPT:INIT_PLUGIN";
export const INCREASE_BUFFERED_COUNTER = "GPT:INCREASE_BUFFERED_COUNTER";
export const INCREASE_INTERSECT_COUNTER = "GPT:INCREASE_INTERSECT_COUNTER";
export const RUNNING_PROCESS = "GPT:RUNNING_PROCESS";
export const RUN_BUFFER_PROCESS = "GPT:RUN_BUFFER_PROCESS";
export const RUN_INTERSECTION_PROCESS = "GPT:RUN_INTERSECTION_PROCESS";
export const SET_BUFFER_DISTANCE = "GPT:SET_BUFFER_DISTANCE";
export const SET_BUFFER_DISTANCE_UOM = "GPT:SET_BUFFER_DISTANCE_UOM";
export const SET_BUFFER_QUADRANT_SEGMENTS = "GPT:SET_BUFFER_QUADRANT_SEGMENTS";
export const SET_BUFFER_CAP_STYLE = "GPT:SET_BUFFER_CAP_STYLE";
export const SET_FEATURES = "GPT:SET_FEATURES";
export const SET_FEATURE_SOURCE_LOADING = "GPT:SET_FEATURE_SOURCE_LOADING";
export const SET_FEATURE_INTERSECTION_LOADING = "GPT:SET_FEATURE_INTERSECTION_LOADING";
export const SET_INVALID_LAYER = "GPT:SET_INVALID_LAYER";
export const SET_WPS_AVAILABILITY = "GPT:SET_WPS_AVAILABILITY";
export const SET_SELECTED_TOOL = "GPT:SET_SELECTED_TOOL";
export const SET_SOURCE_LAYER_ID = "GPT:SET_SOURCE_LAYER_ID";
export const SET_SOURCE_FEATURE = "GPT:SET_SOURCE_FEATURE";
export const SET_SOURCE_FEATURE_ID = "GPT:SET_SOURCE_FEATURE_ID";
export const SET_INTERSECTION_LAYER_ID = "GPT:SET_INTERSECTION_LAYER_ID";
export const SET_INTERSECTION_FEATURE_ID = "GPT:SET_INTERSECTION_FEATURE_ID";
export const SET_INTERSECTION_FEATURE = "GPT:SET_INTERSECTION_FEATURE";
export const SET_INTERSECTION_FIRST_ATTRIBUTE = "GPT:SET_INTERSECTION_FIRST_ATTRIBUTE";
export const SET_INTERSECTION_SECOND_ATTRIBUTE = "GPT:SET_INTERSECTION_SECOND_ATTRIBUTE";
export const SET_INTERSECTION_MODE = "GPT:SET_INTERSECTION_MODE";
export const SET_INTERSECTION_PERCENTAGES_ENABLED = "GPT:SET_INTERSECTION_PERCENTAGES_ENABLED";
export const SET_INTERSECTION_AREAS_ENABLED = "GPT:SET_INTERSECTION_AREAS_ENABLED";
export const SET_SELECTED_LAYER_TYPE = "GPT:SET_SELECTED_LAYER_TYPE";
export const TOGGLE_HIGHLIGHT_LAYERS = "GPT:TOGGLE_HIGHLIGHT_LAYERS";

/**
 * Actions for Geo Processing Tools
 * @memberof actions
 * @name GeoProcessingTools
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
export const checkingIntersectionWPSAvailability = (status) => ({
    type: CHECKING_WPS_AVAILABILITY_INTERSECTION,
    status
});
/**
 * action for setting the error loading the describe feature type
 * @memberof actions.geoProcessingTools
 * @param  {boolean} layerId the layerId
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
export const getFeatures = (layerId, source, page = 0) => ({
    type: GET_FEATURES,
    layerId,
    source,
    page
});
/**
 * action for initializing config of the plugin
 * @memberof actions.geoProcessingTools
  */
export const initPlugin = (cfg) => ({
    type: INIT_PLUGIN,
    cfg
});
/**
 * action for triggering the increase of the number of buffered layers
 * @memberof actions.geoProcessingTools
  */
export const increaseBufferedCounter = () => ({
    type: INCREASE_BUFFERED_COUNTER
});
/**
 * action for triggering the increase of the number of intersected layers
 * @memberof actions.geoProcessingTools
  */
export const increaseIntersectedCounter = () => ({
    type: INCREASE_INTERSECT_COUNTER
});
/**
 * action for changing the flag of the process running
 * @param {boolean} status the status
 * @memberof actions.geoProcessingTools
 */
export const runningProcess = (status) => ({
    type: RUNNING_PROCESS,
    status
});
/**
 * action for executing buffer process
 * @memberof actions.geoProcessingTools
 */
export const runBufferProcess = () => ({
    type: RUN_BUFFER_PROCESS
});
/**
 * action for executing intersection process
 * @memberof actions.geoProcessingTools
 */
export const runIntersectionProcess = () => ({
    type: RUN_INTERSECTION_PROCESS
});
/**
 * action for triggering the set of the distance for the buffering
 * @memberof actions.geoProcessingTools
 * @param {number} distance the distance in uom
 */
export const setBufferDistance = (distance) => ({
    type: SET_BUFFER_DISTANCE,
    distance
});
/**
 * action for triggering the set of the uom of the distance for the buffering
 * @memberof actions.geoProcessingTools
 * @param {string} uom the distance in uom
 */
export const setBufferDistanceUom = (uom) => ({
    type: SET_BUFFER_DISTANCE_UOM,
    uom
});
/**
 * action for triggering the set of the quadrantSegments for the buffering
 * @memberof actions.geoProcessingTools
 * @param {number} quadrantSegments the quadrantSegments
 */
export const setBufferQuadrantSegments = (quadrantSegments) => ({
    type: SET_BUFFER_QUADRANT_SEGMENTS,
    quadrantSegments
});
/**
 * action for triggering the set of the capStyle for the buffering
 * @memberof actions.geoProcessingTools
 * @param {string} capStyle the capStyle
 */
export const setBufferCapStyle = (capStyle) => ({
    type: SET_BUFFER_CAP_STYLE,
    capStyle
});

/**
 * action for triggering the set feature request given a source
 * @memberof actions.geoProcessingTools
 * @param {string} layerId the layer id
 * @param {string} source can be "source" or "intersection"
 * @param {object[]|object} data list of features or error
 */
export const setFeatures = (layerId, source, data, nextPage) => ({
    type: SET_FEATURES,
    layerId,
    source,
    data,
    nextPage
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
 * action for the loading flag of the features of intersection layer
 * @memberof actions.geoProcessingTools
 * @param {string} status the status
 */
export const setFeatureIntersectionLoading = (status) => ({
    type: SET_FEATURE_INTERSECTION_LOADING,
    status
});
/**
 * action for setting the layer to be invalid
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 * @param {string} status the status
 */
export const setInvalidLayer = (layerId, status) => ({
    type: SET_INVALID_LAYER,
    status,
    layerId
});

/**
 * action that sets if needed WPS are available (geo:Buffer and gs:IntersectionFeatureCollection, gs:CollectGeometries)
 * @memberof actions.geoProcessingTools
 * @param  {string} layerId the layer id
 * @param  {boolean} status the status
 * @param  {string} source the source
 */
export const setWPSAvailability = (layerId, status, source) => ({
    type: SET_WPS_AVAILABILITY,
    layerId,
    status,
    source
});
/**
 * action that sets the tool to use "buffer", or "intersection"
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
 * action that sets the source feature
 * @memberof actions.geoProcessingTools
 * @param  {string} feature the feature obj with geom inside
 */
export const setSourceFeature = (feature) => ({
    type: SET_SOURCE_FEATURE,
    feature
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
/**
 * action that sets the intersection feature id
 * @memberof actions.geoProcessingTools
 * @param  {string} featureId the layer id
 */
export const setIntersectionFeatureId = (featureId) => ({
    type: SET_INTERSECTION_FEATURE_ID,
    featureId
});
/**
 * action that sets the intersection feature
 * @memberof actions.geoProcessingTools
 * @param  {string} feature the feature obj with geom inside
 */
export const setIntersectionFeature = (feature) => ({
    type: SET_INTERSECTION_FEATURE,
    feature
});
/**
 * action that sets the intersection firstAttributeToRetain
 * @memberof actions.geoProcessingTools
 * @param  {string} firstAttributeToRetain First feature collection attribute to include
 */
export const setIntersectionFirstAttribute = (firstAttributeToRetain) => ({
    type: SET_INTERSECTION_FIRST_ATTRIBUTE,
    firstAttributeToRetain
});
/**
 * action that sets the intersection secondAttributeToRetain
 * @memberof actions.geoProcessingTools
 * @param  {string} secondAttributeToRetain Second feature collection attribute to include
 */
export const setIntersectionSecondAttribute = (secondAttributeToRetain) => ({
    type: SET_INTERSECTION_SECOND_ATTRIBUTE,
    secondAttributeToRetain
});
/**
 * action that sets the intersectionMode
 * @memberof actions.geoProcessingTools
 * @param  {string} intersectionMode Specifies geometry computed for intersecting features. INTERSECTION (default) computes the spatial intersection of the inputs. FIRST copies geometry A. SECOND copies geometry B.
 */
export const setIntersectionMode = (intersectionMode) => ({
    type: SET_INTERSECTION_MODE,
    intersectionMode
});
/**
 * action that sets the percentageEnabled
 * @memberof actions.geoProcessingTools
 * @param  {boolean} percentagesEnabled Indicates whether to output feature area percentages (attributes percentageA and percentageB)
 */
export const setIntersectionPercentagesEnabled = (percentagesEnabled) => ({
    type: SET_INTERSECTION_PERCENTAGES_ENABLED,
    percentagesEnabled
});

/**
 * action that sets the areasEnabled
 * @memberof actions.geoProcessingTools
 * @param  {boolean} areasEnabled Indicates whether to output feature areas (attributes areaA and areaB)
 */
export const setIntersectionAreasEnabled = (areasEnabled) => ({
    type: SET_INTERSECTION_AREAS_ENABLED,
    areasEnabled
});
/**
 * action that sets the owner were the selection of the features must be done
 * @memberof actions.geoProcessingTools
 * @param  {string} source
 */
export const setSelectedLayerType = (source) => ({
    type: SET_SELECTED_LAYER_TYPE,
    source
});
/**
 * action that toggles on / off highlight layers
 * @memberof actions.geoProcessingTools
  */
export const toggleHighlightLayers = () => ({
    type: TOGGLE_HIGHLIGHT_LAYERS
});
