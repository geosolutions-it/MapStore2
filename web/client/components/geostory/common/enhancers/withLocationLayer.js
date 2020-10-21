/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {branch, compose, withProps, withPropsOnChange, withHandlers, withStateHandlers } from 'recompose';
import {head} from 'lodash';
import uuidv1 from 'uuid/v1';

import { getLayer } from '../../../../utils/LayersUtils';
import { getIntersectingFeature } from '../../../../utils/IdentifyUtils';

import LocationPopoverEditor from '../LocationPopoverEditor';

/**
 * Adds a locations layer if it wasn't part of the map layers when mapLocationsEnabled is true
 */
export const withLocationLayer = branch(({editMap, map: {mapLocationsEnabled = false} = {}}) => mapLocationsEnabled && editMap,
    withProps(({layers, update}) => {
        let locationsLayer = head(layers.filter(layer => layer.id === "locations"));

        if (locationsLayer) {
            return {layers};
        }

        const featureCollection = {
            id: "locFeatureCollection",
            type: "FeatureCollection",
            features: [],
            properties: {},
            style: {highlight: false}
        };

        locationsLayer = {
            type: 'vector',
            visibility: true,
            id: 'locations',
            name: "Locations",
            hideLoading: true,
            style: undefined,
            features: [featureCollection],
            handleClickOnLayer: true
        };
        const newLayers = layers.concat();
        newLayers.push(locationsLayer);
        update("map.layers", newLayers);
        return {layers: newLayers};
    })
);

/**
 * Allows clicking on map and adding locations. It also allows dragging of points during editMap true
 */
export const withLocationClickInEdit = branch(({editMap, map: {mapLocationsEnabled = false} = {}}) => mapLocationsEnabled && editMap,
    compose(
        withStateHandlers(({'activeTab': 'popup-editor'}), {
            setActiveTab: () => (tab) => {
                return { activeTab: tab };
            }
        }),
        withHandlers({
            onClick: ({update, map, currentMapLocation = "", layers = []}) => (point, layerId) =>  {
                if (currentMapLocation !== "") {
                    const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${currentMapLocation}"}].geometry`;
                    update(`${path}.coordinates`, [point.latlng.lng, point.latlng.lat]);
                    update(`${path}.rawPos`, point.rawPos);
                }

                if (layerId === "locations") {
                    const options = {
                        map,
                        point
                    };

                    const intersectingFeature = getIntersectingFeature(layers, layerId, options);

                    update("currentMapLocation", intersectingFeature[0] && intersectingFeature[0].id || "");
                }
            },
            onTranslateEnd: ({update}) => ({id, rawPos, latlng}) => {
                const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${id}"}].geometry`;
                update(`${path}.coordinates`, [latlng.lng, latlng.lat]);
                update(`${path}.rawPos`, rawPos);
            },
            onPopupClose: ({update}) => () => {
                update("currentMapLocation", "");
            }
        }),
        withPropsOnChange(["popups", "currentMapLocation", "layers", "activeTab"], ({ activeTab, setActiveTab, sections = [], layers = [], update = () => {}, currentMapLocation = "", mapInfoControlTrack }) => {
            const locationsLayer = getLayer('locations', layers);
            const locationFeatures = locationsLayer && locationsLayer.features[0].features || [];
            const currentLocationData = head(locationFeatures.filter((location) => location.id === currentMapLocation));
            if (!currentLocationData || (currentLocationData  && currentLocationData.geometry.coordinates.length === 0)) {

                // When currentMapLocation is empty, we're not actively editing any location so we change back to
                // previous mapInfoControl state and vice versa
                currentMapLocation !== ""
                    ? update("map.mapInfoControl", false)
                    : update("map.mapInfoControl", mapInfoControlTrack);

                return { popups: [] };
            }

            // When currentMapLocation is empty, we're not actively editing any location so we change back to
            // previous mapInfoControl state and vice versa
            currentMapLocation !== ""
                ? update("map.mapInfoControl", false)
                : update("map.mapInfoControl", mapInfoControlTrack);

            const component = () => (
                <LocationPopoverEditor
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    sections={sections}
                    currentLocationData={currentLocationData}
                    html={currentLocationData?.properties?.html}
                    update={update}
                    currentMapLocation={currentMapLocation}
                />);

            return {popups: [{component, position: { coordinates: currentLocationData.geometry.rawPos }, id: uuidv1() }]};
        }),
        withPropsOnChange(
            ['plugins', 'onPopupClose', 'popups', 'currentMapLocation'],
            ({plugins, popups, onPopupClose} = {}) => {
                const {PopupSupport, tools = {}, ...rest} = plugins;
                if (!PopupSupport) {
                    return {};
                }
                const Popups = (props) => (<PopupSupport {...props} popups={popups} onPopupClose={onPopupClose}/>);
                return {plugins: {...rest, tools: {...tools, popup: Popups}}};
            }),
        withPropsOnChange(
            ['plugins', 'onPopupClose', 'popups', 'currentMapLocation'],
            ({ plugins, onTranslateEnd } = {}) => {
                const {DrawSupport, tools = {}, ...rest} = plugins;
                if (!DrawSupport) {
                    return {};
                }

                const Draw = (props) => (<DrawSupport drawStatus="simpleDrag" {...props} onTranslateEnd={onTranslateEnd}/>);
                return {plugins: {...rest, tools: {...tools, draw: Draw}}};
            })
    )
);

/**
 * When mapLocationsEnabled is false, filters out locations layer before passing on layer props
 */
export const withoutLocationLayer = branch(({map: {mapLocationsEnabled = false} = {}}) => !mapLocationsEnabled,
    withProps(({layers}) => {
        const newLayers = layers.filter(layer => layer.id !== "locations");
        return {layers: newLayers};
    })
);


