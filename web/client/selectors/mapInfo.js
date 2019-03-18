/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { get, isArray } = require('lodash');

const { createSelector, createStructuredSelector } = require('reselect');
const {modeSelector} = require('./featuregrid');
const {mapSelector} = require('./map');
const { currentLocaleSelector } = require('./locale');

const {queryPanelSelector} = require('./controls');

/**
 * selects mapinfo state
 * @name mapinfo
 * @memberof selectors
 * @static
 */

 /**
  * Get mapinfo requests from state
  * @function
  * @memberof selectors.mapinfo
  * @param  {object} state the state
  * @return {object} the mapinfo requests
  */
const mapInfoRequestsSelector = state => get(state, "mapInfo.requests") || [];
const isMapInfoOpen = state => !!mapInfoRequestsSelector(state) && mapInfoRequestsSelector(state).length > 0;

/**
 * selects generalInfoFormat from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
const generalInfoFormatSelector = (state) => get(state, "mapInfo.configuration.infoFormat", "text/plain");
const showEmptyMessageGFISelector = (state) => get(state, "mapInfo.configuration.showEmptyMessageGFI", true);
const mapInfoConfigurationSelector = (state) => get(state, "mapInfo.configuration", {});

const measureActiveSelector = (state) => get(state, "controls.measure.enabled") && (get(state, "measurement.lineMeasureEnabled") || get(state, "measurement.areaMeasureEnabled") || get(state, "measurement.bearingMeasureEnabled"));
/**
 * Clicked point of mapInfo
 * @param {object} state the state
 */
const clickPointSelector = state => state && state.mapInfo && state.mapInfo.clickPoint;
const showMarkerSelector = state => state && state.mapInfo && state.mapInfo.showMarker;

const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};
const gridEditingSelector = createSelector(modeSelector, (mode) => mode === 'EDIT');
const annotationsEditingSelector = (state) => get(state, "annotations.editing");
const mapInfoDisabledSelector = (state) => !get(state, "mapInfo.enabled", false);

/**
 * selects stopGetFeatureInfo from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {boolean} true if the get feature info has to stop the request
 */
const stopGetFeatureInfoSelector = createSelector(
    mapInfoDisabledSelector,
    measureActiveSelector,
    drawSupportActiveSelector,
    gridEditingSelector,
    annotationsEditingSelector,
    queryPanelSelector,
    (isMapInfoDisabled, isMeasureActive, isDrawSupportActive, isGridEditing, isAnnotationsEditing, isQueryPanelActive) =>
        isMapInfoDisabled
        || !!isMeasureActive
        || isDrawSupportActive
        || isGridEditing
        || !!isAnnotationsEditing
        || !!isQueryPanelActive
    );

/**
 * Defines the general options of the identifyTool to build the request
 */
const identifyOptionsSelector = createStructuredSelector({
        format: generalInfoFormatSelector,
        map: mapSelector,
        point: clickPointSelector,
        currentLocale: currentLocaleSelector
    });

const isHighlightEnabledSelector = state => state.mapInfo.highlight;

const indexSelector = state => state.mapInfo.index;

const responsesSelector = state => state.mapInfo && state.mapInfo.responses || [];


const currentResponseSelector = createSelector(
    responsesSelector, indexSelector,
    (responses = [], index = 0) => responses[index]
);
const currentFeatureSelector = state => {
    const currentResponse = currentResponseSelector(state) || {};
    return get(currentResponse, 'data.features') || get(currentResponse, 'layerMetadata.features');
};

const applyMapInfoStyle = f => ({
    ...f, style: f.style || {
        color: '#ffcc33',
        opacity: 1,
        radius: 100,
        weight: 3,
        fillColor: '#ffffff',
        fillOpacity: 0.2
    }});

const clickedPointWithFeaturesSelector = createSelector(
    clickPointSelector,
    currentFeatureSelector,
    showMarkerSelector,
    (clickPoint, features, showMarker) => showMarker && clickPoint
        ? {
            ...clickPoint,
            features: features && isArray(features) &&
            features
                .map(applyMapInfoStyle)
        }
        : undefined

);


module.exports = {
    isMapInfoOpen,
    indexSelector,
    responsesSelector,
    clickedPointWithFeaturesSelector,
    identifyOptionsSelector,
    clickPointSelector,
    generalInfoFormatSelector,
    mapInfoRequestsSelector,
    stopGetFeatureInfoSelector,
    showEmptyMessageGFISelector,
    mapInfoConfigurationSelector,
    isHighlightEnabledSelector
};
