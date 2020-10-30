/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { createSelector } from 'reselect';

export const getWMSLayers = (state) => state.layers && state.layers.flat && state.layers.flat.filter((l) => l.type === 'wms' && l.group !== 'background') || [];

export const refreshingLayers = (state) => state.layers && state.layers.refreshing || [];

export const mapUpdateOptions = (state) => state.controls && state.controls.mapUpdate && state.controls.mapUpdate.options || {bbox: true, search: true, dimensions: true, title: false};

export const autoMapUpdateSelector = createSelector([
    getWMSLayers,
    refreshingLayers
], (layers, refreshing) => ({
    loading: refreshing && refreshing.length > 0 ? true : false,
    length: layers.length || 0,
    count: (layers.length - refreshing.length) + 1 || 0
}));
