/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL,
    NO_DETAILS_AVAILABLE,
    updateDetails,
    closeDetailsPanel
} from '../actions/details';
import { toggleControl, setControlProperty } from '../actions/controls';
import { MAP_SAVED } from '../actions/config';
import { DASHBOARD_SAVED } from '../actions/dashboard';

import {
    mapIdSelector
} from '../selectors/map';
import { getDashboardId } from '../selectors/dashboard';

import GeoStoreApi from '../api/GeoStoreDAO';

import { getIdFromUri } from '../utils/MapUtils';
import { basicError } from '../utils/NotificationUtils';
import { VISUALIZATION_MODE_CHANGED } from '../actions/maptype';
import { detailsUriSelector } from '../selectors/details';

export const fetchDataForDetailsPanel = (action$, store) =>
    action$.ofType(OPEN_DETAILS_PANEL)
        .switchMap(() => {
            const state = store.getState();
            const mapId = mapIdSelector(state);
            const dashboardId = getDashboardId(state);
            const detailsUri = detailsUriSelector(state);
            const detailsId = getIdFromUri(detailsUri);
            const resourceId = dashboardId || mapId;
            return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
                .then(data => data))
                .switchMap((details) => {
                    return Rx.Observable.of(
                        updateDetails(details, resourceId)
                    );
                }).startWith(toggleControl("details", "enabled"))
                .catch(() => {
                    return Rx.Observable.of(
                        basicError({message: "maps.feedback.errorFetchingDetailsOfMap"}),
                        updateDetails(NO_DETAILS_AVAILABLE)
                    );
                });
        });

export const closeDetailsPanelEpic = (action$) =>
    action$.ofType(CLOSE_DETAILS_PANEL, LOCATION_CHANGE, MAP_SAVED, DASHBOARD_SAVED)
        .switchMap(() => Rx.Observable.from( [
            setControlProperty("details", "enabled", false)
        ])
        );

export const closeDetailsPanelOn3DToggle = (action$) =>
    action$.ofType(VISUALIZATION_MODE_CHANGED)
        .switchMap(() => {
            return Rx.Observable.of(closeDetailsPanel());
        });
