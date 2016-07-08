/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {createSelector} = require('reselect');

const MapInfoUtils = require('../utils/MapInfoUtils');
const LayersUtils = require('../utils/LayersUtils');

const layersSelector = (state) => (state.layers && state.layers.flat) || (state.layers) || (state.config && state.config.layers) || [];
const markerSelector = (state) => (state.mapInfo && state.mapInfo.showMarker && [MapInfoUtils.getMarkerLayer("GetFeatureInfo", state.mapInfo.clickPoint.latlng)] || []).concat(
    state.search && state.search.markerPosition &&
    [MapInfoUtils.getMarkerLayer("GeoCoder", state.search.markerPosition, "marker", {overrideOLStyle: true, style: {iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"}} /*, "altro", {
        radius: 5,
        color: "red",
        weight: 5,
        opacity: 1,
        fillOpacity: 0
    }*/
)] || []
);

const layerSelectorWithMarkers = createSelector(
    [layersSelector, markerSelector],
    (layers, marker) => ([...layers, ...marker])
);

const groupsSelector = (state) => state.layers && state.layers.flat && state.layers.groups && LayersUtils.denormalizeGroups(state.layers.flat, state.layers.groups).groups || [];

module.exports = {
    layersSelector,
    layerSelectorWithMarkers,
    groupsSelector
};
