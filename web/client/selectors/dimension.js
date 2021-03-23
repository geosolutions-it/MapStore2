/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { layersSelector } from './layers';

import { createSelector } from 'reselect';
import { get, find } from 'lodash';

export const layerDimensionDataSelectorCreator = (layerId, dimension) => (state) => get(state, `dimension.data[${dimension}][${layerId}]`);

export const getLayerStaticDimension = (layer = {}, dimension) => {
    return find(layer.dimensions || [], { name: dimension });
};
export const layerDimensionSelectorCreator = (layer, dimension) => (state) => {
    return layerDimensionDataSelectorCreator(layer.id, dimension)(state) || getLayerStaticDimension(layer, dimension);

};

/**
 * Returns the dimension configurations of layers with time dimension.
 *
 * @param {object} state the current state
 * @return {object} a map of id -> time dimension configuration for layers that have one dimension named "time".
 */
export const timeDataSelector = state => layersSelector(state).reduce((timeDataMap, layer) => {
    const timeData = layerDimensionSelectorCreator(layer, "time")(state);
    if (timeData) {
        return {
            ...timeDataMap,
            [layer.id]: timeData
        };
    }
    return timeDataMap;
}, {});

/**
 * Returns a list of layers with time data
 * @param {object} state application state
 */
export const layersWithTimeDataSelector = state => layersSelector(state).filter(l => {
    const showHiddenLayers = get(state, 'timeline.settings.showHiddenLayers');
    const layerStaticDimension = getLayerStaticDimension(l, "time");
    if (!showHiddenLayers) {
        return l.visibility && layerStaticDimension;
    }
    return layerStaticDimension;
});
export const currentTimeSelector = state => {
    const currentTime = get(state, 'dimension.currentTime');
    return currentTime && currentTime.split('/')[0];
};

export const offsetTimeSelector = state => get(state, 'dimension.offsetTime');

export const offsetEnabledSelector = state => !!offsetTimeSelector(state);
// get times sorted by date
export const timeSequenceSelector = createSelector(
    timeDataSelector,
    data => Object.keys(data)
        .reduce((acc, cur) =>
            [
                ...acc,
                ...(data[cur] && data[cur].values || [])
            ],
        [])
        .sort() || []);


/**
 * Returns the time dimension values for the selected layer, sorted
 * @param {object} layer layer object (only id is required)
 */
export const layerTimeSequenceSelectorCreator =
    layer =>
        state =>
            [...get(layerDimensionSelectorCreator(layer, "time")(state), "values", [])].sort();

export const layerDimensionRangeSelector = (state, layerId) => {
    const timeRange = layerDimensionDataSelectorCreator(layerId, "time")(state);
    const dataRange = timeRange && timeRange.domain && timeRange.domain.split('--');
    if (dataRange && dataRange.length === 2) {
        return dataRange && {
            start: dataRange[0],
            end: dataRange[1]
        };
    }
    const values = timeRange && timeRange.domain && timeRange.domain.split(",");
    if (values && values.length > 0) {
        return {
            start: values[0],
            end: values[values.length - 1]
        };
    }
    return null;
};
