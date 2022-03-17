/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, head, isNil} from 'lodash';
import {additionalLayersSelector, getLayerFromId, layersSelector} from "./layers";
import {selectedLayerIdSelector} from "./featuregrid";
import {createShallowSelectorCreator} from "../utils/ReselectUtils";

export const changedGeometriesSelector = state => state && state.draw && state.draw.tempFeatures;
export const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};

export const getAdditionalLayerFromId = (state, id) => head(additionalLayersSelector(state).filter(l => l.id === id))?.options;

export const snappingLayerSelector = state => state?.draw?.snappingLayer ? getLayerFromId(state, state.draw.snappingLayer) ?? getAdditionalLayerFromId(state, state.draw.snappingLayer) : false;

export const snappingLayerId = state => snappingLayerSelector(state)?.id;
export const snappingLayerType = state => snappingLayerSelector(state)?.type;

export const snappingLayerDataSelector = state => {

    const additionalLayers = additionalLayersSelector(state) ?? [];
    return additionalLayers.filter(({id}) => id === 'snapping')?.[0]?.options;
};
export const isSnappingActive = state => get(state, 'draw.snapping', false);

export const isSnappingLoading = state => get(state, 'draw.snappingIsLoading', false);
export const snappingConfig = state => get(state, 'draw.snapConfig', false);
export const availableSnappingLayers = createShallowSelectorCreator(
    (a, b) => {
        return a === b
            || !isNil(a) && !isNil(b) && a.id === b.id;
    }
)([
    layersSelector,
    additionalLayersSelector,
    selectedLayerIdSelector,
    snappingLayerId,
    snappingConfig
],
(layers, additionalLayers, id, snappingId, config) => {
    // Select extra layers from the config and concat them with layers;
    const availableExtraLayers = additionalLayers.filter(l => (config?.additionalLayers ?? []).includes(l.id)).map(l => l.options);
    const layersList = availableExtraLayers.concat(layers);

    return [{value: id, label: 'Current layer', active: id === snappingId}].concat(
        layersList.map((layer) =>
            layer.id !== id
                && ['wms', 'wfs', 'vector'].includes(layer?.type)
                && (layer?.type === 'wms' ? layer?.search?.type === 'wfs' : true)
                && layer.group !== 'background'
                && layer.visibility ? {
                    value: layer.id,
                    label: layer.title ?? layer.name,
                    active: layer.id === snappingId
                } : false).filter(Boolean)
    );
});
