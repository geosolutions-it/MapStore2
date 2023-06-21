/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";
import Rx from 'rxjs';

import turfBbox from '@turf/bbox';
import turfCenter from '@turf/center';
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
    changeDistance,
    changeGeometry,
    changeReferential,
    initialized,
    openDock,
    loading,
    toggleMaximize,
    toggleMode,
    SETUP,
    TEAR_DOWN,
    TOGGLE_MODE,
    CHANGE_GEOMETRY,
    CHANGE_DISTANCE,
    CHANGE_REFERENTIAL,
    ADD_MARKER,
    HIDE_MARKER
} from "../actions/longitudinalProfile";
import {
    changeMapView,
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
    LONGITUDINAL_VECTOR_LAYER_ID
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
    vectorLayerFeaturesSelector
} from "../selectors/longitudinalProfile";
import {mapSelector} from "../selectors/map";
import {
    highlightStyleSelector,
    mapInfoEnabledSelector
} from "../selectors/mapInfo";

import {shutdownToolOnAnotherToolDrawing} from "../utils/ControlUtils";
import {reprojectGeoJson} from "../utils/CoordinatesUtils";
import {selectLineFeature, styleFeatures} from "../utils/LongitudinalProfileUtils";
import {buildIdentifyRequest} from "../utils/MapInfoUtils";
import {getFeatureInfo} from "../api/identify";

const OFFSET = 550;

const DEACTIVATE_ACTIONS = [
    changeDrawingStatus("stop"),
    changeDrawingStatus("clean", '', CONTROL_NAME)
];

const deactivate = () => Rx.Observable.from(DEACTIVATE_ACTIONS);

/**
 * Ensure that default configuration is applied whenever plugin is initialized
 * @param action$
 * @param store
 * @returns {*}
 */
export const setupLongitudinalExtension = (action$, store) =>
    action$.ofType(SETUP)
        .switchMap(() => {

            const { referentials, distances, defaultDistance, defaultReferentialName }  = configSelector(store.getState());

            const defaultReferential = referentials.find(el => el.layerName === defaultReferentialName);
            if (defaultReferentialName && !defaultReferential) {
                return Rx.Observable.of(error({ title: "Error", message: "longitudinalProfile.errors.defaultReferentialNotFound", autoDismiss: 10 }));
            }

            return Rx.Observable.of(
                updateDockPanelsList(CONTROL_DOCK_NAME, "add", "right"),
                changeReferential(defaultReferentialName ?? referentials[0].layerName),
                changeDistance(defaultDistance ?? distances[0]),
                updateAdditionalLayer(
                    LONGITUDINAL_VECTOR_LAYER_ID,
                    LONGITUDINAL_OWNER,
                    'overlay',
                    {
                        id: LONGITUDINAL_VECTOR_LAYER_ID,
                        features: [],
                        type: "vector",
                        name: "selectedLine",
                        visibility: true
                    }),
                initialized()
            );
        })
        .catch((e) => {
            console.error(e); // eslint-disable-line no-console
            return Rx.Observable.of(error({ title: "Error", message: "longitudinalProfile.errors.unableToSetupPlugin", autoDismiss: 10 }));
        });

/**
 * Clean up state related to the plugin whenever it tears down
 * @param action$
 * @returns {*}
 */
export const cleanOnTearDown = (action$) =>
    action$.ofType(TEAR_DOWN)
        .switchMap(() => {
            return Rx.Observable.of(
                setControlProperty(CONTROL_NAME, 'enabled', false),
                setControlProperty(CONTROL_NAME, 'dataSourceMode', false),
                setControlProperty(CONTROL_DOCK_NAME, 'enabled', false),
                setControlProperty(CONTROL_PROPERTIES_NAME, 'enabled', false),
                updateDockPanelsList(CONTROL_NAME, "remove", "right"),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID, owner: LONGITUDINAL_OWNER})
            );
        });

/**
 * Adds support of drawing/selecting line whenever corresponding tools is activated via menu
 * @param action$
 * @param store
 * @returns {*}
 */
export const onDrawActivated = (action$, store) =>
    action$.ofType(TOGGLE_MODE)
        .switchMap(()=> {
            const state = store.getState();
            const mode = dataSourceModeSelector(state);
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
                        unRegisterEventListener('click', CONTROL_NAME),
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
                    ...(get(store.getState(), 'draw.drawOwner', '') === CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
                    registerEventListener('click', CONTROL_NAME),
                    ...(mapInfoEnabledSelector(state) ? [toggleMapInfoState()] : [])
                ]);
            default:
                return Rx.Observable.from([
                    purgeMapInfoResults(), hideMapinfoMarker(),
                    ...(get(store.getState(), 'draw.drawOwner', '') === CONTROL_NAME ? DEACTIVATE_ACTIONS : []),
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

export const onChartPropsChange = (action$, store) =>
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

            return executeProcess(wpsurl, profileEnLong({identifier, geometry, distance, referential }),
                {outputsExtractor: makeOutputsExtractor()})
                .switchMap((result) => {
                    const feature = {
                        type: 'Feature',
                        geometry
                    };
                    const map = mapSelector(state);
                    const center = turfCenter(reprojectGeoJson(feature, geometry.projection, 'EPSG:4326')).geometry.coordinates;
                    const bbox = turfBbox(reprojectGeoJson(feature, geometry.projection, 'EPSG:4326'));
                    const [minx, minY, maxX, maxY] = bbox;
                    const { infos, points } = result?.profile ?? {};
                    const styledFeatures = styleFeatures([feature], omit(highlightStyleSelector(state), ["radius"]));
                    const features = styledFeatures && geometry.projection ? styledFeatures.map( f => reprojectGeoJson(
                        f,
                        geometry.projection
                    )) : styledFeatures;
                    return infos && points ? Rx.Observable.from([
                        updateAdditionalLayer(
                            LONGITUDINAL_VECTOR_LAYER_ID,
                            LONGITUDINAL_OWNER,
                            'overlay',
                            {
                                id: LONGITUDINAL_VECTOR_LAYER_ID,
                                features,
                                type: "vector",
                                name: "selectedLine",
                                visibility: true
                            }),
                        changeMapView({x: center[0], y: center[1]}, map.zoom, [minx, minY, maxX, maxY], map.size, null, map.projection),
                        addProfileData(infos, points, geometry.projection)
                    ]) : Rx.Observable.empty();
                })
                .catch(e => {
                    console.log("Error while obtaining data for longitudinal profile"); // eslint-disable-line no-console
                    console.log(e); // eslint-disable-line no-console
                    return Rx.Observable.empty();
                })
                .let(wrapStartStop(
                    [loading(true), ...(!isDockOpenSelector(state) ? [openDock()] : [])],
                    loading(false),
                    () => Rx.Observable.of(error({
                        title: "notification.error",
                        message: "longitudinalProfile.errors.loadingError",
                        autoDismiss: 6,
                        position: "tc"
                    }))
                ));
        });

export const onMarkerChanged = (action$, store) =>
    action$.ofType(ADD_MARKER, HIDE_MARKER)
        .switchMap(({point}) => {
            const state = store.getState();
            let featuresCollection = vectorLayerFeaturesSelector(state);
            if (point) {
                const pointFeature = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [point.lat, point.lng],
                        projection: point.projection
                    },
                    style: {
                        iconShape: 'circle',
                        iconColor: 'blue'
                    }
                };
                featuresCollection = featuresCollection?.length > 0 ? [featuresCollection[0], pointFeature] : [pointFeature];
            } else {
                if (featuresCollection?.length) {
                    featuresCollection = [featuresCollection[0]];
                } else {
                    featuresCollection = [];
                }
            }
            return Rx.Observable.from([
                updateAdditionalLayer(
                    LONGITUDINAL_VECTOR_LAYER_ID,
                    LONGITUDINAL_OWNER,
                    'overlay',
                    {
                        id: LONGITUDINAL_VECTOR_LAYER_ID,
                        features: featuresCollection,
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
export const onDockClosed = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter(({control, property, value}) => control === CONTROL_DOCK_NAME && property === 'enabled' && value === false)
        .switchMap(() => {
            return Rx.Observable.from([
                changeGeometry(false),
                removeAdditionalLayer({id: LONGITUDINAL_VECTOR_LAYER_ID, owner: LONGITUDINAL_OWNER}),
                ...(isMaximizedSelector(store.getState()) ? [toggleMaximize()] : [])
            ]);
        });

/**
 * Re-trigger an update map layout with the margin to adjust map layout and show navigation toolbar. This
 * also keep the zoom to extent offsets aligned with the current visibile window, so when zoom the longitudinal panel
 * is considered as a right offset and it will not cover the zoomed features.
 */
export const longitudinalMapLayout = (action$, store) =>
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
export const resetLongitudinalToolOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, CONTROL_NAME,
    () => {
        return Rx.Observable.of(toggleMode());
    },
    () => dataSourceModeSelector(store.getState())
);

/**
 * Ensures that the active tool is getting deactivated when Identify tool is activated
 * @param {observable} action$ manages `TOGGLE_MAPINFO_STATE`
 * @param store
 * @return {observable}
 */
export const deactivateOnIdentifyEnabledEpic = (action$, store) =>
    action$
        .ofType(TOGGLE_MAPINFO_STATE)
        .filter(() => mapInfoEnabledSelector(store.getState()))
        .switchMap(() => {
            const mode = dataSourceModeSelector(store.getState());
            return mode
                ? Rx.Observable.from([
                    toggleMode(false)
                ])
                : Rx.Observable.empty();
        });

export const clickToProfile = (action$, {getState}) =>
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
                            title: "notification.error",
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