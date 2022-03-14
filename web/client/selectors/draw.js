/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, isNil} from 'lodash';
import {additionalLayersSelector, getLayerFromId, layersSelector} from "./layers";
import {selectedLayerIdSelector} from "./featuregrid";
import {createShallowSelectorCreator} from "../utils/ReselectUtils";

export const changedGeometriesSelector = state => state && state.draw && state.draw.tempFeatures;
export const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};

export const snappingLayerSelector = state => state?.draw?.snappingLayer ? getLayerFromId(state, state?.draw?.snappingLayer) : false;

export const snappingLayerId = state => snappingLayerSelector(state)?.id;
export const snappingLayerType = state => snappingLayerSelector(state)?.type;

export const availableSnappingLayers = createShallowSelectorCreator(
    (a, b) => {
        return a === b
            || !isNil(a) && !isNil(b) && a.id === b.id;
    }
)([
    layersSelector,
    selectedLayerIdSelector,
    snappingLayerId
],
(layers, id, snappingId) => {
    return [{id, title: 'Current layer', active: id === snappingId}].concat(
        layers.map((layer) =>
            layer.id !== id
                && ['wms', 'wfs', 'vector'].includes(layer?.type)
                && layer.group !== 'background'
                && layer.visibility ? {
                    id: layer.id,
                    title: layer.title ?? layer.name,
                    active: layer.id === snappingId
                } : false).filter(Boolean)
    );
});

export const snappingLayerDataSelector = state => {
    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({id}) => id === 'snapping')?.[0]?.options;
};

export const isSnappingActive = state => get(state, 'draw.snapping', false);
export const isSnappingLoading = state => get(state, 'draw.snappingIsLoading', false);
export const snappingShouldRefresh = state => get(state, 'draw.snappingShouldRefresh', false);
