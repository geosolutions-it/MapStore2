/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {get} = require('lodash');

const {createSelector} = require('reselect');
const {modeSelector} = require('./featuregrid');
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

/**
 * selects generalInfoFormat from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
const generalInfoFormatSelector = (state) => get(state, "mapInfo.infoFormat", "text/plain");

const measureActiveSelector = (state) => get(state, "measurement.lineMeasureEnabled") || get(state, "measurement.areaMeasureEnabled") || get(state, "measurement.bearingMeasureEnabled");
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

const stopGetFeatureInfoSelector = createSelector(mapInfoDisabledSelector, measureActiveSelector, drawSupportActiveSelector, gridEditingSelector, annotationsEditingSelector, queryPanelSelector,
    (isMapInfoDisabled, isMeasureActive, isDrawSupportActive, isGridEditing, isAnnotationsEditing, isQueryPanelActive) => isMapInfoDisabled || !!isMeasureActive || isDrawSupportActive || isGridEditing || !!isAnnotationsEditing || !!isQueryPanelActive);

module.exports = {
    generalInfoFormatSelector,
    mapInfoRequestsSelector,
    stopGetFeatureInfoSelector
};
