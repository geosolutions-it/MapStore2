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
const currentTimeSelector = state => get('timemanager.currentTime', state);
module.exports = {
    currentTimeSelector,
    getLayersWithTimeData,
    getTimeData: getStaticTimeData
};
