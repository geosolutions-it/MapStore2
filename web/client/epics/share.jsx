/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import { LOCATION_CHANGE } from 'react-router-redux';
import { get, head, isNaN } from 'lodash';
import url from 'url';
import { CHANGE_MAP_VIEW, zoomToExtent } from '../actions/map';
import { isValidExtent } from '../utils/CoordinatesUtils';
import { warning } from '../actions/notifications';
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
    }
};
/**
 * Intercept on `LOCATION_CHANGE` to get query params from routing.location.search string.
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
                    const search = get(state, 'routing.location.search') || '';
                    const { query = {} } = url.parse(search, true) || {};
                    const queryActions = Object.keys(query)
                        .reduce((actions, param) => {
                            return [
                                ...actions,
                                ...(paramActions[param] && paramActions[param]({ value: query[param] }) || [])
                            ];
                        }, []);
                    return head(queryActions)
                        ? Rx.Observable.of(...queryActions)
                        : Rx.Observable.empty();
                })
        );

export {
    readQueryParamsOnMapEpic
};
