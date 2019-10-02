/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { layersSelector } = require('./layers');
const { createSelector } = require('reselect');
const {get, find} = require('lodash');

const layerDimensionDataSelectorCreator = (layerId, dimension) => (state) => get(state, `dimension.data[${dimension}][${layerId}]`);

const getLayerStaticDimension = (layer = {}, dimension) => {
    return find(layer.dimensions || [], { name: dimension });
};
const layerDimensionSelectorCreator = (layer, dimension) => (state) => {
    return layerDimensionDataSelectorCreator(layer.id, dimension)(state) || getLayerStaticDimension(layer, dimension);

};

/**
 * Returns the dimension configurations of layers with time dimension.
 *
 * @param {object} state the current state
 * @return {object} a map of id -> time dimension configuration for layers that have one dimension named "time".
 */
const timeDataSelector = state => layersSelector(state).reduce((timeDataMap, layer) => {
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
const layersWithTimeDataSelector = state => layersSelector(state).filter(l => getLayerStaticDimension(l, "time"));

const currentTimeSelector = state => {
    const currentTime = get(state, 'dimension.currentTime');
    return currentTime && currentTime.split('/')[0];
};

const offsetTimeSelector = state => get(state, 'dimension.offsetTime');

const offsetEnabledSelector = state => !!offsetTimeSelector(state);
// get times sorted by date
const timeSequenceSelector = createSelector(
    timeDataSelector,
    data => Object.keys(data)
        .reduce((acc, cur) =>
            [
                ...acc,
                ...data[cur] && data[cur].values || []
            ],
        [])
        .sort() || []);


/**
 * Returns the time dimension values for the selected layer, sorted
 * @param {object} layer layer object (only id is required)
 */
const layerTimeSequenceSelectorCreator =
    layer =>
        state =>
            [...get(layerDimensionSelectorCreator(layer, "time")(state), "values", [])].sort();

const layerDimensionRangeSelector = (state, layerId) => {
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

module.exports = {
    layerDimensionRangeSelector,
    layerDimensionSelectorCreator,
    layerDimensionDataSelectorCreator,
    layerTimeSequenceSelectorCreator,
    timeSequenceSelector,
    currentTimeSelector,
    layersWithTimeDataSelector,
    timeDataSelector,
    offsetTimeSelector,
    offsetEnabledSelector
};
