/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { isOpenlayers } = require('../selectors/maptype');
const { showCoordinateEditorSelector } = require('../selectors/controls');

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

module.exports = {
    isCoordinateEditorEnabledSelector,
    showAddAsAnnotationSelector
};
