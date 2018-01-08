/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {createSelector} = require('reselect');

const MapInfoUtils = require('../utils/MapInfoUtils');
const LayersUtils = require('../utils/LayersUtils');
const {head, isEmpty, find} = require('lodash');

const layersSelector = state => state.layers && state.layers.flat || state.layers || state.config && state.config.layers || [];
const currentBackgroundLayerSelector = state => head(layersSelector(state).filter(l => l && l.visibility && l.group === "background"));
const getLayerFromId = (state, id) => head(layersSelector(state).filter(l => l.id === id));
const allBackgroundLayerSelector = state => layersSelector(state).filter(l => l.group === "background");
const markerSelector = state => state.mapInfo && state.mapInfo.showMarker && state.mapInfo.clickPoint;
const geoColderSelector = state => state.search && state.search;

// TODO currently loading flag causes a re-creation of the selector on any pan
// to avoid this separate loading from the layer object

const layerSelectorWithMarkers = createSelector(
    [layersSelector, markerSelector, geoColderSelector],
    (layers = [], markerPosition, geocoder) => {
        let newLayers = [...layers];
        if ( markerPosition ) {
            newLayers.push(MapInfoUtils.getMarkerLayer("GetFeatureInfo", markerPosition.latlng));
        }
        if (geocoder && geocoder.markerPosition) {
            newLayers.push(MapInfoUtils.getMarkerLayer("GeoCoder", geocoder.markerPosition, "marker",
                {
                    overrideOLStyle: true,
                    style: {
                        iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    }
                }, geocoder.markerLabel
            ));
        }

        return newLayers;
    }
);

const groupsSelector = (state) => state.layers && state.layers.flat && state.layers.groups && LayersUtils.denormalizeGroups(state.layers.flat, state.layers.groups).groups || [];

const selectedNodesSelector = (state) => state.layers && state.layers.selected || [];
const getSelectedLayers = state => {
    const selectedIds = selectedNodesSelector(state);
    return selectedIds.map((id) => find(layersSelector(state), {id}));
};
const getSelectedLayer = state => {
    const selected = getSelectedLayers(state) || [];
    return selected && selected[0];
};
const layerFilterSelector = (state) => state.layers && state.layers.filter || '';
const layerSettingSelector = (state) => state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}};
const layerMetadataSelector = (state) => state.layers && state.layers.layerMetadata || {expanded: false, metadataRecord: {}, maskLoading: false};

const backgroundControlsSelector = (state) => (state.controls && state.controls.backgroundSelector) || {};
const currentBackgroundSelector = (state) => {
    const controls = backgroundControlsSelector(state);
    const layers = allBackgroundLayerSelector(state) || [];
    return controls.currentLayer && !isEmpty(controls.currentLayer) ? controls.currentLayer : head(layers.filter((l) => l.visibility)) || {};
};
const tempBackgroundSelector = (state) => {
    const controls = backgroundControlsSelector(state);
    const layers = allBackgroundLayerSelector(state) || [];
    return controls.tempLayer && !isEmpty(controls.tempLayer) ? controls.tempLayer : head(layers.filter((l) => l.visibility)) || {};
};

module.exports = {
    layersSelector,
    layerSelectorWithMarkers,
    groupsSelector,
    currentBackgroundLayerSelector,
    allBackgroundLayerSelector,
    getLayerFromId,
    selectedNodesSelector,
    getSelectedLayer,
    getSelectedLayers,
    layerFilterSelector,
    layerSettingSelector,
    layerMetadataSelector,
    backgroundControlsSelector,
    currentBackgroundSelector,
    tempBackgroundSelector
};
