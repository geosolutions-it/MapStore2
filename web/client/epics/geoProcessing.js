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
import {parseString} from 'xml2js';
import {stripPrefix} from 'xml2js/lib/processors';

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
    TOGGLE_CONTROL
} from "../actions/controls";
import {
    GPT_TOOL_BUFFER,
    GPT_TOOL_INTERSECTION,
    GPT_INTERSECTION_HIGHLIGHT_ID,
    GPT_SOURCE_HIGHLIGHT_ID,
    GPT_CONTROL_NAME,
    GPT_INTERSECTION_GROUP_ID,
    GPT_BUFFER_GROUP_ID,

    setSelectedLayerType,
    CHECK_WPS_AVAILABILITY,
    checkingIntersectionWPSAvailability,
    checkingWPSAvailability,
    setInvalidLayer,
    errorLoadingDFT,
    GET_FEATURES,
    getFeatures,
    increaseBufferedCounter,
    increaseIntersectedCounter,
    RESET,
    RUN_PROCESS,
    runningProcess,
    SET_INTERSECTION_FEATURE_ID,
    SET_INTERSECTION_LAYER_ID,
    SET_SOURCE_FEATURE_ID,
    SET_SOURCE_LAYER_ID,
    setFeatures,
    setFeatureSourceLoading,
    setFeatureIntersectionLoading,
    setIntersectionFeature,
    setSourceFeatureId,
    setIntersectionFeatureId,
    setSourceFeature,
    SET_SELECTED_LAYER_TYPE,
    setWPSAvailability,
    TOGGLE_HIGHLIGHT_LAYERS
} from '../actions/geoProcessing';
import {
    getDescribeLayer
} from '../actions/layerCapabilities';
import {addLayer, addGroup, UPDATE_NODE} from '../actions/layers';
import {
    zoomToExtent,
    CLICK_ON_MAP,
    registerEventListener,
    unRegisterEventListener
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
    selectedToolSelector,
    sourceFeaturesSelector,
    sourceTotalCountSelector,
    intersectionTotalCountSelector,
    intersectionFeaturesSelector,
    maxFeaturesSelector,
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
    showHighlightLayersSelector
} from '../selectors/geoProcessing';
import {getLayerFromId as getLayerFromIdSelector, groupsSelector} from '../selectors/layers';
import {additionalLayersSelector} from '../selectors/additionallayers';
import {isGeoProcessingEnabledSelector} from '../selectors/controls';
import {mapSelector} from '../selectors/map';
import {highlightStyleSelector, applyMapInfoStyle, mapInfoEnabledSelector} from '../selectors/mapInfo';

import {
    getGeoJSONExtent,
    reprojectGeoJson,
    calculateDistance
} from "../utils/CoordinatesUtils";
import {buildIdentifyRequest} from "../utils/MapInfoUtils";
import {getFeatureInfo} from "../api/identify";
import {getFeatureSimple} from '../api/WFS';
import {findNonGeometryProperty} from '../utils/ogc/WFS/base';
import toWKT from '../utils/ogc/WKT/toWKT';

const OFFSET = 550;
const DEACTIVATE_ACTIONS = [
    changeDrawingStatus("stop"),
    changeDrawingStatus("clean", '', GPT_CONTROL_NAME)
];
/**
 * checks if a layer is a valid one that can be used in the gpt tool.
 * also checks if it is a raster using describe layer
 *
 * this is a unique epics for two layer fields "source" and "intersection" that are used in
 * these two process "buffer" and "intersection", no need to generalize this now
 */
export const checkWPSAvailabilityGPTEpic = (action$, store) => action$
    .ofType(CHECK_WPS_AVAILABILITY)
    .mergeMap(({layerId, source}) => {
        const state = store.getState();
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const checkingWPS = source === "source" ? checkingWPSAvailability : checkingIntersectionWPSAvailability;
        return describeProcess(layerUrl, "geo:buffer,gs:IntersectionFeatureCollection,gs:CollectGeometries")
            .mergeMap(response => Rx.Observable.defer(
                () => new Promise((resolve, reject) => parseString(response.data, {tagNameProcessors: [stripPrefix]}, (err, res) => err ? reject(err) : resolve(res))))
            )
            .flatMap(xmlObj => {
                const ids = [
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[2]?.Identifier?.[0]
                ];
                const areAllWpsAvailable = ["geo:buffer", "gs:IntersectionFeatureCollection", "gs:CollectGeometries"].reduce((status, process) => {
                    return status && findIndex(ids, x => x === process) > -1;
                }, true);

                if (!areAllWpsAvailable) {
                    // just set the layer to invalid,
                    // the wps flag to false
                    // no need to ask the describe layer and describe feature type
                    return Rx.Observable.from(
                        [
                            setInvalidLayer(layerId, source),
                            setWPSAvailability(layerId, false, source),
                            checkingWPS(false)
                        ]);
                }
                // wps are all present, so we continue the checks
                if (layer.describeFeatureType) {
                    // we have the describe feature type available so we just fetch features
                    return Rx.Observable.from([
                        setWPSAvailability(layerId, true, source),
                        getFeatures(layerId, source, 0),
                        checkingWPS(false)
                    ]);
                }
                // wps are all present, but
                // we miss the describe feature type info so we trigger it and we wait for the answer

                return Rx.Observable.from([
                    setWPSAvailability(layerId, true, source),
                    getDescribeLayer(layerUrl, layer, {}, source),
                    checkingWPS(false)
                ])
                    .merge(
                        Rx.Observable.race(
                            action$.ofType(UPDATE_NODE).filter(({node}) => node === layerId),
                            Rx.Observable.timer(10 * 1000).mapTo("timeout")
                        )
                            .switchMap((act) => {
                                // if the describe ft goes in timeout or has an error we invalidate the layer
                                if (act === "timeout" || act?.error) {
                                    return Rx.Observable.of(setInvalidLayer(layerId, source));
                                }
                                return Rx.Observable.of(getFeatures(layerId, source, 0));
                            })
                    );
            })
            .catch((e) => {
                console.error(e);
                return Rx.Observable.of(
                    setWPSAvailability(layerId, false, source),
                    checkingWPS(false)
                );
            })
            .startWith(checkingWPS(true));
    });
/**
 * fetch all features ids
 *
 * this is a unique epic for fetching features of two layer fields "source" and "intersection"
 * that are used in these two process "buffer" and "intersection", no need to generalize this now
 */
export const getFeaturesGPTEpic = (action$, store) => action$
    .ofType(GET_FEATURES)
    .filter(({source}) => {
        const state = store.getState();
        let features;
        let totalCount;
        if (source === "source") {
            totalCount = sourceTotalCountSelector(state);
            features = sourceFeaturesSelector(state);
        } else {
            features = intersectionFeaturesSelector(state);
            totalCount = intersectionTotalCountSelector(state);
        }
        return totalCount === 0 || totalCount > features.length;

    })
    .mergeMap(({
        layerId,
        source,
        page
    }) => {
        const state = store.getState();
        const setFeatureLoading = source === "source" ? setFeatureSourceLoading : setFeatureIntersectionLoading;
        const layer = getLayerFromIdSelector(state, layerId);
        const maxFeatures = maxFeaturesSelector(state);
        const filterObj = null;
        if (isNil(layer?.describeFeatureType)) {
            // throw error and notify user that a failure has happened
            return Rx.Observable.of(errorLoadingDFT(layerId));
        }
        const options = {
            propertyName: findNonGeometryProperty(layer.describeFeatureType)[0].name,
            startIndex: page * maxFeatures,
            maxFeatures
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
                .map(data => setFeatures(layerId, source, data, page))
                .catch(error => {
                    return Rx.Observable.of(setFeatures(layerId, source, error, page));
                })
                .startWith(setFeatureLoading(true))
                .concat(Rx.Observable.of(setFeatureLoading(false))));

    });
/**
 * fetch the source feature geom by id
 *
 * this is a unique epic related to the "source" layer
 * that are used in these two process "buffer" and "intersection", no need to generalize this
 */
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
            outputFormat: "application/json",
            srsName: "EPSG:4326"
        }))
            .switchMap(({features}) => {
                const zoomTo = showHighlightLayers ? [zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")] : [];
                return Rx.Observable.from([
                    setSourceFeature(head(features)),
                    updateAdditionalLayer(
                        GPT_SOURCE_HIGHLIGHT_ID,
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
            .catch(() => {
                return Rx.Observable.of(showErrorNotification({
                    title: "errorTitleDefault",
                    message: "GeoProcessing.notifications.errorGetFeature",
                    autoDismiss: 6,
                    position: "tc"
                }));
            });
    });
/**
 * fetch the intersection feature geom by id
 *
 * this is a unique epic related to the "intersection" layer
 * that are used in this process "intersection"
 */
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
            outputFormat: "application/json",
            srsName: "EPSG:4326"
        }))
            .switchMap(({features}) => {
                const zoomTo = showHighlightLayers ? [zoomToExtent(getGeoJSONExtent(features[0].geometry), "EPSG:4326")] : [];
                return Rx.Observable.from([
                    setIntersectionFeature(head(features)),
                    updateAdditionalLayer(
                        GPT_INTERSECTION_HIGHLIGHT_ID,
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
            .catch(() => {
                return Rx.Observable.of(showErrorNotification({
                    title: "errorTitleDefault",
                    message: "GeoProcessing.notifications.errorGetFeature",
                    autoDismiss: 6,
                    position: "tc"
                }));
            });
    });
/**
 * run buffer process and update toc with new layer geom
 */
export const runBufferProcessGPTEpic = (action$, store) => action$
    .ofType(RUN_PROCESS)
    .filter(({process}) => process === GPT_TOOL_BUFFER )
    .switchMap(({}) => {
        const state = store.getState();
        const layerId = sourceLayerIdSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const quadrantSegments = quadrantSegmentsSelector(state);
        const capStyle = capStyleSelector(state);
        const executeOptions = {};
        let distance = distanceSelector(state);
        const distanceUom = distanceUomSelector(state);
        if (distanceUom === "km") {
            distance = distance * 1000;
        }
        const counter = bufferedLayersCounterSelector(state);

        const executeBufferProcess$ = (wktGeom, feature4326) => {
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
                    capStyle
                }),
                executeOptions, {
                    headers: {'Content-Type': 'application/xml', 'Accept': `application/xml, application/json`}
                });
        };

        const bufferStream = (wktGeom, feature4326) => Rx.Observable.defer(
            () =>
                executeBufferProcess$(wktGeom, feature4326)
                    .switchMap((geom) => {
                        const groups = groupsSelector(state);
                        const groupExist = find(groups, ({id}) => id === GPT_BUFFER_GROUP_ID);
                        const features = [
                            reprojectGeoJson({
                                id: 0,
                                geometry: geom,
                                type: "Feature"
                            }, "EPSG:3857", "EPSG:4326" )
                        ];
                        const extent = getGeoJSONExtent({
                            features,
                            type: "FeatureCollection"
                        });
                        return (!groupExist ? Rx.Observable.of( addGroup("Buffered layers", null, {id: GPT_BUFFER_GROUP_ID}, true)) : Rx.Observable.empty())
                            .concat(
                                Rx.Observable.of(
                                    increaseBufferedCounter(),
                                    addLayer({
                                        id: uuidV1(),
                                        type: "vector",
                                        name: "Buffer Layer " + counter,
                                        title: "Buffer Layer " + counter,
                                        visibility: true,
                                        group: GPT_BUFFER_GROUP_ID,
                                        bbox: {
                                            crs: "EPSG:4326",
                                            bounds: {
                                                minx: extent[0],
                                                miny: extent[1],
                                                maxx: extent[2],
                                                maxy: extent[3]
                                            }
                                        },
                                        features,
                                        style: {
                                            format: "geostyler",
                                            body: {
                                                name: "",
                                                rules: [{
                                                    symbolizers: [
                                                        {
                                                            "kind": "Fill",
                                                            "outlineWidth": 3,
                                                            "outlineColor": "#ffac12",
                                                            "color": "#ffffff",
                                                            "fillOpacity": 0.3
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    }),
                                    zoomToExtent(extent, "EPSG:4326"),
                                    showSuccessNotification({
                                        title: "notification.success",
                                        message: "GeoProcessing.notifications.successfulBuffer",
                                        autoDismiss: 6,
                                        position: "tc"
                                    })
                                )
                            );
                    })
                    .catch(() => {
                        return Rx.Observable.of(showErrorNotification({
                            title: "errorTitleDefault",
                            message: "GeoProcessing.notifications.errorBuffer",
                            autoDismiss: 6,
                            position: "tc"
                        }));
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
                }).catch(() => {
                return Rx.Observable.of(showErrorNotification({
                    title: "errorTitleDefault",
                    message: "GeoProcessing.notifications.errorBuffer",
                    autoDismiss: 6,
                    position: "tc"
                }));
            });
            return executeCollectProcess$
                .switchMap((geom) => {
                    const ft = {
                        type: "Feature",
                        geometry: geom
                    };
                    const featureReprojected = reprojectGeoJson(ft, "EPSG:4326", "EPSG:3857");
                    const geometry3857 = toWKT(featureReprojected.geometry);
                    return bufferStream(geometry3857, ft);
                })
                .startWith(runningProcess(true))
                .concat(Rx.Observable.of(runningProcess(false)));
        }
        const featureReprojected = reprojectGeoJson(feature, "EPSG:4326", "EPSG:3857");
        const geometry3857 = toWKT(featureReprojected.geometry);
        return bufferStream(geometry3857, feature)
            .startWith(runningProcess(true))
            .concat(Rx.Observable.of(runningProcess(false)));

    });
/**
 * clear source highlight feature
 */
export const resetSourceHighlightGPTEpic = (action$) => action$
    .ofType(SET_SOURCE_LAYER_ID, SET_SOURCE_FEATURE_ID)
    .filter(a => a.layerId === "" || a.featureId === "")
    .switchMap(({}) => {
        return Rx.Observable.of(removeAdditionalLayer({id: GPT_SOURCE_HIGHLIGHT_ID}));
    });
/**
 * clear intersection highlight feature
 */
export const resetIntersectHighlightGPTEpic = (action$) => action$
    .ofType(SET_INTERSECTION_LAYER_ID, SET_INTERSECTION_FEATURE_ID)
    .filter(a => a.layerId === "" || a.featureId === "")
    .switchMap(({}) => {
        return Rx.Observable.of(removeAdditionalLayer({id: GPT_INTERSECTION_HIGHLIGHT_ID}));
    });
/**
 * run intersection process and update toc with new layer geom
 */
export const runIntersectProcessGPTEpic = (action$, store) => action$
    .ofType(RUN_PROCESS)
    .filter(({process}) => process === GPT_TOOL_INTERSECTION )
    .switchMap(({}) => {
        const state = store.getState();
        const layerId = sourceLayerIdSelector(state);
        const layer = getLayerFromIdSelector(state, layerId);
        const layerUrl = head(castArray(layer.url));
        const sourceFeature = sourceFeatureSelector(state);
        const executeOptions = {};
        const intersectionFeature = intersectionFeatureSelector(state);
        const counter = intersectedLayersCounterSelector(state);
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
                        const groups = groupsSelector(state);
                        const groupExist = find(groups, (g) => g.id === GPT_INTERSECTION_GROUP_ID);
                        const extent = getGeoJSONExtent(featureCollection);
                        return (!groupExist ? Rx.Observable.of( addGroup("Intersected Layers", null, {id: GPT_INTERSECTION_GROUP_ID}, true)) : Rx.Observable.empty())
                            .concat(
                                Rx.Observable.of(
                                    increaseIntersectedCounter(),
                                    addLayer({
                                        id: uuidV1(),
                                        type: "vector",
                                        name: "Intersection Layer " + counter,
                                        group: GPT_INTERSECTION_GROUP_ID,
                                        title: "Intersection Layer " + counter,
                                        visibility: true,
                                        features: featureCollection.features,
                                        bbox: {
                                            crs: "EPSG:4326",
                                            bounds: {
                                                minx: extent[0],
                                                miny: extent[1],
                                                maxx: extent[2],
                                                maxy: extent[3]
                                            }
                                        },
                                        style: {
                                            format: "geostyler",
                                            body: {
                                                name: "",
                                                rules: [{
                                                    symbolizers: [
                                                        {
                                                            "kind": "Fill",
                                                            "outlineWidth": 3,
                                                            "outlineColor": "#ffac12",
                                                            "color": "#ffffff",
                                                            "fillOpacity": 0.3
                                                        }
                                                    ]
                                                }]
                                            }
                                        }
                                    }),
                                    zoomToExtent(extent, "EPSG:4326"),
                                    showSuccessNotification({
                                        title: "notification.success",
                                        message: "GeoProcessing.notifications.successfulIntersection",
                                        autoDismiss: 6,
                                        position: "tc"
                                    })
                                ));
                    })
                    .catch(() => {
                        return Rx.Observable.of(showErrorNotification({
                            title: "errorTitleDefault",
                            message: "GeoProcessing.notifications.errorIntersectGFI",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                    });
                return intersection$;
            })
            .startWith(runningProcess(true))
            .concat(Rx.Observable.of(runningProcess(false)));

    });
/**
 * toggle highlight value for showing or not the highlight layers by owner
 */
export const toggleHighlightLayersGPTEpic = (action$, store) => action$
    .ofType(TOGGLE_HIGHLIGHT_LAYERS)
    .switchMap(() => {
        const showHighlightLayers = showHighlightLayersSelector(store.getState());
        return Rx.Observable.of(mergeOptionsByOwner("gpt", {
            visibility: showHighlightLayers
        }));
    });
export const toggleHighlightLayersOnOpenCloseGPTEpic = (action$, store) => action$
    .ofType(TOGGLE_CONTROL)
    .filter(action => action.control === GPT_CONTROL_NAME)
    .switchMap(() => {
        const state = store.getState();
        const showHighlightLayers = showHighlightLayersSelector(state);
        const isGPTEnabled = isGeoProcessingEnabledSelector(state);
        const selectedTool = selectedToolSelector(state);
        if (selectedTool === GPT_TOOL_BUFFER) {
            const additionalLayers = additionalLayersSelector(state);
            const bufferLayer = find(additionalLayers, ({id}) => id === GPT_SOURCE_HIGHLIGHT_ID );
            return bufferLayer?.id ? Rx.Observable.of(
                updateAdditionalLayer(
                    bufferLayer.id,
                    bufferLayer.owner,
                    bufferLayer.actionType,
                    {
                        ...bufferLayer.options,
                        visibility: isGPTEnabled ? showHighlightLayers : false
                    }
                ),
                unRegisterEventListener('click', GPT_CONTROL_NAME),
                ...(!isGPTEnabled ? [changeMapInfoState(true), setSelectedLayerType("")] : [])
            ) : Rx.Observable.of(
                unRegisterEventListener('click', GPT_CONTROL_NAME),
                ...(!isGPTEnabled ? [changeMapInfoState(true), setSelectedLayerType("")] : [])
            );
        }
        // INTERSECTION enabled any
        return Rx.Observable.of(
            mergeOptionsByOwner("gpt", {
                visibility: isGPTEnabled ? showHighlightLayers : false
            })
        ).concat(
            Rx.Observable.of(
                unRegisterEventListener('click', GPT_CONTROL_NAME),
                ...(!isGPTEnabled ? [changeMapInfoState(true), setSelectedLayerType("")] : [])
            )
        );
    });

export const unRegisterEventListenerOnReset = action$ =>
    action$
        .ofType(RESET) // add location change
        .switchMap(() => {
            return Rx.Observable.of(
                unRegisterEventListener('click', GPT_CONTROL_NAME)
            );
        });


/**
 * activate feature selection from map
 */
export const disableIdentifyGPTEpic = (action$, {getState}) =>
    action$
        .ofType(SET_SELECTED_LAYER_TYPE)
        .filter(({source}) => !!source)
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

/**
 * handle feature selection from map
 */
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
                                    message: "GeoProcessing.notifications.featureFound",
                                    autoDismiss: 10,
                                    position: "tc"
                                })
                            ]);
                        }
                        return Rx.Observable.of(showWarningNotification({
                            title: "notification.warning",
                            message: "GeoProcessing.notifications.noFeatureInPoint",
                            autoDismiss: 10,
                            position: "tc"
                        }));
                    })
                    .catch(() => {
                        return Rx.Observable.of(showErrorNotification({
                            title: "errorTitleDefault",
                            message: "GeoProcessing.notifications.errorGFI",
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
        .filter(({source}) => isGeoProcessingEnabledSelector(store.getState()) && source !== GPT_CONTROL_NAME)
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


/**
 * hide intersection Feature when switching to Buffer
 * show intersection Feature when switching to intersection if flag highlight is true
 */
export const removeHighlightsOnResetGPTEpic = (action$) =>
    action$.ofType(RESET)
        .switchMap(() => {
            return Rx.Observable.of(
                removeAdditionalLayer({id: GPT_SOURCE_HIGHLIGHT_ID}),
                removeAdditionalLayer({id: GPT_INTERSECTION_HIGHLIGHT_ID})
            );
        });
