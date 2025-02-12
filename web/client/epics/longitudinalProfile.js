/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import isEmpty from "lodash/isEmpty";
import Rx from 'rxjs';

import defaultIcon from '../components/map/openlayers/img/marker-icon.png';
import turfBbox from '@turf/bbox';
import {
    removeAdditionalLayer,
    updateAdditionalLayer
} from "../actions/additionallayers";
import {
    SET_CONTROL_PROPERTY,
    setControlProperty
} from "../actions/controls";
import {
    changeDrawingStatus,
    END_DRAWING
} from "../actions/draw";
import {
    addProfileData,
    changeGeometry,
    openDock,
    loading,
    toggleMaximize,
    toggleMode,
    TEAR_DOWN,
    TOGGLE_MODE,
    CHANGE_GEOMETRY,
    CHANGE_DISTANCE,
    CHANGE_REFERENTIAL,
    ADD_MARKER,
    HIDE_MARKER
} from "../actions/longitudinalProfile";
import {
    zoomToExtent,
    CLICK_ON_MAP,
    registerEventListener,
    unRegisterEventListener
} from "../actions/map";
import {
    changeMapInfoState,
    hideMapinfoMarker,
    purgeMapInfoResults,
    TOGGLE_MAPINFO_STATE,
    toggleMapInfoState
} from "../actions/mapInfo";
import {
    UPDATE_MAP_LAYOUT,
    updateDockPanelsList,
    updateMapLayout
} from "../actions/maplayout";
import {error, warning} from "../actions/notifications";
import {wrapStartStop} from "../observables/epics";
import executeProcess, {makeOutputsExtractor} from "../observables/wps/execute";
import {
    CONTROL_DOCK_NAME,
    CONTROL_NAME,
    CONTROL_PROPERTIES_NAME,
    LONGITUDINAL_OWNER,
    LONGITUDINAL_VECTOR_LAYER_ID,
    LONGITUDINAL_VECTOR_LAYER_ID_POINT
} from '../plugins/longitudinalProfile/constants';
import { profileEnLong } from '../plugins/longitudinalProfile/observables/wps/profile';
import {getSelectedLayer} from "../selectors/layers";
import {
    configSelector,
    dataSourceModeSelector,
    geometrySelector,
    isDockOpenSelector,
    isListeningClickSelector,
    isMaximizedSelector,
    isSupportedLayerSelector,
    noDataThresholdSelector
} from "../selectors/longitudinalProfile";
import {mapSelector} from "../selectors/map";
import {
    mapInfoEnabledSelector
} from "../selectors/mapInfo";

import {shutdownToolOnAnotherToolDrawing} from "../utils/ControlUtils";
import {reprojectGeoJson, reproject} from "../utils/CoordinatesUtils";
import {selectLineFeature} from "../utils/LongitudinalProfileUtils";
import {buildIdentifyRequest} from "../utils/MapInfoUtils";
import {getFeatureInfo} from "../api/identify";
import { drawerOwnerSelector } from "../selectors/draw";

const OFFSET = 550;

const DEACTIVATE_ACTIONS = [
    changeDrawingStatus("stop"),
    changeDrawingStatus("clean", '', CONTROL_NAME)
];

const deactivate = () => Rx.Observable.from(DEACTIVATE_ACTIONS);

export const LPcleanOnTearDownEpic = (action$) =>
    action$.ofType(TEAR_DOWN)
        .switchMap(() => {
            return Rx.Observable.of(
                setControlProperty(CONTROL_NAME, 'enabled', false),
                setControlProperty(CONTROL_NAME, 'dataSourceMode', false),
                setControlProperty(CONTROL_DOCK_NAME, 'enabled', false),
                setControlProperty(CONTROL_PROPERTIES_NAME, 'enabled', false),
                updateDockPanelsList(CONTROL_NAME, "remove", "right"),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID, owner: LONGITUDINAL_OWNER}),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID_POINT, owner: LONGITUDINAL_OWNER})
            );
        });

/**
 * Adds support of drawing/selecting line whenever corresponding tools is activated via menu
 * @param action$
 * @param store
 * @returns {*}
 */
export const LPonDrawActivatedEpic = (action$, store) =>
    action$.ofType(TOGGLE_MODE)
        .switchMap(()=> {
            const state = store.getState();
            const mode = dataSourceModeSelector(state);
            const drawerOwner = drawerOwnerSelector(state);
            switch (mode) {
            case "draw":
                const startDrawingAction = changeDrawingStatus('start', "LineString", CONTROL_NAME, [], { stopAfterDrawing: true });
                return action$.ofType(END_DRAWING).flatMap(
                    ({ geometry }) => {
                        return Rx.Observable.of(changeGeometry(geometry))
                            .merge(
                                Rx.Observable.of(startDrawingAction).delay(200) // reactivate drawing
                            );
                    })
                    .startWith(
                        registerEventListener('click', CONTROL_NAME),
                        changeMapInfoState(false),
                        purgeMapInfoResults(),
                        hideMapinfoMarker(),
                        startDrawingAction
                    )
                    .takeUntil(action$.filter(({ type }) =>
                        type === TOGGLE_MODE && dataSourceModeSelector(store.getState()) !== 'draw'
                    ))
                    .concat(deactivate());
            case "select":
                return Rx.Observable.from([
                    purgeMapInfoResults(), hideMapinfoMarker(),
                    ...(drawerOwner === CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
                    registerEventListener('click', CONTROL_NAME),
                    ...(mapInfoEnabledSelector(state) ? [toggleMapInfoState()] : [])
                ]);
            default:
                return Rx.Observable.from([
                    purgeMapInfoResults(),
                    hideMapinfoMarker(),
                    changeMapInfoState(mode !== undefined),
                    ...(drawerOwner === CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
                    unRegisterEventListener('click', CONTROL_NAME)
                ]);
            }
        });
/**
 * Reload chart data from WPS whenever geometry or request configuration changed
 * @param action$
 * @param store
 * @returns {*}
 */

export const LPonChartPropsChangeEpic = (action$, store) =>
    action$.ofType(CHANGE_GEOMETRY, CHANGE_DISTANCE, CHANGE_REFERENTIAL)
        .filter(() => {
            const state = store.getState();
            return !isEmpty(geometrySelector(state));
        })
        .switchMap(() => {
            const state = store.getState();
            const geometry = geometrySelector(state);
            const identifier = configSelector(state)?.identifier;
            const wpsurl = configSelector(state)?.wpsurl;
            const referential = configSelector(state)?.referential;
            const distance = configSelector(state)?.distance;
            const wpsBody = profileEnLong({identifier, geometry, distance, referential });
            const noDataThreshold = noDataThresholdSelector(state);
            return executeProcess(wpsurl, wpsBody, {outputsExtractor: makeOutputsExtractor()})
                .switchMap((result) => {
                    if (typeof result === "string" && result.includes("ows:ExceptionReport")) {
                        return Rx.Observable.of(error({
                            title: "errorTitleDefault",
                            message: "longitudinalProfile.errors.loadingError",
                            autoDismiss: 6,
                            position: "tc"
                        }));
                    }
                    const feature = {
                        type: 'Feature',
                        geometry,
                        properties: {
                            id: "line"
                        }
                    };
                    const bbox = turfBbox(reprojectGeoJson(feature, geometry.projection, 'EPSG:4326'));
                    const [minx, minY, maxX, maxY] = bbox;
                    const { infos, profile: points } = result ?? {};
                    const styledFeatures = [feature];
                    const features = styledFeatures && geometry.projection ? styledFeatures.map( f => reprojectGeoJson(
                        f,
                        geometry.projection
                    )) : styledFeatures;
                    const filteredPoints = points.filter(point => point.altitude < noDataThreshold);
                    return infos && filteredPoints ? Rx.Observable.from([
                        updateAdditionalLayer(
                            LONGITUDINAL_VECTOR_LAYER_ID,
                            LONGITUDINAL_OWNER,
                            'overlay',
                            {
                                id: LONGITUDINAL_VECTOR_LAYER_ID,
                                features,
                                style: {
                                    format: "geostyler",
                                    body: {
                                        name: "",
                                        rules: [{
                                            name: "line-rule",
                                            filter: ["==", "id", "line"],
                                            symbolizers: [
                                                {
                                                    "kind": "Line",
                                                    "color": "#3075e9",
                                                    "opacity": 1,
                                                    "width": 3
                                                }
                                            ]
                                        }]
                                    }
                                },
                                type: "vector",
                                name: "selectedLine",
                                visibility: true
                            }),
                        zoomToExtent([minx, minY, maxX, maxY], 'EPSG:4326', 21),
                        addProfileData(infos, filteredPoints, geometry.projection)
                    ]) : Rx.Observable.empty();
                })
                .catch(e => {
                    console.error("Error while obtaining data for longitudinal profile"); // eslint-disable-line no-console
                    console.error(e); // eslint-disable-line no-console
                    return Rx.Observable.of(error({
                        title: "errorTitleDefault",
                        message: e.message.includes("outside coverage") ? "longitudinalProfile.errors.outsideCoverage" : "longitudinalProfile.errors.loadingError",
                        autoDismiss: 6,
                        position: "tc"
                    }));
                })
                .let(wrapStartStop(
                    [loading(true), ...(!isDockOpenSelector(state) ? [openDock()] : [])],
                    loading(false),
                    () => Rx.Observable.of(error({
                        title: "errorTitleDefault",
                        message: "longitudinalProfile.errors.loadingError",
                        autoDismiss: 6,
                        position: "tc"
                    }))
                ));
        });

export const LPonAddMarkerEpic = (action$) =>
    action$.ofType(ADD_MARKER)
        .switchMap(({point}) => {
            const point4326 = reproject([point.lng, point.lat], "EPSG:3857", "EPSG:4326");
            const pointFeature = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [point4326.x, point4326.y],
                    projection: point.projection
                },
                properties: {
                    id: "point"
                }
            };
            return Rx.Observable.from([
                updateAdditionalLayer(
                    LONGITUDINAL_VECTOR_LAYER_ID_POINT,
                    LONGITUDINAL_OWNER,
                    'overlay',
                    {
                        id: LONGITUDINAL_VECTOR_LAYER_ID_POINT,
                        features: [pointFeature],
                        type: "vector",
                        style: {
                            format: "geostyler",
                            body: {
                                name: "",
                                rules: [{
                                    name: "point-rule",
                                    filter: ["==", "id", "point"],
                                    symbolizers: [
                                        {
                                            kind: 'Icon',
                                            image: defaultIcon,
                                            opacity: 1,
                                            size: 32,
                                            anchor: "bottom",
                                            rotate: 0,
                                            msBringToFront: true,
                                            msHeightReference: 'none',
                                            symbolizerId: "point-feature"
                                        }
                                    ]
                                }]
                            }
                        },
                        name: "selectedLine",
                        visibility: true
                    })
            ]);
        });
export const LPonHideMarkerEpic = (action$) =>
    action$.ofType(HIDE_MARKER)
        .switchMap(() => {
            return Rx.Observable.from([
                updateAdditionalLayer(
                    LONGITUDINAL_VECTOR_LAYER_ID_POINT,
                    LONGITUDINAL_OWNER,
                    'overlay',
                    {
                        id: LONGITUDINAL_VECTOR_LAYER_ID_POINT,
                        features: [],
                        type: "vector",
                        name: "selectedLine",
                        visibility: true
                    })
            ]);
        });

/**
 * Cleanup geometry when dock is closed
 * @param action$
 * @param store
 * @returns {*}
 */
export const LPonDockClosedEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter(({control, property, value}) => control === CONTROL_DOCK_NAME && property === 'enabled' && value === false)
        .switchMap(() => {
            const state = store.getState();
            const drawerOwner = drawerOwnerSelector(state);
            return Rx.Observable.from([
                changeGeometry(false),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID, owner: LONGITUDINAL_OWNER}),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID_POINT, owner: LONGITUDINAL_OWNER}),
                ...(isMaximizedSelector(store.getState()) ? [toggleMaximize()] : []),
                ...(drawerOwner === CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
                unRegisterEventListener('click', CONTROL_NAME)
            ]);
        });

/**
 * Re-trigger an update map layout with the margin to adjust map layout and show navigation toolbar. This
 * also keep the zoom to extent offsets aligned with the current visibile window, so when zoom the longitudinal panel
 * is considered as a right offset and it will not cover the zoomed features.
 */
export const LPlongitudinalMapLayoutEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => isDockOpenSelector(store.getState()) &&  source !== CONTROL_NAME)
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
            return { ...action, source: CONTROL_NAME }; // add an argument to avoid infinite loop.
        });

/**
 * Toggle longitudinal profile drawing/selection tool off when one of the drawing tools takes control
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const LPresetLongitudinalToolOnDrawToolActiveEpic = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, CONTROL_NAME,
    () => {
        return Rx.Observable.of(toggleMode());
    },
    () => dataSourceModeSelector(store.getState()) === "draw"
);

/**
 * Ensures that the active tool is getting deactivated when Identify tool is activated
 * @param {observable} action$ manages `TOGGLE_MAPINFO_STATE`
 * @param store
 * @return {observable}
 */
export const LPdeactivateIdentifyEnabledEpic = (action$, store) =>
    action$
        .ofType(TOGGLE_MAPINFO_STATE)
        .filter(() => mapInfoEnabledSelector(store.getState()))
        .switchMap(() => {
            const mode = dataSourceModeSelector(store.getState());
            return mode === "draw"
                ? Rx.Observable.from([
                    toggleMode("idle")
                ])
                : Rx.Observable.empty();
        });

export const LPclickToProfileEpic = (action$, {getState}) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(() => isListeningClickSelector(getState()))
        .switchMap(({point}) => {
            const state = getState();
            const map = mapSelector(state);
            const layer = getSelectedLayer(state);
            if (!layer) {
                return Rx.Observable.of(warning({
                    title: "notification.warning",
                    message: "longitudinalProfile.warnings.noLayerSelected",
                    autoDismiss: 10,
                    position: "tc"
                }));
            }
            if (!isSupportedLayerSelector(state)) {
                return Rx.Observable.of(warning({
                    title: "notification.warning",
                    message: "longitudinalProfile.warnings.layerNotSupported",
                    autoDismiss: 10,
                    position: "tc"
                }));
            }

            let {
                url,
                request
            } = buildIdentifyRequest(layer, {format: 'application/json', map, point});

            const basePath = url;
            const param = {...request};
            if (url) {
                return getFeatureInfo(basePath, param, layer, {attachJSON: true})
                    .map(data => {
                        const { feature, coordinates } = selectLineFeature(data?.features ?? [], data?.featuresCrs);
                        if (feature && coordinates) {
                            return changeGeometry({
                                type: "LineString",
                                coordinates,
                                projection: "EPSG:3857"
                            });
                        }
                        return warning({
                            title: "notification.warning",
                            message: "longitudinalProfile.warnings.noFeatureInPoint",
                            autoDismiss: 10,
                            position: "tc"
                        });
                    })
                    .catch(e => {
                        console.log("Error while obtaining data for longitudinal profile"); // eslint-disable-line no-console
                        console.log(e); // eslint-disable-line no-console
                        return Rx.Observable.of(loading(false));
                    })
                    .let(wrapStartStop(
                        [loading(true)],
                        [loading(false)],
                        () => Rx.Observable.of(error({
                            title: "errorTitleDefault",
                            message: "longitudinalProfile.errors.loadingError",
                            autoDismiss: 6,
                            position: "tc"
                        }),
                        loading(false))
                    ));
            }

            const intersected = (point?.intersectedFeatures ?? []).find(l => l.id === layer.id);
            const { feature, coordinates } = selectLineFeature(intersected?.features ?? []);
            if (feature && coordinates) {
                return Rx.Observable.of(changeGeometry({
                    type: "LineString",
                    coordinates,
                    projection: "EPSG:3857"
                }));
            }
            return  Rx.Observable.empty(warning({
                title: "notification.warning",
                message: "longitudinalProfile.warnings.noFeatureInPoint",
                autoDismiss: 10,
                position: "tc"
            }));
        });
