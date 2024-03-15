/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    checkWPSAvailability, CHECK_WPS_AVAILABILITY,
    checkingWPSAvailability, CHECKING_WPS_AVAILABILITY,
    checkingIntersectionWPSAvailability, CHECKING_WPS_AVAILABILITY_INTERSECTION,
    errorLoadingDFT, ERROR_LOADING_DFT,
    getFeatures, GET_FEATURES,
    initPlugin, INIT_PLUGIN,
    runningProcess, RUNNING_PROCESS,
    runProcess, RUN_PROCESS,
    setBufferDistance, SET_BUFFER_DISTANCE,
    setBufferDistanceUom, SET_BUFFER_DISTANCE_UOM,
    setBufferQuadrantSegments, SET_BUFFER_QUADRANT_SEGMENTS,
    setBufferCapStyle, SET_BUFFER_CAP_STYLE,
    setFeatures, SET_FEATURES,
    setFeatureSourceLoading, SET_FEATURE_SOURCE_LOADING,
    setFeatureIntersectionLoading, SET_FEATURE_INTERSECTION_LOADING,
    setInvalidLayer, SET_INVALID_LAYER,
    setWPSAvailability, SET_WPS_AVAILABILITY,
    setSelectedTool, SET_SELECTED_TOOL,
    setSourceLayerId, SET_SOURCE_LAYER_ID,
    setSourceFeatureId, SET_SOURCE_FEATURE_ID,
    setSourceFeature, SET_SOURCE_FEATURE,
    setIntersectionLayerId, SET_INTERSECTION_LAYER_ID,
    setIntersectionFeatureId, SET_INTERSECTION_FEATURE_ID,
    setIntersectionFeature, SET_INTERSECTION_FEATURE,
    setIntersectionFirstAttribute, SET_INTERSECTION_FIRST_ATTRIBUTE,
    setIntersectionSecondAttribute, SET_INTERSECTION_SECOND_ATTRIBUTE,
    setIntersectionMode, SET_INTERSECTION_MODE,
    setIntersectionPercentagesEnabled, SET_INTERSECTION_PERCENTAGES_ENABLED,
    setIntersectionAreasEnabled, SET_INTERSECTION_AREAS_ENABLED,
    setSelectedLayerType, SET_SELECTED_LAYER_TYPE,
    toggleHighlightLayers, TOGGLE_HIGHLIGHT_LAYERS
} from '../geoProcessing';

describe('Test Geo Processing Tools related actions', () => {
    it('checkWPSAvailability', () => {
        const layerId = "";
        const source = "";
        const action = checkWPSAvailability(layerId, source);
        expect(action).toEqual({
            type: CHECK_WPS_AVAILABILITY,
            layerId,
            source
        });
    });
    it('checkingWPSAvailability', () => {
        const status = true;
        const action = checkingWPSAvailability(status);
        expect(action).toEqual({
            type: CHECKING_WPS_AVAILABILITY,
            status
        });
    });
    it('checkingIntersectionWPSAvailability', () => {
        const status = true;
        const action = checkingIntersectionWPSAvailability(status);
        expect(action).toEqual({
            type: CHECKING_WPS_AVAILABILITY_INTERSECTION,
            status
        });
    });
    it('errorLoadingDFT', () => {
        const layerId = "id";
        const action = errorLoadingDFT(layerId);
        expect(action).toEqual({
            type: ERROR_LOADING_DFT,
            layerId
        });
    });
    it('getFeatures', () => {
        const layerId = "id";
        const source = "id";
        const page = 1;
        const action = getFeatures(layerId, source, page);
        expect(action).toEqual({
            type: GET_FEATURES,
            layerId,
            source,
            page
        });
    });
    it('initPlugin', () => {
        const cfg = "id";
        const action = initPlugin(cfg);
        expect(action).toEqual({
            type: INIT_PLUGIN,
            cfg
        });
    });
    it('runningProcess', () => {
        const status = true;
        const action = runningProcess(status);
        expect(action).toEqual({
            type: RUNNING_PROCESS,
            status
        });
    });
    it('runBufferProcess', () => {
        const process = "test";
        const action = runProcess(process);
        expect(action).toEqual({
            type: RUN_PROCESS,
            process
        });
    });
    it('setBufferDistance', () => {
        const distance = 123;
        const action = setBufferDistance(distance);
        expect(action).toEqual({
            type: SET_BUFFER_DISTANCE,
            distance
        });
    });
    it('setBufferDistanceUom', () => {
        const uom = "m";
        const action = setBufferDistanceUom(uom);
        expect(action).toEqual({
            type: SET_BUFFER_DISTANCE_UOM,
            uom
        });
    });
    it('setBufferQuadrantSegments', () => {
        const quadrantSegments = 100;
        const action = setBufferQuadrantSegments(quadrantSegments);
        expect(action).toEqual({
            type: SET_BUFFER_QUADRANT_SEGMENTS,
            quadrantSegments
        });
    });
    it('setBufferCapStyle', () => {
        const capStyle = "Round";
        const action = setBufferCapStyle(capStyle);
        expect(action).toEqual({
            type: SET_BUFFER_CAP_STYLE,
            capStyle
        });
    });
    it('setFeatures', () => {
        const layerId = "";
        const source = "";
        const data = {};
        const nextPage = 2;
        const geometryProperty = {};

        const action = setFeatures(layerId, source, data, nextPage, geometryProperty);
        expect(action).toEqual({
            type: SET_FEATURES,
            layerId,
            source,
            data,
            nextPage,
            geometryProperty
        });
    });
    it('setFeatureSourceLoading', () => {
        const status = true;
        const action = setFeatureSourceLoading(status);
        expect(action).toEqual({
            type: SET_FEATURE_SOURCE_LOADING,
            status
        });
    });
    it('setFeatureIntersectionLoading', () => {
        const status = true;
        const action = setFeatureIntersectionLoading(status);
        expect(action).toEqual({
            type: SET_FEATURE_INTERSECTION_LOADING,
            status
        });
    });
    it('setInvalidLayer', () => {
        const layerId = "";
        const status = true;
        const action = setInvalidLayer(layerId, status);
        expect(action).toEqual({
            type: SET_INVALID_LAYER,
            layerId,
            status
        });
    });
    it('setWPSAvailability', () => {
        const layerId = "";
        const status = true;
        const source = "";
        const action = setWPSAvailability(layerId, status, source);
        expect(action).toEqual({
            type: SET_WPS_AVAILABILITY,
            layerId,
            status,
            source
        });
    });
    it('setSelectedTool', () => {
        const tool = "buffer";
        const action = setSelectedTool(tool);
        expect(action).toEqual({
            type: SET_SELECTED_TOOL,
            tool
        });
    });
    it('setSourceLayerId', () => {
        const layerId = "buffer";
        const action = setSourceLayerId(layerId);
        expect(action).toEqual({
            type: SET_SOURCE_LAYER_ID,
            layerId
        });
    });
    it('setSourceFeatureId', () => {
        const featureId = "";
        const action = setSourceFeatureId(featureId);
        expect(action).toEqual({
            type: SET_SOURCE_FEATURE_ID,
            featureId
        });
    });
    it('setSourceFeature', () => {
        const feature = {};
        const action = setSourceFeature(feature);
        expect(action).toEqual({
            type: SET_SOURCE_FEATURE,
            feature
        });
    });
    it('setIntersectionLayerId', () => {
        const layerId = "";
        const action = setIntersectionLayerId(layerId);
        expect(action).toEqual({
            type: SET_INTERSECTION_LAYER_ID,
            layerId
        });
    });
    it('setIntersectionFeatureId', () => {
        const featureId = "";
        const action = setIntersectionFeatureId(featureId);
        expect(action).toEqual({
            type: SET_INTERSECTION_FEATURE_ID,
            featureId
        });
    });
    it('setIntersectionFeature', () => {
        const feature = {};
        const action = setIntersectionFeature(feature);
        expect(action).toEqual({
            type: SET_INTERSECTION_FEATURE,
            feature
        });
    });
    it('setIntersectionFirstAttribute', () => {
        const firstAttributeToRetain = "";
        const action = setIntersectionFirstAttribute(firstAttributeToRetain);
        expect(action).toEqual({
            type: SET_INTERSECTION_FIRST_ATTRIBUTE,
            firstAttributeToRetain
        });
    });
    it('setIntersectionSecondAttribute', () => {
        const secondAttributeToRetain = "";
        const action = setIntersectionSecondAttribute(secondAttributeToRetain);
        expect(action).toEqual({
            type: SET_INTERSECTION_SECOND_ATTRIBUTE,
            secondAttributeToRetain
        });
    });
    it('setIntersectionMode', () => {
        const intersectionMode = "";
        const action = setIntersectionMode(intersectionMode);
        expect(action).toEqual({
            type: SET_INTERSECTION_MODE,
            intersectionMode
        });
    });
    it('setIntersectionPercentagesEnabled', () => {
        const percentagesEnabled = true;
        const action = setIntersectionPercentagesEnabled(percentagesEnabled);
        expect(action).toEqual({
            type: SET_INTERSECTION_PERCENTAGES_ENABLED,
            percentagesEnabled
        });
    });
    it('setIntersectionAreasEnabled', () => {
        const areasEnabled = true;
        const action = setIntersectionAreasEnabled(areasEnabled);
        expect(action).toEqual({
            type: SET_INTERSECTION_AREAS_ENABLED,
            areasEnabled
        });
    });
    it('setSelectedLayerType', () => {
        const source = "";
        const action = setSelectedLayerType(source);
        expect(action).toEqual({
            type: SET_SELECTED_LAYER_TYPE,
            source
        });
    });
    it('toggleHighlightLayers', () => {
        const action = toggleHighlightLayers();
        expect(action).toEqual({
            type: TOGGLE_HIGHLIGHT_LAYERS
        });
    });
});
