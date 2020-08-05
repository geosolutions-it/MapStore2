/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';
import {get, head, isNaN, isString, includes, size, toNumber, isEmpty, isObject, isUndefined, inRange} from 'lodash';
import url from 'url';

import { CHANGE_MAP_VIEW, zoomToExtent, ZOOM_TO_EXTENT, CLICK_ON_MAP, changeMapView } from '../actions/map';
import { ADD_LAYERS_FROM_CATALOGS } from '../actions/catalog';
import { SEARCH_LAYER_WITH_FILTER, addMarker, resetSearch } from '../actions/search';
import { TOGGLE_CONTROL, setControlProperty } from '../actions/controls';
import { warning } from '../actions/notifications';

import { isValidExtent } from '../utils/CoordinatesUtils';
import { getConfigProp, getCenter } from '../utils/ConfigUtils';
import {featureInfoClick, hideMapinfoMarker, purgeMapInfoResults, toggleMapInfoState } from "../actions/mapInfo";
import {getBbox} from "../utils/MapUtils";
import {mapSelector} from '../selectors/map';

/*
it maps params key to function.
functions must return an array of actions or and empty array
*/
const paramActions = {
    bbox: ({ value = '' }) => {
        const extent = value.split(',')
            .map(val => parseFloat(val))
            .filter((val, idx) => idx % 2 === 0
                ? val > -180.5 && val < 180.5
                : val >= -90 && val <= 90)
            .filter(val => !isNaN(val));
        if (extent && extent.length === 4 && isValidExtent(extent)) {
            return [
                zoomToExtent(extent, 'EPSG:4326')
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
    center: ({value = {}, state}) => {
        const map = mapSelector(state);
        const validCenter = value && !isEmpty(value.center) && value.center.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = validCenter && validCenter.indexOf(false) === -1 && getCenter(validCenter);
        const zoom = toNumber(value.zoom);
        const bbox =  getBbox(center, zoom);
        const mapSize = map && map.size;
        const projection = map && map.projection;
        const isValid = center && isObject(center) && inRange(center.y, -90, 91) && inRange(center.x, -180, 181) && inRange(zoom, 1, 36);

        if (isValid) {
            return [changeMapView(center, zoom, bbox, mapSize, null, projection)];
        }
        return [
            warning({
                title: "share.wrongCenterAndZoomParamTitle",
                message: "share.wrongCenterAndZoomParamMessage",
                position: "tc"
            })
        ];
    },
    marker: ({value = {}, state}) => {
        const map = mapSelector(state);
        const marker = value && !isEmpty(value.marker) && value.marker.split(',').map(val => !isEmpty(val) && toNumber(val));
        const center = marker && marker.length === 2 && marker.indexOf(false) === -1 && getCenter(marker);
        const zoom = toNumber(value.zoom);
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
    actions: ({value = ''}) => {
        const whiteList = (getConfigProp("initialActionsWhiteList") || []).concat([
            SEARCH_LAYER_WITH_FILTER,
            ZOOM_TO_EXTENT,
            ADD_LAYERS_FROM_CATALOGS
        ]);
        if (isString(value)) {
            const actions = JSON.parse(value);
            return actions.filter(a => includes(whiteList, a.type));
        }
        return [];
    }
};

/**
 * Intercept on `LOCATION_CHANGE` to get query params from router.location.search string.
 * It needs to wait the first `CHANGE_MAP_VIEW` to ensure that width and height of map are in the state.
 * @param {external:Observable} action$ manages `LOCATION_CHANGE` and `CHANGE_MAP_VIEW`
 * @memberof epics.share
 * @return {external:Observable}
 */
const readQueryParamsOnMapEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap(() =>
            action$.ofType(CHANGE_MAP_VIEW)
                .take(1)
                .switchMap(() => {
                    const state = store.getState();
                    const search = get(state, 'router.location.search') || '';
                    const { query = {} } = url.parse(search, true) || {};
                    const queryActions = Object.keys(query)
                        .reduce((actions, param) => {
                            return [
                                ...actions,
                                ...(paramActions[param] && paramActions[param]({ value: size(query) === 1 ? query[param] : query, state }) || [])
                            ];
                        }, []);
                    return head(queryActions)
                        ? Rx.Observable.of(...queryActions)
                        : Rx.Observable.empty();
                })
        );

/**
 * Intercept on `CLICK_ON_MAP` to get point and layer information to allow featureInfoClick.
 * @param {external:Observable} action$ manages `CLICK_ON_MAP`
 * @param getState
 * @memberof epics.share
 * @return {external:Observable}
 */
const onMapClickForShareEpic = (action$, { getState = () => { } }) =>
    action$.ofType(CLICK_ON_MAP).
        switchMap(({point, layer}) =>{
            const allowClick = get(getState(), 'controls.share.settings.centerAndZoomEnabled');
            return allowClick
                ? Rx.Observable.of(resetSearch(), featureInfoClick(point, layer))
                : Rx.Observable.empty();
        });

/**
 * Intercept on `TOGGLE_CONTROL` to perform toggleMapInfoState and clean up on share panel close.
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @param getState
 * @memberof epics.share
 * @return {external:Observable}
 */
const disableGFIForShareEpic = (action$, { getState = () => { } }) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control === "share")
        .switchMap(() => {
            const shareEnabled = get(getState(), 'controls.share.enabled');
            const mapInfoEnabled = get(getState(), 'mapInfo.enabled');
            const shareParams = {bboxEnabled: false, centerAndZoomEnabled: false};
            if (!isUndefined(shareEnabled) && shareEnabled) {
                return mapInfoEnabled ? Rx.Observable.of(toggleMapInfoState()) : Rx.Observable.empty();
            }
            return Rx.Observable.of(hideMapinfoMarker(),
                purgeMapInfoResults(),
                toggleMapInfoState(),
                setControlProperty("share", "settings", shareParams));
        });

export {
    readQueryParamsOnMapEpic,
    onMapClickForShareEpic,
    disableGFIForShareEpic
};
