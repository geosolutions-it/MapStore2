/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { createSelector } from 'reselect';
import {
    layersSelector,
    getSelectedLayer
} from '../../../selectors/layers';
import { isAnnotationLayer } from '../utils/AnnotationsUtils';
/**
 * It returns the first annotation layer available in map
 * @param {object} state
 * @returns {object}
 */
export const annotationsLayerSelector = createSelector(
    [layersSelector],
    (layers) => layers.find(isAnnotationLayer)
);
/**
 * It returns all annotation layers available in map
 * @param {object} state
 * @returns {array}
 */
export const annotationsLayersSelector = createSelector(
    [layersSelector],
    (layers) => layers.filter(isAnnotationLayer)
);
/**
 * It returns the selected annotation layer
 * @param {object} state
 * @returns {object}
 */
export const getSelectedAnnotationLayer = (state) => {
    const selectedLayer = getSelectedLayer(state);
    return selectedLayer && isAnnotationLayer(selectedLayer) ? selectedLayer : null;
};
/**
 * It returns the annotation editing state
 * @param {object} state
 * @returns {boolean}
 */
export const editingSelector = (state) => state?.annotations?.editing;
/**
 * It returns the current editing session
 * @param {object} state
 * @returns {boolean}
 */
export const getAnnotationsSession = (state) => state?.annotations?.session;
/**
 * It returns the id of the selected feature annotation
 * @param {object} state
 * @returns {string}
 */
export const getSelectedAnnotationFeatureId = (state) => state?.annotations?.featureId;
