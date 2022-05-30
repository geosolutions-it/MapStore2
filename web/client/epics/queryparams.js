/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';
import {get, head, isNaN, includes, toNumber, isEmpty, isObject, isUndefined, inRange, every, has, partial} from 'lodash';
import url from 'url';

import {zoomToExtent, ZOOM_TO_EXTENT, CLICK_ON_MAP, changeMapView, CHANGE_MAP_VIEW, orientateMap, INIT_MAP} from '../actions/map';
import { ADD_LAYERS_FROM_CATALOGS } from '../actions/catalog';
import { SEARCH_LAYER_WITH_FILTER, addMarker, resetSearch, hideMarker } from '../actions/search';
import { TOGGLE_CONTROL, setControlProperty } from '../actions/controls';
import { warning } from '../actions/notifications';

import {getLonLatFromPoint, isValidExtent} from '../utils/CoordinatesUtils';
import { getConfigProp, getCenter } from '../utils/ConfigUtils';
import {featureInfoClick, hideMapinfoMarker, purgeMapInfoResults, toggleMapInfoState} from "../actions/mapInfo";
import {
    getBbox
} from "../utils/MapUtils";
import {mapSelector} from '../selectors/map';
import { clickPointSelector, isMapInfoOpen, mapInfoEnabledSelector } from '../selectors/mapInfo';
import { shareSelector } from "../selectors/controls";
import {LAYER_LOAD} from "../actions/layers";
import { changeMapType } from '../actions/maptype';
import {getRequestParameterValue} from "../utils/QueryParamsUtils";
import {mapProjectionSelector} from "../utils/PrintUtils";
import {updatePointWithGeometricFilter} from "../utils/IdentifyUtils";

/*
it maps params key to function.
functions must return an array of actions or and empty array
*/
const paramActions = {
    bbox: (parameters) => {
        const extent = parameters.bbox.split(',')
            .map(val => parseFloat(val))
            .filter((val, idx) => idx % 2 === 0
                ? val > -180.5 && val < 180.5
                : val >= -90 && val <= 90)
            .filter(val => !isNaN(val));
        if (extent && extent.length === 4 && isValidExtent(extent)) {
            return [
                zoomToExtent(extent, 'EPSG:4326', undefined,  {nearest: true})
            ];
        }
        return [
            warning({
                title: "share.wrongBboxParamTitle",
                message: "share.wrongBboxParamMessage",
                position: "tc"
            })
        ];
    },
    center: (parameters, state) => {
        const map = mapSelector(state);
        const { heading, pitch, roll = 0 } = parameters;
        const validViewerOptions = [heading, pitch].map(val => typeof(val) !== 'undefined');
        const validCenter = parameters && !isEmpty(parameters.center) && parameters.center.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = validCenter && validCenter.indexOf(false) === -1 && getCenter(validCenter);
        const zoom = toNumber(parameters.zoom);
        const bbox =  getBbox(center, zoom);
        const mapSize = map && map.size;
        const projection = map && map.projection;
        const viewerOptions = validViewerOptions && validViewerOptions.indexOf(false) === -1 ? { heading, pitch, roll } : map && map.viewerOptions;
        const isValid = center && isObject(center) && inRange(center.y, -90, 91) && inRange(center.x, -180, 181) && inRange(zoom, 1, 36);
        if (isValid && !viewerOptions) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection, viewerOptions)];
        }
        if (isValid && viewerOptions) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection, viewerOptions)];
        }
        return [
            warning({
                title: "share.wrongCenterAndZoomParamTitle",
                message: "share.wrongCenterAndZoomParamMessage",
                position: "tc"
            })
        ];
    },
    marker: (parameters, state) => {
        const map = mapSelector(state);
        const marker = !isEmpty(parameters.marker) && parameters.marker.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = marker && marker.length === 2 && marker.indexOf(false) === -1 && getCenter(marker);
        const zoom = toNumber(parameters.zoom);
        const bbox =  getBbox(center, zoom);
        const lng = marker && marker[0];
        const lat = marker && marker[1];
        const mapSize = map && map.size;
        const projection = map && map.projection;
        const isValid = center && marker && isObject(marker) && (inRange(lat, -90, 91) && inRange(lng, -180, 181)) && inRange(zoom, 1, 36);

        if (isValid) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection),
                addMarker({lat, lng})
            ];
        }
        return [
            warning({
                title: "share.wrongMarkerAndZoomParamTitle",
                message: "share.wrongMarkerAndZoomParamMessage",
                position: "tc"
            })
        ];
    },
    featureinfo: (parameters, state) => {
        const value = parameters.featureinfo;
        const { lat, lng, filterNameList } = value;
        if (typeof lat !== 'undefined' && typeof lng !== 'undefined') {
            const projection = mapProjectionSelector(state);
            return [featureInfoClick(updatePointWithGeometricFilter({latlng: {lat, lng}}, projection), false, filterNameList ?? [])];
        }
        return [];
    },
    zoom: () => {},
    heading: () => {},
    pitch: () => {},
    roll: () => {}, // roll is currently not supported, we return standard 0 roll
    actions: (parameters) => {
        const whiteList = (getConfigProp("initialActionsWhiteList") || []).concat([
            SEARCH_LAYER_WITH_FILTER,
            ZOOM_TO_EXTENT,
            ADD_LAYERS_FROM_CATALOGS
        ]);
        if (parameters.actions) {
            return parameters.actions.filter(a => includes(whiteList, a.type));
        }
        return [];
    }
};

/**
 * Intercept on `LOCATION_CHANGE` to get query params from router.location.search string.
 * It needs to wait the first `LAYER_LOAD` to ensure that width and height of map are in the state as well as the final bbox bounds data.
 * @param {external:Observable} action$ manages `LOCATION_CHANGE` and `LAYER_LOAD`
 * @memberof epics.share
 * @return {external:Observable}
 */
export const readQueryParamsOnMapEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() =>
            action$.ofType(LAYER_LOAD)
                .take(1)
                .switchMap(() => {
                    const state = store.getState();
                    const parameters = Object.keys(paramActions)
                        .reduce((params, parameter) => {
                            const value = getRequestParameterValue(parameter, state);
                            return {
                                ...params,
                                ...(value ? { [parameter]: value } : {})
                            };
                        }, {});
                    const queryActions = Object.keys(parameters)
                        .reduce((actions, param) => {
                            return [
                                ...actions,
                                ...(paramActions[param](parameters, state) || [])
                            ];
                        }, []);
                    return head(queryActions)
                        ? Rx.Observable.of(...queryActions)
                        : Rx.Observable.empty();
                })
        );

export const readQueryParamsOnMapInitEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() =>
            action$.ofType(INIT_MAP)
                .switchMap(() => {
                    return Rx.Observable.of(changeMapType('cesium'));
                })
        );

/**
 * Intercept on `CLICK_ON_MAP` to get point and layer information to allow featureInfoClick.
 * @param {external:Observable} action$ manages `CLICK_ON_MAP`
 * @param getState
 * @memberof epics.share
 * @return {external:Observable}
 */
export const onMapClickForShareEpic = (action$, { getState = () => { } }) =>
    action$.ofType(CLICK_ON_MAP).
        switchMap(({point}) =>{
            const allowClick = get(getState(), 'controls.share.settings.centerAndZoomEnabled');
            return allowClick
                ? Rx.Observable.of(resetSearch(), addMarker({latlng: point?.latlng || {}}))
                : Rx.Observable.empty();
        });

/**
 * Intercept on `TOGGLE_CONTROL` to perform toggleMapInfoState and clean up on share panel close.
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @param getState
 * @memberof epics.share
 * @return {external:Observable}
 */
export const disableGFIForShareEpic = (action$, { getState = () => { } }) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control === "share")
        .switchMap(() => {
            const state = getState();
            const shareEnabled = shareSelector(state);
            const mapInfoEnabled = mapInfoEnabledSelector(state);
            const shareParams = {bboxEnabled: false, centerAndZoomEnabled: false};
            if (!isUndefined(shareEnabled) && shareEnabled) {
                let $observable = Rx.Observable.empty();
                if (mapInfoEnabled) {
                    let actions = [toggleMapInfoState()];
                    if (isMapInfoOpen(state)) {
                        const clickedPoint = clickPointSelector(state);
                        const [lng, lat] = getLonLatFromPoint(clickedPoint);
                        const newPoint = {latlng: {lat, lng}};
                        actions = actions.concat(addMarker(newPoint)); // Retain marker position set by GFI for Share position marker
                    }
                    $observable = Rx.Observable.from(actions);
                }
                return $observable;
            }
            return Rx.Observable.of(hideMapinfoMarker(),
                purgeMapInfoResults(),
                toggleMapInfoState(),
                setControlProperty("share", "settings", shareParams),
                hideMarker()
            );
        });

export const checkMapOrientation = (action$, store) =>
    action$.ofType(CHANGE_MAP_VIEW).
        switchMap(() => {
            const state = store.getState();
            const mapType = get(state, 'maptype.mapType') || '';
            if (mapType === 'cesium') {
                const search = get(state, 'router.location.search') || '';
                const {query = {}} = url.parse(search, true) || {};
                if (!search.includes('bbox')) {
                    if (!isEmpty(query)) {
                        const requiredKeys = ['center', 'zoom', 'heading', 'pitch', 'roll'];
                        if (every(requiredKeys, partial(has, query))) {
                            return  Rx.Observable.of(orientateMap(query));
                        }
                    }
                }
            }
            return Rx.Observable.empty();
        });

export default {
    readQueryParamsOnMapEpic,
    onMapClickForShareEpic,
    disableGFIForShareEpic,
    checkMapOrientation,
    readQueryParamsOnMapInitEpic
};
