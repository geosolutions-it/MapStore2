/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { isOpenlayers } = require('../selectors/maptype');
const { showCoordinateEditorSelector } = require('../selectors/controls');
const { set } = require('../utils/ImmutableUtils');
const { validateFeatureCoordinates } = require('../utils/MeasureUtils');

/**
 * selects measurement state
 * @name measurement
 * @memberof selectors
 * @static
 */

/**
 * selects the showCoordinateEditor flag from state
 * @memberof selectors.measurement
 * @param  {object} state the state
 * @return {boolean} the showCoordinateEditor in the state
 */
const isCoordinateEditorEnabledSelector = (state) => showCoordinateEditorSelector(state) && !state.measurement.isDrawing && isOpenlayers(state);
const showAddAsAnnotationSelector = (state) => state && state.measurement && state.measurement.showAddAsAnnotation;

/**
 * selects the trueBearing object from state
 * @memberof selectors.measurement
 * @param  {object} state the state
 * @return {object} the trueBearing in the state
 */
const isTrueBearingEnabledSelector = (state) => state && state.measurement && state.measurement.trueBearing && state.measurement.trueBearing.measureTrueBearing;

/**
 * validating feature that can contain invalid coordinates
 * polygons needs to be closed fro being drawing
 * if the number of valid coords is < min for that geomType then
 * return empty coordinates
*/
const getValidFeatureSelector = (state) => {
    let feature = state.measurement.feature || {};
    if (feature.geometry) {
        feature = set("geometry.coordinates", validateFeatureCoordinates(feature.geometry || {}), feature);
    }
    return feature;
};

const measurementSelector = (state) => {
    return state.measurement && {
        ...state.measurement,
        feature: getValidFeatureSelector(state)
    } || {};
};

module.exports = {
    measurementSelector,
    getValidFeatureSelector,
    isCoordinateEditorEnabledSelector,
    showAddAsAnnotationSelector,
    isTrueBearingEnabledSelector
};
