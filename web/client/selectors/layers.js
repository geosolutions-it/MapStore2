/*
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { createSelector } from 'reselect';

import { getCurrentResolution } from '../utils/MapUtils';
import {getMarkerLayer, defaultQueryableFilter} from '../utils/MapInfoUtils';
import { denormalizeGroups, isInsideResolutionsLimits } from '../utils/LayersUtils';
import { defaultIconStyle } from '../utils/SearchUtils';
import { getNormalizedLatLon } from '../utils/CoordinatesUtils';
import { clickedPointWithFeaturesSelector } from './mapInfo';
import { get, head, isEmpty, find, isObject, isArray, castArray, isNil } from 'lodash';
import { flattenGroups } from '../utils/TOCUtils';
import { mapSelector } from './map';

export const layersSelector = ({layers, config} = {}) => layers && isArray(layers) ? layers : layers && layers.flat || config && config.layers || [];
export const currentBackgroundLayerSelector = state => head(layersSelector(state).filter(l => l && l.visibility && l.group === "background"));
export const getLayerFromId = (state, id) => head(layersSelector(state).filter(l => l.id === id));
export const getLayerFromName = (state, name) => head(layersSelector(state).filter(l => l.name === name));
export const allBackgroundLayerSelector = state => layersSelector(state).filter(l => l.group === "background");
export const highlightPointSelector = state => state.annotations && state.annotations.showMarker && state.annotations.clickPoint;
export const geoColderSelector = state => state.search && state.search;

// TODO currently loading flag causes a re-creation of the selector on any pan
// to avoid this separate loading from the layer object

export const centerToMarkerSelector = (state) => get(state, "mapInfo.centerToMarker", '');
export const additionalLayersSelector = state => get(state, "additionallayers", []);
export const getAdditionalLayerFromId = (state, id) => head(additionalLayersSelector(state).filter(l => l.id === id))?.options;


export const layerSelectorWithMarkers = createSelector(
    [layersSelector, clickedPointWithFeaturesSelector, geoColderSelector, centerToMarkerSelector, additionalLayersSelector,
        highlightPointSelector],
    (layers = [], markerPosition, geocoder, centerToMarker, additionalLayers, highlightPoint) => {

        // Perform an override action on the layers using options retrieved from additional layers
        const overrideLayers = additionalLayers.filter(({actionType}) => actionType === 'override');
        const overlayLayers = additionalLayers.filter(({actionType}) => actionType === 'overlay').map(l => l.options);
        let newLayers = layers.map(layer => {
            const { options } = head(overrideLayers.filter(overrideLayer => overrideLayer.id === layer.id)) || {};
            return options ? {...layer, ...options} : {...layer};
        });
        newLayers = newLayers.concat(overlayLayers);
        if ( markerPosition ) {
            // A separate layer for feature highlight is required because the SRS is different
            newLayers.push(getMarkerLayer("GetFeatureInfoHighLight", { features: markerPosition.features }, undefined, {
                overrideOLStyle: true,
                featuresCrs: markerPosition.featuresCrs,
                style: { ...defaultIconStyle, ...{
                    color: '#3388ff',
                    weight: 4,
                    dashArray: '',
                    fillColor: '#3388ff',
                    fillOpacity: 0.2
                }}
            }));
            const coords = centerToMarker === 'enabled' ? getNormalizedLatLon(markerPosition.latlng) : markerPosition.latlng;
            newLayers.push(getMarkerLayer("GetFeatureInfo", coords));
        }
        if ( highlightPoint ) {
            const coords = centerToMarker === 'enabled' ? getNormalizedLatLon(highlightPoint.latlng) : highlightPoint.latlng;
            newLayers.push(getMarkerLayer("Annotations", coords));
            newLayers.push(getMarkerLayer("GetFeatureInfo", {
                ...coords

            }));
        }

        if (geocoder && geocoder.markerPosition) {
            let geocoderStyle = isObject(geocoder.style) && geocoder.style || {};
            newLayers.push(getMarkerLayer("GeoCoder", geocoder.markerPosition, "marker",
                {
                    overrideOLStyle: true,
                    style: {...defaultIconStyle, ...geocoderStyle}
                }, geocoder.markerLabel
            ));
        }

        return newLayers;
    }
);

export const rawGroupsSelector = (state) => state.layers && state.layers.flat && state.layers.groups || [];
export const groupsSelector = (state) => state.layers && state.layers.flat && state.layers.groups && denormalizeGroups(state.layers.flat, state.layers.groups).groups || [];

export const selectedNodesSelector = (state) => state.layers && state.layers.selected || [];

/**
* Layers selected by the user on the TOC
* @param {object} state the state
* @return {array} array with the selected layers data obects
*/
export const getSelectedLayers = state => {
    const selectedIds = selectedNodesSelector(state);
    // We need to exclude undefined values from the result
    return selectedIds.map((id) => find(layersSelector(state), {id})).filter(l => l !== undefined);
};

export const getSelectedLayer = state => {
    const selected = getSelectedLayers(state) || [];
    return selected && selected[0];
};
export const layerFilterSelector = (state) => state.layers && state.layers.filter || '';
export const layerSettingSelector = (state) => state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}};
export const layerMetadataSelector = (state) => state.layers && state.layers.layerMetadata || {expanded: false, metadataRecord: {}, maskLoading: false};
export const wfsDownloadSelector = (state) => state.controls && state.controls.layerdownload ? { expanded: state.controls.layerdownload.enabled } : {expanded: false};

export const backgroundControlsSelector = (state) => (state.controls && state.controls.backgroundSelector) || {};
export const currentBackgroundSelector = (state) => {
    const controls = backgroundControlsSelector(state);
    const layers = allBackgroundLayerSelector(state) || [];
    return controls.currentLayer && !isEmpty(controls.currentLayer) ? controls.currentLayer : head(layers.filter((l) => l.visibility)) || {};
};
export const tempBackgroundSelector = (state) => {
    const controls = backgroundControlsSelector(state);
    const layers = allBackgroundLayerSelector(state) || [];
    return controls.tempLayer && !isEmpty(controls.tempLayer) ? controls.tempLayer : head(layers.filter((l) => l.visibility)) || {};
};
export const getLayersWithDimension = (state, dimension) =>
    (layersSelector(state) || [])
        .filter(l =>
            l
            && l.dimensions
            && find(castArray(l.dimensions), {name: dimension}));

/**
 * gets the actual node opened in settings modal
*/
export const elementSelector = (state) => {
    const settings = layerSettingSelector(state);
    const layers = layersSelector(state);
    const groups = groupsSelector(state);
    return settings.nodeType === 'layers' && isArray(layers) && head(layers.filter(layer => layer.id === settings.node)) ||
    settings.nodeType === 'groups' && isArray(groups) && head(flattenGroups(groups, 0, true).filter(group => group.id === settings.node)) || {};
};

const isLayerQueryable = (state, layer) => {
    const map = mapSelector(state) || {};
    const currentResolution = isNil(map.resolution)
        ? getCurrentResolution(Math.round(map.zoom), 0, 21, 96)
        : map.resolution;
    return isInsideResolutionsLimits(layer, currentResolution)
        && defaultQueryableFilter(layer);
};
/**
* Select queriable layers
* @param {object} state the state
* @return {array} the queriable layers
*/
export const queryableLayersSelector = state => layersSelector(state).filter((layer) => isLayerQueryable(state, layer));
/**
 * Return loading error state for selected layer
 * @param {object} state the state
 * @return {boolean} true if selected layer has error
 */
export const selectedLayerLoadingErrorSelector = state => (getSelectedLayer(state) || {}).loadingError === 'Error';
/**
 * Return queriable selected layers
 * @param {object} state the state
 * @return {array} the queriable selected layers
 */
export const queryableSelectedLayersSelector = state => getSelectedLayers(state).filter((layer) => isLayerQueryable(state, layer));
