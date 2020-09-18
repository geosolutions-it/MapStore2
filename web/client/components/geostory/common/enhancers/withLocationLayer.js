/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {branch, compose, withProps, withPropsOnChange, withStateHandlers, withHandlers } from 'recompose';
import {head} from 'lodash';
import uuidv1 from 'uuid/v1';
import buffer from 'turf-buffer';
import intersect from 'turf-intersect';

import { getLayer } from '../../../../utils/LayersUtils';
import { buildIdentifyRequest } from '../../../../utils/MapInfoUtils';


import LocationPopoverEditor from '../LocationPopoverEditor';
import MapInfoViewer from '../MapInfoViewer';


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

export const withLocationClickInEdit = branch(({editMap, map: {mapLocationsEnabled = false} = {}}) => mapLocationsEnabled && editMap,
    compose(
        withHandlers({
            onClick: ({update, currentMapLocation = "", layers = []}) => (point, layerId) =>  {
                if (currentMapLocation !== "") {
                    const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${currentMapLocation}"}].geometry`;
                    update(`${path}.coordinates`, [point.latlng.lng, point.latlng.lat]);
                    update(`${path}.rawPos`, point.rawPos);
                }

                if (layerId === "locations") {
                    const locationsLayer = getLayer(layerId, layers);

                    const cpoint = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [point.latlng.lng, point.latlng.lat]
                        }
                    };

                    let bufferedPoint = buffer(cpoint, 1, "meters");
                    const intersectingFeature = locationsLayer.features[0].features.filter(
                        (feature) => {
                            const buff = buffer(feature, 1, "meters");
                            const intersection = intersect(bufferedPoint, buff);
                            if (intersection) {
                                return true;
                            }
                            return false;
                        }
                    );

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
        withPropsOnChange(["popups", "layers", "currentMapLocation"], ({ layers = [], update = () => {}, currentMapLocation = "", mapInfoControlTrack }) => {
            const locationsLayer = getLayer('locations', layers);
            const locationFeatures = locationsLayer && locationsLayer.features[0].features || [];
            const currentLocationData = head(locationFeatures.filter((location) => location.id === currentMapLocation));
            if (!currentLocationData || (currentLocationData  && currentLocationData.geometry.coordinates.length === 0)) {
                currentMapLocation !== ""
                    ? update("map.mapInfoControl", false)
                    : update("map.mapInfoControl", mapInfoControlTrack);
                return { popups: [] };
            }

            currentMapLocation !== ""
                ? update("map.mapInfoControl", false)
                : update("map.mapInfoControl", mapInfoControlTrack);

            const component = () => (
                <LocationPopoverEditor
                    currentLocationData={currentLocationData}
                    update={(pathToHtml, html) => {
                        const path = `map.layers[{"id": "locations"}].features[{"id": "locFeatureCollection"}].features[{"id": "${currentMapLocation}"}].properties.${pathToHtml}`;
                        update(path, html);
                    }}
                    html={currentLocationData?.properties?.html}
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
            ({ plugins, layers = [], onTranslateEnd } = {}) => {
                const {DrawSupport, tools = {}, ...rest} = plugins;
                if (!DrawSupport) {
                    return {};
                }

                const locationsLayer = getLayer('locations', layers);
                const locationFeatures = locationsLayer && locationsLayer.features || [];
                const Draw = (props) => (<DrawSupport drawStatus="simpleDrag" {...props} features={locationFeatures} onTranslateEnd={onTranslateEnd}/>);
                return {plugins: {...rest, tools: {...tools, draw: Draw}}};
            })
    )
);

export const withLocationClick = branch(({editMap, map: { mapLocationsEnabled = false } = {}}) => mapLocationsEnabled && !editMap,
    compose(
        withStateHandlers(({'popups': []}), {
            onClick: (_state, { map, layers }) => (point) =>  {
                const locationsLayer = getLayer('locations', layers);

                const identifyOptions = {
                    format: "text/html",
                    map,
                    point,
                    currentLocale: "en-US"
                };

                const identifyRequest = buildIdentifyRequest(locationsLayer, {...identifyOptions});
                const { metadata } = identifyRequest;

                const cpoint = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [point.latlng.lng, point.latlng.lat]
                    }
                };

                let unit = metadata && metadata.units;
                switch (unit) {
                case "m":
                    unit = "meters";
                    break;
                case "deg":
                    unit = "degrees";
                    break;
                case "mi":
                    unit = "miles";
                    break;
                default:
                    unit = "meters";
                }

                let resolution = metadata && metadata.resolution || 1;
                let bufferedPoint = buffer(cpoint, (metadata.buffer || 1) * resolution, unit);

                const intersectingFeature = locationsLayer.features[0].features.filter(
                    (feature) => {
                        const buff = buffer(feature, 1, "meters");
                        const intersection = intersect(bufferedPoint, buff);
                        if (intersection) {
                            return true;
                        }
                        return false;
                    }
                );

                const responses = [
                    {
                        format: "HTML",
                        layerMetadata: {
                            featureInfo: {},
                            features: [],
                            featuresCrs: "EPSG:3857",
                            title: "Locations",
                            viewer: {}
                        },
                        queryParams: {
                            lat: point.latlng.lat,
                            lng: point.latlng.lng
                        },
                        response: `<body><p>${intersectingFeature[0].properties.html}</p></body>`
                    }
                ];
                // HARD CODE FOR NOW.
                const requests = [{}];
                const validResponses = [
                    {
                        format: "HTML",
                        layerMetadata: {
                            featureInfo: {},
                            features: [],
                            featuresCrs: "EPSG:3857",
                            title: "Locations",
                            viewer: {}
                        },
                        queryParams: {
                            lat: point.latlng.lat,
                            lng: point.latlng.lng
                        },
                        response: `<body><p>${intersectingFeature[0].properties.html}</p></body>`
                    }
                ];

                const component = () => (<MapInfoViewer
                    responses={responses} requests={requests}
                    validResponses={validResponses}
                    showEmptyMessageGFI
                    missingResponses={(requests || []).length - (responses || []).length} />);

                const popups = [{position: { coordinates: point.rawPos }, id: uuidv1() }];
                return {popups: popups.map((popup) => ({...popup, component}))};
            },
            onPopupClose: () => () => ({popups: []})
        }),
        withPropsOnChange(
            ['plugins', 'onPopupClose', 'popups'],
            ({plugins, popups, onPopupClose} = {}) => {
                const {PopupSupport, tools = {}, ...rest} = plugins;
                if (!PopupSupport) {
                    return {};
                }
                const Popups = (props) => (<PopupSupport {...props} popups={popups} onPopupClose={onPopupClose}/>);
                return {plugins: {...rest, tools: {...tools, popup: Popups}}};
            })
    )
);

export const withoutLocationLayer = branch(({map: {mapLocationsEnabled = false} = {}}) => !mapLocationsEnabled,
    withProps(({layers}) => {
        const newLayers = layers.filter(layer => layer.id !== "locations");
        return {layers: newLayers};
    })
);


