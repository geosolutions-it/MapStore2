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
import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import Rx from 'rxjs';
import uuidV1 from 'uuid/v1';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

import {
    UPDATE_MAP_LAYOUT,
    updateMapLayout
} from "../actions/maplayout";
import centroidTurf from '@turf/centroid';
import {
    mergeOptionsByOwner,
    updateAdditionalLayer,
    removeAdditionalLayer
} from '../actions/additionallayers';
import {
    changeDrawingStatus
} from "../actions/draw";
import {
    GPT_CONTROL_NAME,
    CHECK_WPS_AVAILABILITY,
    checkingIntersectionWPSAvailability,
    checkingWPSAvailability,
    setInvalidLayer,
    errorLoadingDFT,
    GET_FEATURES,
    getFeatures,
    increaseBufferedCounter,
    increaseIntersectedCounter,
    RUN_BUFFER_PROCESS,
    RUN_INTERSECTION_PROCESS,
    runningProcess,
    SET_INTERSECTION_FEATURE_ID,
    SET_INTERSECTION_LAYER_ID,
    SET_SOURCE_FEATURE_ID,
    SET_SOURCE_LAYER_ID,
    setFeatures,
    setFeatureSourceLoading,
    setIntersectionFeature,
    setSourceFeatureId,
    setIntersectionFeatureId,
    setSourceFeature,
    SET_SELECTED_LAYER_TYPE,
    setWPSAvailability,
    TOGGLE_HIGHLIGHT_LAYERS
} from '../actions/geoProcessingTools';
import {
    getDescribeLayer,
    DESCRIBE_FEATURE_TYPE_LOADED,
    DESCRIBE_COVERAGES_LOADED
} from '../actions/layerCapabilities';
import { addLayer, addGroup } from '../actions/layers';
import {
    zoomToExtent,
    CLICK_ON_MAP,
    registerEventListener
} from "../actions/map";
import {
    hideMapinfoMarker,
    purgeMapInfoResults,
    changeMapInfoState
} from "../actions/mapInfo";
import {
    success as showSuccessNotification,
    error as showErrorNotification,
    warning as showWarningNotification
} from '../actions/notifications';
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
    isListeningClickSelector,
    quadrantSegmentsSelector,
    capStyleSelector,
    intersectionLayerIdSelector,
    selectedLayerTypeSelector,
    intersectionFeatureSelector,
    intersectedLayersCounterSelector,
    sourceLayerIdSelector,
    selectedLayerIdSelector,
    sourceFeatureSelector,
    showHighlightLayersSelector,
    isDockOpenSelector
} from '../selectors/geoProcessingTools';
import { getLayerFromId as getLayerFromIdSelector, groupsSelector } from '../selectors/layers';
import { mapSelector } from '../selectors/map';
import { highlightStyleSelector, applyMapInfoStyle, mapInfoEnabledSelector } from '../selectors/mapInfo';

import {
    getGeoJSONExtent,
    reprojectGeoJson,
    calculateDistance
} from "../utils/CoordinatesUtils";
import { convertGeoJSONFeatureToWKT } from '../utils/GeoProcessingToolsUtils';
import {buildIdentifyRequest} from "../utils/MapInfoUtils";
import { extractFirstNonGeometryProp } from '../utils/WFSLayerUtils';
import {getFeatureInfo} from "../api/identify";
import { getFeatureSimple } from '../api/WFS';

const OFFSET = 550;
const DEACTIVATE_ACTIONS = [
    changeDrawingStatus("stop"),
    changeDrawingStatus("clean", '', GPT_CONTROL_NAME)
];
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
export const disableCoverageLayerGPTEpic = (action$) => action$
    .ofType(DESCRIBE_COVERAGES_LOADED)
    .switchMap(({layerId}) => {
        return Rx.Observable.of(setInvalidLayer(layerId, true));
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
        const showHighlightLayers = showHighlightLayersSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        return Rx.Observable.defer(() => getFeatureSimple(layer.search.url, {
            typeName: layer.name,
            featureID: featureId,
            outputFormat: "application/json"
        }))
            .switchMap(({features}) => {
                const zoomTo = showHighlightLayers ? [zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")] : [];
                return Rx.Observable.from([
                    setSourceFeature(head(features)),
                    updateAdditionalLayer(
                        "gpt-layer",
                        "gpt",
                        "overlay",
                        {
                            type: "vector",
                            name: "highlight-gpt-features",
                            visibility: showHighlightLayers,
                            features: features.map(applyMapInfoStyle(highlightStyle))
                        }),
                    ...zoomTo
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
        const showHighlightLayers = showHighlightLayersSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        return Rx.Observable.defer(() => getFeatureSimple(layer.search.url, {
            typeName: layer.name,
            featureID: featureId,
            outputFormat: "application/json"
        }))
            .switchMap(({features}) => {
                const zoomTo = showHighlightLayers ? [zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")] : [];
                return Rx.Observable.from([
                    setIntersectionFeature(head(features)),
                    updateAdditionalLayer(
                        "gpt-layer-intersection",
                        "gpt",
                        "overlay",
                        {
                            type: "vector",
                            name: "highlight-gpt-intersection-features",
                            visibility: showHighlightLayers,
                            features: features.map(applyMapInfoStyle(highlightStyle))
                        }),
                    ...zoomTo
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

        const executeBufferProcess$ = (wktGeom, feature4326) => {
            // [ ] to be tested
            const centroid = centroidTurf(feature4326);
            const reprojectedCentroid = reprojectGeoJson(centroid, "EPSG:4326", "EPSG:3857");
            let centroidOffset = reprojectGeoJson({
                type: "Feature",
                geometry: {
                    ...reprojectedCentroid.geometry,
                    coordinates: [reprojectedCentroid.geometry.coordinates[0] - 1000, reprojectedCentroid.geometry.coordinates[1]]
                }
            }, "EPSG:3857", "EPSG:4326");
            const distanceGeodetic = calculateDistance([centroid.geometry.coordinates, centroidOffset.geometry.coordinates]);
            const distanceFactor = 1000 / distanceGeodetic;
            distance = distance * distanceFactor;
            return executeProcess(
                layerUrl,
                bufferXML({
                    geometry3857: wktGeom,
                    distance,
                    quadrantSegments,
                    capStyle }),
                executeOptions, {
                    headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                });
        };

        const bufferStream = (wktGeom, feature4326) => Rx.Observable.defer(
            () =>
                executeBufferProcess$(wktGeom, feature4326)
                    .switchMap((geom) => {
                        const actions = [
                            increaseBufferedCounter()
                        ];
                        const groups = groupsSelector(state);
                        if (!find(groups, ({id}) => id === "buffered.layers")) {
                            actions.push(addGroup("Buffered layers", null, {id: "buffered.layers"}));
                            // [ ] localize group name and layer name
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

                        actions.push(showSuccessNotification({
                            title: "notification.success",
                            message: "GeoProcessingTools.notifications.successfulBuffer",
                            autoDismiss: 6,
                            position: "tc"
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
                    return bufferStream(geometry3857, ft);
                })
                .startWith(runningProcess(true))
                .concat([runningProcess(false)]);
        }
        const featureReprojected = reprojectGeoJson(feature, "EPSG:4326", "EPSG:3857");
        const geometry3857 = convertGeoJSONFeatureToWKT(featureReprojected);
        return bufferStream(geometry3857, feature)
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
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const sourceFeature = sourceFeatureSelector(state);
        const executeOptions = {};
        const intersectionFeature = intersectionFeatureSelector(state);
        let sourceFC$;
        let intersectionFC$;
        if (isEmpty(sourceFeature)) {
            sourceFC$ = executeProcess(
                layerUrl,
                collectGeometriesXML({ name: layer.name }),
                executeOptions,
                {
                    headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                });
        } else {
            sourceFC$ = Rx.Observable.of(sourceFeature.geometry);
        }
        if (isEmpty(intersectionFeature)) {
            const intersectionLayerId = intersectionLayerIdSelector(state);
            const intersectionLayer = getLayerFromIdSelector(state, intersectionLayerId);
            const intersectionLayerUrl = head(castArray(intersectionLayer.url));
            intersectionFC$ = executeProcess(
                intersectionLayerUrl,
                collectGeometriesXML({ name: intersectionLayer.name }),
                executeOptions,
                {
                    headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                });
        } else {
            intersectionFC$ = Rx.Observable.of(intersectionFeature.geometry);
        }
        return Rx.Observable.forkJoin(sourceFC$, intersectionFC$)
            .switchMap(([firstGeom, secondGeom]) => {
                const counter = intersectedLayersCounterSelector(state);

                const executeProcess$ = executeProcess(
                    layerUrl,
                    intersectXML({
                        firstFC: {
                            type: "FeatureCollection",
                            features: [{type: "Feature", geometry: firstGeom}]
                        },
                        secondFC: {
                            type: "FeatureCollection",
                            features: [{type: "Feature", geometry: secondGeom}]
                        }
                    }),
                    executeOptions,
                    {
                        headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                    });

                const intersection$ = executeProcess$
                    .switchMap((featureCollection) => {
                        const actions = [
                            increaseIntersectedCounter()
                        ];
                        const groups = groupsSelector(state);
                        if (!find(groups, ({id}) => id === "intersection.layer")) {
                            actions.push(addGroup("Intersection Layer", null, {id: "intersection.layer"}));
                            // [ ] localize group name and layer name
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
                        actions.push(showSuccessNotification({
                            title: "notification.success",
                            message: "GeoProcessingTools.notifications.successfulIntersection",
                            autoDismiss: 6,
                            position: "tc"
                        }));

                        return Rx.Observable.from(actions);

                    })
                    .catch(error => {
                        console.error(error);
                        return Rx.Observable.of(showErrorNotification({
                            title: "errorTitleDefault",
                            message: "GeoProcessingTools.notifications.errorIntersectGFI",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                    });
                return intersection$;
            })
            .startWith(runningProcess(true))
            .concat([runningProcess(false)]);

    });

export const toggleHighlightLayersGPTEpic = (action$, store) => action$
    .ofType(TOGGLE_HIGHLIGHT_LAYERS)
    .switchMap(() => {
        const showHighlightLayers = showHighlightLayersSelector(store.getState());
        return Rx.Observable.of(mergeOptionsByOwner("gpt", {
            visibility: showHighlightLayers
        }));
    });

//
export const disableIdentifyGPTEpic = (action$, {getState}) =>
    action$
        .ofType(SET_SELECTED_LAYER_TYPE)
        .switchMap(({source}) => {
            const state = getState();
            return Rx.Observable.from([
                purgeMapInfoResults(),
                hideMapinfoMarker(),
                ...(get(state, 'draw.drawOwner', '') === GPT_CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
                registerEventListener('click', GPT_CONTROL_NAME),
                ...(mapInfoEnabledSelector(state) ? [changeMapInfoState(false)] : [changeMapInfoState(!source)]
                )]);
        });

// [ ] verify this
export const clickToSelectFeatureGPTEpic = (action$, {getState}) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(() => isListeningClickSelector(getState()))
        .switchMap(({point}) => {
            const state = getState();
            const map = mapSelector(state);
            const layerId = selectedLayerIdSelector(state);
            const selectedLayerType = selectedLayerTypeSelector(state);
            const updateFeature = selectedLayerType === "source" ? setSourceFeature : setIntersectionFeature;
            const updateFeatureId = selectedLayerType === "source" ? setSourceFeatureId : setIntersectionFeatureId;
            const layer = getLayerFromIdSelector(state, layerId);
            let {
                url,
                request
            } = buildIdentifyRequest(layer, {format: 'application/json', map, point});

            const basePath = url;
            const param = {...request};
            if (url) {
                return getFeatureInfo(basePath, param, layer, {attachJSON: true})
                    .switchMap(({features}) => {

                        if (features?.length) {
                            return Rx.Observable.from([
                                updateFeature(features[0]),
                                updateFeatureId(features[0].id),
                                showSuccessNotification({
                                    title: "notification.success",
                                    message: "GeoProcessingTools.notifications.featureFound",
                                    autoDismiss: 10,
                                    position: "tc"
                                })
                            ]);
                        }
                        return Rx.Observable.of(showWarningNotification({
                            title: "notification.warning",
                            message: "GeoProcessingTools.notifications.noFeatureInPoint",
                            autoDismiss: 10,
                            position: "tc"
                        }));
                    })
                    .catch(e => {
                        console.error("Error while obtaining data for longitudinal profile");
                        console.error(e);
                        return Rx.Observable.of(showErrorNotification({
                            title: "errorTitleDefault",
                            message: "GeoProcessingTools.notifications.errorGFI",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                    });
            }

            const intersected = (point?.intersectedFeatures ?? []).find(l => l.id === layer.id);
            const feature = intersected?.features[0];
            if (feature) {
                return Rx.Observable.of(
                    updateFeature(feature),
                    updateFeatureId(feature.id)
                );
            }
            return  Rx.Observable.of(showWarningNotification({
                title: "notification.warning",
                message: "longitudinalProfile.warnings.noFeatureInPoint",
                autoDismiss: 10,
                position: "tc"
            }));
        });

/**
 * Re-trigger an update map layout with the margin to adjust map layout and show navigation toolbar. This
 * also keep the zoom to extent offsets aligned with the current visibile window, so when zoom the Geo processing tools
 * is considered as a right offset and it will not cover the zoomed features.
 */
export const LPlongitudinalMapLayoutGPTEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => isDockOpenSelector(store.getState()) &&  source !== GPT_CONTROL_NAME)
        .map(({layout}) => {
            const action = updateMapLayout({
                ...layout,
                right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0),
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0)
                },
                rightPanel: true
            });
            return { ...action, source: GPT_CONTROL_NAME }; // add an argument to avoid infinite loop.
        });
