/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { get, omit, isArray } from 'lodash';

import { createSelector, createStructuredSelector } from 'reselect';
import { mapSelector } from './map';
import { isPluginInContext } from './context';
import { currentLocaleSelector } from './locale';
import {getValidator} from '../utils/MapInfoUtils';
import { isCesium } from './maptype';
/**
 * selects mapinfo state
 * @name mapinfo
 * @memberof selectors
 * @static
 */

export const isMapPopup = createSelector(
    isCesium,
    state => !!state?.mapInfo?.showInMapPopup,
    (cesium, showInMapPopup) => !cesium && showInMapPopup
);
/**
  * Get mapinfo requests from state
  * @function
  * @memberof selectors.mapinfo
  * @param  {object} state the state
  * @return {object} the mapinfo requests
  */
export const mapInfoRequestsSelector = state => get(state, "mapInfo.requests") || [];
export const isMapInfoOpen = createSelector(
    mapInfoRequestsSelector,
    isPluginInContext('Identify'),
    isMapPopup,
    (mapInfoRequests, isIdentifyInContext, showInMapPopup) => !showInMapPopup && !!mapInfoRequests && mapInfoRequests.length > 0 && isIdentifyInContext
);

/**
 * selects generalInfoFormat from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
export const generalInfoFormatSelector = (state) => get(state, "mapInfo.configuration.infoFormat", "text/plain");
export const showEmptyMessageGFISelector = (state) => get(state, "mapInfo.configuration.showEmptyMessageGFI", true);
export const mapInfoConfigurationSelector = (state) => get(state, "mapInfo.configuration", {});

export const measureActiveSelector = (state) => get(state, "controls.measure.enabled") && (get(state, "measurement.lineMeasureEnabled") || get(state, "measurement.areaMeasureEnabled") || get(state, "measurement.bearingMeasureEnabled"));
/**
 * Clicked point of mapInfo
 * @param {object} state the state
 */
export const clickPointSelector = state => state && state.mapInfo && state.mapInfo.clickPoint;
export const clickLayerSelector = state => state && state.mapInfo && state.mapInfo.clickLayer;
export const showMarkerSelector = state => state && state.mapInfo && state.mapInfo.showMarker;
export const itemIdSelector = state => get(state, "mapInfo.itemId", null);
export const overrideParamsSelector = state => get(state, "mapInfo.overrideParams", {});
export const filterNameListSelector = state => get(state, "mapInfo.filterNameList", []);
export const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};
export const annotationsEditingSelector = (state) => get(state, "annotations.editing");
export const mapInfoDisabledSelector = (state) => !get(state, "mapInfo.enabled", false);

/**
 * selects stopGetFeatureInfo from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {boolean} true if the get feature info has to stop the request
 */
export const stopGetFeatureInfoSelector = createSelector(
    mapInfoDisabledSelector,
    measureActiveSelector,
    drawSupportActiveSelector,
    annotationsEditingSelector,
    isPluginInContext('Identify'),
    (isMapInfoDisabled, isMeasureActive, isDrawSupportActive, isAnnotationsEditing, identifyPluginPresent) =>
        isMapInfoDisabled
        || !!isMeasureActive
        || isDrawSupportActive
        || !!isAnnotationsEditing
        || !identifyPluginPresent
);

/**
 * Defines the general options of the identifyTool to build the request
 */
export const identifyOptionsSelector = createStructuredSelector({
    format: generalInfoFormatSelector,
    map: mapSelector,
    point: clickPointSelector,
    currentLocale: currentLocaleSelector,
    maxItems: (state) => get(state, "mapInfo.configuration.maxItems")
});

export const isHighlightEnabledSelector = (state = {}) => state.mapInfo && state.mapInfo.highlight;

export const indexSelector = (state = {}) => state && state.mapInfo && state.mapInfo.index;

export const responsesSelector = state => state.mapInfo && state.mapInfo.responses || [];

export const requestsSelector = state => state?.mapInfo?.requests || [];

export const isLoadedResponseSelector = state => state?.mapInfo?.loaded;

/**
 * Gets only the valid responses
 */
export const validResponsesSelector = createSelector(
    requestsSelector,
    responsesSelector,
    generalInfoFormatSelector,
    (requests, responses, format) => {
        const validatorFormat = getValidator(format);
        return requests.length === responses.length && validatorFormat.getValidResponses(responses);
    });

export const currentResponseSelector = createSelector(
    validResponsesSelector, indexSelector,
    (responses = [], index = 0) => responses[index]
);
export const currentFeatureSelector = state => {
    const currentResponse = currentResponseSelector(state) || {};
    return get(currentResponse, 'layerMetadata.features');
};
export const currentFeatureCrsSelector = state => {
    const currentResponse = currentResponseSelector(state) || {};
    return get(currentResponse, 'layerMetadata.featuresCrs');
};

/**
 * Returns the a function that returns the correct style based on the geometry type, to use in the highlight
 * @param {feature} f the feature in json format
 */
export const getStyleForFeature = (style) => (f = {}) =>
    f.style
        || (f.geometry && (f.geometry.type === "Point" || f.geometry.type === "MultiPoint"))
    // point style circle requires radius (it's strange circle should be a default)
        ? style
    // no radius means normal polygon, line or other. TODO: fix VectorStyle to omit radius automatically
        : omit(style, 'radius');
/**
 * Create a function that add the style property to the feature.
 */
export const applyMapInfoStyle = style => f => ({
    ...f,
    style: getStyleForFeature(style)(f)
});
/**
 * gets the configured state for highlight mapInfo features.
 * @param {object} state the application state
 * @returns {object} style object
 */
export const highlightStyleSelector = state => get(state, 'mapInfo.highlightStyle', {
    color: '#3388ff',
    weight: 4,
    radius: 4,
    dashArray: '',
    fillColor: '#3388ff',
    fillOpacity: 0.2
});

export const clickedPointWithFeaturesSelector = createSelector(
    clickPointSelector,
    isHighlightEnabledSelector,
    currentFeatureSelector,
    currentFeatureCrsSelector,
    showMarkerSelector,
    highlightStyleSelector,
    (clickPoint, highlight, features, featuresCrs, showMarker, style) => showMarker && clickPoint
        ? highlight
            ? {
                ...clickPoint,
                featuresCrs,
                features: features && isArray(features)
                    && features
                        .map(applyMapInfoStyle(style))
            }
            : clickPoint
        : undefined

);

export const currentEditFeatureQuerySelector = state => state.mapInfo?.currentEditFeatureQuery;

export const mapTriggerSelector = state => get(state, "mapInfo.configuration.trigger", "click");
export const hoverEnabledSelector = state => isCesium(state) ? false : true;
