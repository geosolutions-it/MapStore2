/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';
import {get, head, isNaN, isString, includes, size, toNumber, isNil} from 'lodash';
import url from 'url';

import { CHANGE_MAP_VIEW, zoomToExtent, ZOOM_TO_EXTENT, CLICK_ON_MAP, changeMapView } from '../actions/map';
import { ADD_LAYERS_FROM_CATALOGS } from '../actions/catalog';
import { SEARCH_LAYER_WITH_FILTER } from '../actions/search';
import { warning } from '../actions/notifications';

import { isValidExtent } from '../utils/CoordinatesUtils';
import { getConfigProp, getCenter } from '../utils/ConfigUtils';
import {featureInfoClick, showMapinfoMarker, toggleMapInfoState} from "../actions/mapInfo";
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
        const center = getCenter(value.center.split(',').map(val => toNumber(val)));
        const zoom = toNumber(value.zoom || 21);
        const bbox =  getBbox(center, zoom);
        return [changeMapView(center, zoom, bbox, map.size, null, map.projection)];
    },
    marker: ({value = {}, state}) => {
        const map = mapSelector(state);
        const marker = value.marker.split(',').map(val => toNumber(val));
        const lng = marker[0] || 0;
        const lat = marker[1] || 0;
        const center = getCenter(value.marker.split(',').map(val => toNumber(val)));
        const zoom = toNumber(value.zoom || 21);
        const bbox =  getBbox(center, zoom);
        let point =  {latlng: {lng, lat}};
        return [ changeMapView(center, zoom, bbox, map.size, null, map.projection), featureInfoClick(point)];
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

const onMapClickForShareEpic = (action$) =>
    action$.ofType(CLICK_ON_MAP).
        switchMap(({point, layer}) =>
            Rx.Observable.of(featureInfoClick(point, layer)));

export {
    readQueryParamsOnMapEpic,
    onMapClickForShareEpic
};
