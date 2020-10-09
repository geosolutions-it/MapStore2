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
import { buildIdentifyRequest, getValidator } from '../../../../utils/MapInfoUtils';

import LocationPopoverEditor from '../LocationPopoverEditor';
import MapInfoViewer from '../MapInfoViewer';

/**
* Gets the feature that was clicked on a map layer
* @param {array} layers the layers from which the required layer(layerId) can be filtered from
* @param {string} layerId the id of the layer to which the clicked feature belongs
* @param {object} options buildIndentifyRequest options
*/
const getIntersectingFeature = (layers, layerId, options) => {
    const locationsLayer = getLayer(layerId, layers);

    const identifyRequest = buildIdentifyRequest(locationsLayer, {...options});
    const { metadata } = identifyRequest;

    const cpoint = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": [options.point.latlng.lng, options.point.latlng.lat]
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

    const resolution = metadata && metadata.resolution || 1;
    const bufferedPoint = buffer(cpoint, (metadata.buffer || 1) * resolution, unit);

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

    return intersectingFeature;
};

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
        withPropsOnChange(["popups", "layers", "currentMapLocation"], ({ layers = [], update = () => {}, currentMapLocation = "", mapInfoControlTrack }) => {
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
 * Allows clicking on map points when editMap is not true and uses IdentifyTool to display information
 */
export const withLocationClick = branch(({editMap, map: { mapLocationsEnabled = false } = {}}) => mapLocationsEnabled && !editMap,
    compose(
        withStateHandlers(({'popups': []}), {
            onClick: (_state, { map, layers }) => (point) =>  {
                const options = {
                    map,
                    point
                };

                const intersectingFeature = getIntersectingFeature(layers, "locations", options);

                if (intersectingFeature[0]) {
                    const responses = [
                        {
                            format: "HTML",
                            layerMetadata: {
                                featureInfo: {},
                                features: [],
                                featuresCrs: map.projection,
                                title: "Locations",
                                viewer: {}
                            },
                            queryParams: {
                                lat: point.latlng.lat,
                                lng: point.latlng.lng
                            },
                            response: `<body><p>${intersectingFeature[0]?.properties?.html}</p></body>`
                        }
                    ];

                    const requests = [{}];
                    const validator = getValidator("HTML");
                    const validResponses = validator.getValidResponses(responses, true);

                    const component = () => (<MapInfoViewer
                        responses={responses} requests={requests}
                        validResponses={validResponses}
                        showEmptyMessageGFI
                        missingResponses={(requests || []).length - (responses || []).length} />);

                    const popups = [{position: { coordinates: point.rawPos }, id: uuidv1() }];
                    return {popups: popups.map((popup) => ({...popup, component}))};

                }
                return {popups: []};
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

/**
 * When mapLocationsEnabled is false, filters out locations layer before passing on layer props
 */
export const withoutLocationLayer = branch(({map: {mapLocationsEnabled = false} = {}}) => !mapLocationsEnabled,
    withProps(({layers}) => {
        const newLayers = layers.filter(layer => layer.id !== "locations");
        return {layers: newLayers};
    })
);


