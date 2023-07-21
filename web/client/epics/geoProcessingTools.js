/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import castArray from 'lodash/castArray';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import Rx from 'rxjs';
import uuidV1 from 'uuid/v1';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

import { updateAdditionalLayer, removeAdditionalLayer } from '../actions/additionallayers';
import {
    CHECK_WPS_AVAILABILITY,
    GET_FEATURES,
    RUN_BUFFER_PROCESS,
    RUN_INTERSECTION_PROCESS,
    runningProcess,
    SET_INTERSECTION_LAYER_ID,
    SET_SOURCE_LAYER_ID,
    SET_SOURCE_FEATURE_ID,
    SET_INTERSECTION_FEATURE_ID,
    checkingWPSAvailability,
    checkingIntersectionWPSAvailability,
    setIntersectionFeature,
    errorLoadingDFT,
    getFeatures,
    increaseBufferedCounter,
    increaseIntersectedCounter,
    setFeatures,
    setFeatureSourceLoading,
    setSourceFeature,
    setWPSAvailability
} from '../actions/geoProcessingTools';
import { getDescribeLayer, DESCRIBE_FEATURE_TYPE_LOADED } from '../actions/layerCapabilities';
import { addLayer, addGroup } from '../actions/layers';
import { zoomToExtent } from '../actions/map';
import { getLayerJSONFeature } from '../observables/wfs';
import bufferXML from '../observables/wps/buffer';
import collectGeometriesXML from '../observables/wps/collectGeometries';
import { describeProcess } from '../observables/wps/describe';
import executeProcess from '../observables/wps/execute';
import intersectXML from '../observables/wps/intersectionFeatureCollection';
import {
    bufferedLayersCounterSelector,
    distanceSelector,
    distanceUomSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    intersectionLayerIdSelector,
    intersectionFeatureSelector,
    intersectedLayersCounterSelector,
    sourceLayerIdSelector,
    sourceFeatureSelector
} from '../selectors/geoProcessingTools';
import { getLayerFromId as getLayerFromIdSelector, groupsSelector } from '../selectors/layers';
import { highlightStyleSelector, applyMapInfoStyle } from '../selectors/mapInfo';

import { getGeoJSONExtent, reprojectGeoJson} from '../utils/CoordinatesUtils';
import { convertGeoJSONFeatureToWKT } from '../utils/GeoProcessingToolsUtils';
import { extractFirstNonGeometryProp } from '../utils/WFSLayerUtils';
import { getFeatureSimple } from '../api/WFS';

export const checkWPSAvailabilityGPTEpic = (action$, store) => action$
    .ofType(CHECK_WPS_AVAILABILITY)
    .switchMap(({layerId, source}) => {
        const state = store.getState();
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const checkingWPS = source === "source" ? checkingWPSAvailability : checkingIntersectionWPSAvailability;
        return describeProcess(layerUrl, "geo:buffer,gs:IntersectionFeatureCollection,gs:CollectGeometries")
            .switchMap(response => Rx.Observable.defer(() => new Promise((resolve, reject) => parseString(response.data, {tagNameProcessors: [stripPrefix]}, (err, res) => err ? reject(err) : resolve(res)))))
            .flatMap(xmlObj => {
                const ids = [
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[2]?.Identifier?.[0]
                ];
                const areAllWpsAvailable = ["geo:buffer", "gs:IntersectionFeatureCollection", "gs:CollectGeometries"].reduce((status, process) => {
                    return status && findIndex(ids, x => x === process) > -1;
                }, true);

                const actions = [
                    setWPSAvailability(layerId, areAllWpsAvailable, source),
                    checkingWPS(false)
                ];
                if (areAllWpsAvailable) {
                    actions.push(getDescribeLayer(layerUrl, layer, {}, source));
                }
                return Rx.Observable.from(actions);
            })
            .catch((e) => {
                console.error(e);
                return Rx.Observable.of(setWPSAvailability(layerId, false, source), checkingWPS(false));
            })
            .startWith(checkingWPS(true));
    });

export const triggerGetFeaturesGPTEpic = (action$) => action$
    .ofType(DESCRIBE_FEATURE_TYPE_LOADED)
    .switchMap(({layerId, source}) => {
        return Rx.Observable.of(getFeatures(layerId, source));
    });

export const getFeaturesGPTEpic = (action$, store) => action$
    .ofType(GET_FEATURES)
    .switchMap(({layerId, source}) => {
        const state = store.getState();
        const layer = getLayerFromIdSelector(state, layerId);
        const filterObj = null;
        if (isNil(layer.describeFeatureType)) {
            // throw error and notify user that a failure has happened
            return Rx.Observable.of(errorLoadingDFT(layerId));
        }
        const options = {
            propertyName: extractFirstNonGeometryProp(layer.describeFeatureType)
        };
        return Rx.Observable.merge(
            getLayerJSONFeature({
                ...layer,
                name: layer?.name,
                search: {
                    ...(layer?.search ?? {}),
                    url: layer.url
                }
            }, filterObj, options)
                .map(data => setFeatures(layerId, source, data))
                .catch(error => {
                    console.error(error);
                    return Rx.Observable.of(setFeatures(layerId, source, error));
                })
                .startWith(setFeatureSourceLoading(true))
                .concat(Rx.Observable.of(setFeatureSourceLoading(false))));

    });
export const getFeatureDataGPTEpic = (action$, store) => action$
    .ofType(SET_SOURCE_FEATURE_ID)
    .filter(a => a.featureId !== "")
    .switchMap(({featureId}) => {
        const state = store.getState();
        const layerId = sourceLayerIdSelector(state);
        const highlightStyle = highlightStyleSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        return Rx.Observable.defer(() => getFeatureSimple(layer.search.url, {
            typeName: layer.name,
            featureID: featureId,
            outputFormat: "application/json"
        }))
            .switchMap(({features}) => {
                return Rx.Observable.from([
                    setSourceFeature(head(features)),
                    updateAdditionalLayer(
                        "gpt-layer",
                        "gpt",
                        "overlay",
                        {
                            type: "vector",
                            name: "highlight-gpt-features",
                            features: features.map(applyMapInfoStyle(highlightStyle))
                        }),
                    zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")
                ]);

            })
            .catch(error => {
                // [ ] handle get ft by id error

                console.error(error);
                return Rx.Observable.empty();
            });
    });

export const getIntersectionFeatureDataGPTEpic = (action$, store) => action$
    .ofType(SET_INTERSECTION_FEATURE_ID)
    .filter(a => a.featureId !== "")
    .switchMap(({featureId}) => {
        const state = store.getState();
        const layerId = intersectionLayerIdSelector(state);
        const highlightStyle = highlightStyleSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        return Rx.Observable.defer(() => getFeatureSimple(layer.search.url, {
            typeName: layer.name,
            featureID: featureId,
            outputFormat: "application/json"
        }))
            .switchMap(({features}) => {
                return Rx.Observable.from([
                    setIntersectionFeature(head(features)),
                    updateAdditionalLayer(
                        "gpt-layer-intersection",
                        "gpt",
                        "overlay",
                        {
                            type: "vector",
                            name: "highlight-gpt-intersection-features",
                            features: features.map(applyMapInfoStyle(highlightStyle))
                        }),
                    zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")
                ]);

            })
            .catch(error => {
                // [ ] handle get ft by id error

                console.error(error);
                return Rx.Observable.empty();
            });
    });
export const runBufferProcessGPTEpic = (action$, store) => action$
    .ofType(RUN_BUFFER_PROCESS)
    .switchMap(({}) => {
        const state = store.getState();
        const layerId = sourceLayerIdSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const quadrantSegments = quadrantSegmentsSelector(state);
        const capStyle = capStyleSelector(state);
        const executeOptions = {};
        let distance = distanceSelector(state); // do we need a fixing distance factor here 1.49 ??
        const distanceUom = distanceUomSelector(state);
        if (distanceUom === "km") {
            distance = distance * 1000;
        }
        const counter = bufferedLayersCounterSelector(state);

        const executeBufferProcess$ = (geom) => executeProcess(
            layerUrl,
            bufferXML({
                geometry3857: geom,
                distance,
                quadrantSegments,
                capStyle }),
            executeOptions, {
                headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
            });

        const bufferStream = (geometry) => Rx.Observable.defer(
            () =>
                executeBufferProcess$(geometry)
                    .switchMap((geom) => {
                        const actions = [
                            increaseBufferedCounter()
                        ];
                        const groups = groupsSelector(state);
                        if (!find(groups, ({id}) => id === "buffered.layers")) {
                            actions.push(addGroup("Buffered layers", null, {id: "buffered.layers"}));
                        }
                        actions.push(addLayer({
                            id: uuidV1(),
                            type: "vector",
                            name: "Buffer Layer " + counter,
                            title: "Buffer Layer " + counter,
                            visibility: true,
                            group: "buffered.layers",
                            features: [
                                reprojectGeoJson({
                                    id: 0,
                                    geometry: geom,
                                    type: "Feature"
                                }, "EPSG:3857", "EPSG:4326" )],
                            style: {
                                format: "geostyler",
                                body: {
                                    name: "",
                                    rules: [{
                                        symbolizers: [
                                            {
                                                "kind": "Fill",
                                                "outlineColor": "#3075e9",
                                                "fillOpacity": 0,
                                                "width": 3
                                            }
                                        ]
                                    }]
                                }
                            }
                        }));
                        return Rx.Observable.from(actions);
                    })
                    .catch(error => {
                    // [ ] handle get ft by id error

                        console.error(error);
                        return Rx.Observable.empty();
                    })
        );
        const feature = sourceFeatureSelector(state);
        if (isEmpty(feature)) {
            // then run the collect geometries which and then run the buffer
            const executeCollectProcess$ = executeProcess(
                layerUrl,
                collectGeometriesXML({ name: layer.name }),
                executeOptions,
                {
                    headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                });
            return executeCollectProcess$
                .switchMap((geom) => {
                    const ft = {
                        type: "Feature",
                        geometry: geom
                    };
                    const featureReprojected = reprojectGeoJson(ft, "EPSG:4326", "EPSG:3857");
                    const geometry3857 = convertGeoJSONFeatureToWKT(featureReprojected);
                    return bufferStream(geometry3857);
                })
                .startWith(runningProcess(true))
                .concat([runningProcess(false)]);
        }
        const featureReprojected = reprojectGeoJson(feature, "EPSG:4326", "EPSG:3857");
        const geometry3857 = convertGeoJSONFeatureToWKT(featureReprojected);
        return bufferStream(geometry3857)
            .startWith(runningProcess(true))
            .concat([runningProcess(false)]);

    });

export const resetSourceHighlightGPTEpic = (action$) => action$
    .ofType(SET_SOURCE_LAYER_ID, SET_SOURCE_FEATURE_ID)
    .filter(a => a.layerId === "" || a.featureId === "")
    .switchMap(({}) => {
        return Rx.Observable.of(removeAdditionalLayer({id: "gpt-layer"}));
    });
export const resetIntersectHighlightGPTEpic = (action$) => action$
    .ofType(SET_INTERSECTION_LAYER_ID, SET_INTERSECTION_FEATURE_ID)
    .filter(a => a.layerId === "" || a.featureId === "")
    .switchMap(({}) => {
        return Rx.Observable.of(removeAdditionalLayer({id: "gpt-layer-intersection"}));
    });

export const runIntersectProcessGPTEpic = (action$, store) => action$
    .ofType(RUN_INTERSECTION_PROCESS)
    .switchMap(({}) => {
        const state = store.getState();
        const layerId = sourceLayerIdSelector(state);
        const sourceFeature = sourceFeatureSelector(state);
        const intersectionFeature = intersectionFeatureSelector(state);

        if (isEmpty(sourceFeature)) {
            // collectGeom
        }
        if (isEmpty(intersectionFeature)) {
            // collectGeom
        }
        const firstFC = {
            type: "FeatureCollection",
            features: [sourceFeature]
        };
        const secondFC = {
            type: "FeatureCollection",
            features: [intersectionFeature]
        };
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const counter = intersectedLayersCounterSelector(state);
        const executeOptions = {};
        const executeProcess$ = executeProcess(
            layerUrl,
            intersectXML({ firstFC, secondFC }),
            executeOptions, {
                headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
            });

        // [ ] HANDLE COLLECT GEOMETRIES FOR BOTH LAYERS
        const intersection$ = executeProcess$
            .switchMap((featureCollection) => {
                const actions = [
                    increaseIntersectedCounter()
                ];
                const groups = groupsSelector(state);
                if (!find(groups, ({id}) => id === "intersection.layer")) {
                    actions.push(addGroup("Intersection Layer", null, {id: "intersection.layer"}));
                }

                actions.push(
                    addLayer({
                        id: uuidV1(),
                        type: "vector",
                        name: "Intersection Layer " + counter,
                        group: "intersection.layer",
                        title: "Intersection Layer " + counter,
                        visibility: true,
                        features: featureCollection.features,
                        style: {
                            format: "geostyler",
                            body: {
                                name: "",
                                rules: [{
                                    symbolizers: [
                                        {
                                            "kind": "Fill",
                                            "outlineColor": "#880000",
                                            "fillOpacity": 0.5,
                                            "width": 5
                                        }
                                    ]
                                }]
                            }
                        }
                    })
                );

                return Rx.Observable.from(actions);
                [

                ]);

            })
            .startWith(runningProcess(true))
            .concat([runningProcess(false)])
            .catch(error => {
                // [ ] handle get ft by id error

                console.error(error);
                return Rx.Observable.empty();
            });
        return intersection$;

    });
