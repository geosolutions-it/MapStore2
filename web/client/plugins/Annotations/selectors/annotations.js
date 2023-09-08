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

export const annotationsLayerSelector = createSelector(
    [layersSelector],
    (layers) => layers.find(isAnnotationLayer)
);
export const annotationsLayersSelector = createSelector(
    [layersSelector],
    (layers) => layers.filter(isAnnotationLayer)
);
export const getSelectedAnnotationLayer = (state) => {
    const selectedLayer = getSelectedLayer(state);
    return selectedLayer && isAnnotationLayer(selectedLayer) ? selectedLayer : null;
};
export const editingSelector = (state) => state?.annotations?.editing;
export const getAnnotationsSession = (state) => state?.annotations?.session;
export const getSelectedAnnotationFeatureId = (state) => state?.annotations?.featureId;
