/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {get, isObject} from 'lodash';
import {additionalLayersSelector, getAdditionalLayerFromId, getLayerFromId, layersSelector} from "./layers";
import {selectedLayerSelector} from "./featuregrid";
import {createShallowSelectorCreator} from "../utils/ReselectUtils";
import {getLayerTitle} from "../utils/LayersUtils";
import {currentLocaleSelector} from "./locale";


export const changedGeometriesSelector = state => state && state.draw && state.draw.tempFeatures;
export const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};

export const snappingLayerSelector = state => state?.draw?.snappingLayer ? getLayerFromId(state, state.draw.snappingLayer) ?? getAdditionalLayerFromId(state, state.draw.snappingLayer) : false;

export const isSnappingActive = state => get(state, 'draw.snapping', false);

export const isSnappingLoading = state => get(state, 'draw.snappingIsLoading', false);
export const snappingConfig = state => get(state, 'draw.snapConfig', false);
export const drawerOwnerSelector = state => get(state, 'draw.drawOwner', '');

export const availableSnappingLayers = createShallowSelectorCreator(
    (a, b) => {
        return a === b
            || isObject(a) && isObject(b) && a?.id === b?.id && a?.title === b?.title && a?.visibility === b?.visibility;
    }
)([
    layersSelector,
    additionalLayersSelector,
    selectedLayerSelector,
    snappingLayerSelector,
    snappingConfig,
    currentLocaleSelector
],
(layers, additionalLayers, selectedLayer = {}, snappingLayer = {}, config, locale) => {
    // Select extra layers from the config and concat them with layers;
    const snappingId = snappingLayer?.id;
    const id = selectedLayer?.id;
    const availableExtraLayers = additionalLayers.filter(l => (config?.additionalLayers ?? []).includes(l.id)).map(l => l.options);
    const layersList = availableExtraLayers.concat(layers);
    const currentLayer = id ? [{value: id, label: getLayerTitle(selectedLayer, locale), active: id === snappingId}] : [];

    return currentLayer.concat(
        layersList.map((layer) =>
            layer.id !== id
                && ['wms', 'wfs', 'vector'].includes(layer?.type)
                && (layer?.type === 'wms' ? layer?.search?.type === 'wfs' : true)
                && layer.group !== 'background'
                && layer.visibility ? {
                    value: layer.id,
                    label: getLayerTitle(layer, locale),
                    active: layer.id === snappingId
                } : false).filter(Boolean)
    );
});
