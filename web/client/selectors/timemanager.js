/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { layersSelector } = require('./layers');
const {get, find} = require('lodash');

const getLayerStaticTimeData = (layer = {}) => {
    return find(layer.dimensions || [], {name: "time"});
};
const getLayerTimeData = getLayerStaticTimeData;
const getStaticTimeData = state => layersSelector(state).reduce((timeDataMap, layer) => {
    // TODO: find out other time data sources
    const timeData = getLayerStaticTimeData(layer);
    if (timeData) {
        return {
            ...timeDataMap,
            [layer.id]: timeData
        };
    }
}, []);
const getLayersWithTimeData = state => layersSelector(state).filter(l => getLayerTimeData(l));
const currentTimeSelector = state => get(state, 'timemanager.currentTime');
const getTimeData = getStaticTimeData; // TODO: support other times types;
const timeSequenceSelector = state => {
    // TODO: support remote retrieval of nearest time snap.
    const data = getTimeData(state);
    // get times sorted by date
    const times = Object.keys(data)
        .reduce((acc, cur) =>
            [
                ...acc,
                ...data[cur] && data[cur].values || []
            ],
            [])
        .sort() || [];
    return times;
};
module.exports = {
    timeSequenceSelector,
    currentTimeSelector,
    getLayersWithTimeData,
    getTimeData

};
