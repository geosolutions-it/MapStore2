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
const {defaultIconStyle} = require('../utils/SearchUtils');
const {getNormalizedLatLon} = require('../utils/CoordinatesUtils');
const {get, head, isEmpty, find, isObject, isArray, castArray} = require('lodash');
const {flattenGroups} = require('../utils/TOCUtils');

const layersSelector = ({layers, config} = {}) => layers && isArray(layers) ? layers : layers && layers.flat || config && config.layers || [];
const currentBackgroundLayerSelector = state => head(layersSelector(state).filter(l => l && l.visibility && l.group === "background"));
const getLayerFromId = (state, id) => head(layersSelector(state).filter(l => l.id === id));
const allBackgroundLayerSelector = state => layersSelector(state).filter(l => l.group === "background");
const markerSelector = state => state.mapInfo && state.mapInfo.showMarker && state.mapInfo.clickPoint;
const geoColderSelector = state => state.search && state.search;

// TODO currently loading flag causes a re-creation of the selector on any pan
// to avoid this separate loading from the layer object

const centerToMarkerSelector = (state) => get(state, "mapInfo.centerToMarker", '');
const additionalLayersSelector = state => get(state, "additionallayers", []);


const layerSelectorWithMarkers = createSelector(
    [layersSelector, markerSelector, geoColderSelector, centerToMarkerSelector, additionalLayersSelector],
    (layers = [], markerPosition, geocoder, centerToMarker, additionalLayers) => {

        // Perform an override action on the layers using options retrieved from additional layers
        const overrideLayers = additionalLayers.filter(({actionType}) => actionType === 'override');
        const overlayLayers = additionalLayers.filter(({actionType}) => actionType === 'overlay').map(l => l.options);
        let newLayers = layers.map(layer => {
            const { options } = head(overrideLayers.filter(overrideLayer => overrideLayer.id === layer.id)) || {};
            return options ? {...layer, ...options} : {...layer};
        });
        newLayers = newLayers.concat(overlayLayers);
        if ( markerPosition ) {
            const coords = centerToMarker === 'enabled' ? getNormalizedLatLon(markerPosition.latlng) : markerPosition.latlng;
            newLayers.push(MapInfoUtils.getMarkerLayer("GetFeatureInfo", coords));
        }
        if (geocoder && geocoder.markerPosition) {
            let geocoderStyle = isObject(geocoder.style) && geocoder.style || {};
            newLayers.push(MapInfoUtils.getMarkerLayer("GeoCoder", geocoder.markerPosition, "marker",
                {
                    overrideOLStyle: true,
                    style: {...defaultIconStyle, ...geocoderStyle}
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

/**
 * gets the actual node opened in settings modal
*/
const elementSelector = (state) => {
    const settings = layerSettingSelector(state);
    const layers = layersSelector(state);
    const groups = groupsSelector(state);
    return settings.nodeType === 'layers' && isArray(layers) && head(layers.filter(layer => layer.id === settings.node)) ||
    settings.nodeType === 'groups' && isArray(groups) && head(flattenGroups(groups, 0, true).filter(group => group.id === settings.node)) || {};
};

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
    centerToMarkerSelector,
    elementSelector
};
