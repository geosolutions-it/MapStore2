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
const {getNormalizedLatLon} = require('../utils/CoordinatesUtils');
const {get, head, isEmpty, find, isObject, isArray, castArray} = require('lodash');

const layersSelector = ({layers, config} = {}) => layers && isArray(layers) ? layers : layers && layers.flat || config && config.layers || [];
const currentBackgroundLayerSelector = state => head(layersSelector(state).filter(l => l && l.visibility && l.group === "background"));
const getLayerFromId = (state, id) => head(layersSelector(state).filter(l => l.id === id));
const allBackgroundLayerSelector = state => layersSelector(state).filter(l => l.group === "background");
const markerSelector = state => state.mapInfo && state.mapInfo.showMarker && state.mapInfo.clickPoint;
const geoColderSelector = state => state.search && state.search;

// TODO currently loading flag causes a re-creation of the selector on any pan
// to avoid this separate loading from the layer object

const centerToMarkerSelector = (state) => get(state, "mapInfo.centerToMarker", '');
const defaultIconStyle = {
    iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
};

const layerSelectorWithMarkers = createSelector(
    [layersSelector, markerSelector, geoColderSelector, centerToMarkerSelector],
    (layers = [], markerPosition, geocoder, centerToMarker) => {
        let newLayers = [...layers];
        if ( markerPosition ) {
            const coords = centerToMarker === 'enabled' ? getNormalizedLatLon(markerPosition.latlng) : markerPosition.latlng;
            newLayers.push(MapInfoUtils.getMarkerLayer("GetFeatureInfo", coords));
        }
        if (geocoder && geocoder.markerPosition) {
            newLayers.push(MapInfoUtils.getMarkerLayer("GeoCoder", geocoder.markerPosition, "marker",
                {
                    overrideOLStyle: true,
                    style: isObject(geocoder.style) && !isEmpty(geocoder.style) && {...defaultIconStyle, ...geocoder.style} || defaultIconStyle
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
const wfsDownloadSelector = (state) => state.controls && state.controls.wfsdownload ? { expanded: state.controls.wfsdownload.enabled } : {expanded: false};

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
const getLayersWithDimension = (state, dimension) =>
    (layersSelector(state) || [])
        .filter(l =>
            l
            && l.dimensions
            && find(castArray(l.dimensions), {name: dimension}));
module.exports = {
    layersSelector,
    layerSelectorWithMarkers,
    groupsSelector,
    currentBackgroundLayerSelector,
    allBackgroundLayerSelector,
    getLayerFromId,
    getLayersWithDimension,
    selectedNodesSelector,
    getSelectedLayer,
    getSelectedLayers,
    layerFilterSelector,
    layerSettingSelector,
    layerMetadataSelector,
    wfsDownloadSelector,
    backgroundControlsSelector,
    currentBackgroundSelector,
    tempBackgroundSelector,
    centerToMarkerSelector
};
