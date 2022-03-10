/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get } from 'lodash';
import {additionalLayersSelector} from "./layers";

export const changedGeometriesSelector = state => state && state.draw && state.draw.tempFeatures;
export const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};

export const selectedLayerSelector = state => state?.draw.selectedLayer;

// export const availableSnappingLayers = state => {
//     // build list of options for snapping layers dropdown
// };

export const snappingLayerSelector = state => state?.draw?.snappingLayer;

export const snappingLayerDataSelector = state => {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({id}) => id === 'snapping')?.[0]?.options;
};

export const isSnappingActive = state => get(state, 'draw.snapping', false);
export const isSnappingLoading = state => get(state, 'draw.snappingIsLoading', false);
export const snappingShouldRefresh = state => get(state, 'draw.snappingShouldRefresh', false);
