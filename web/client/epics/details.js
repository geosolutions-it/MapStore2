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
    closeDetailsPanel,
    openDetailsPanel
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
import { REDUCERS_LOADED } from '../actions/storemanager';
import { detailsSettingsSelector, detailsUriSelector } from '../selectors/details';
import { EMPTY_RESOURCE_VALUE } from '../utils/MapInfoUtils';

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

const isDetailsReducerLoaded = (reducers) =>
    Array.isArray(reducers) ? reducers.indexOf('details') !== -1 : !!reducers?.details;

const parseDetailsSettings = (detailsSettings) => {
    if (!detailsSettings) {
        return {};
    }
    if (typeof detailsSettings === 'string') {
        try {
            return JSON.parse(detailsSettings) || {};
        } catch (e) {
            return {};
        }
    }
    return detailsSettings;
};

export const openDetailsPanelOnStartup = (action$, store) =>
    action$.ofType(REDUCERS_LOADED)
        .filter((action) => action.type !== REDUCERS_LOADED || isDetailsReducerLoaded(action.reducers))
        .delay(100)
        // Retry startup auto-open after the Details plugin has registered.
        .filter(() => {
            const state = store.getState();
            const detailsUri = detailsUriSelector(state);
            const detailsSettings = parseDetailsSettings(detailsSettingsSelector(state));
            return !state?.context?.loading
                && detailsUri
                && detailsUri !== EMPTY_RESOURCE_VALUE
                && detailsSettings?.showAtStartup
                && !state?.tutorial?.run
                && !state?.controls?.details?.enabled;
        })
        .switchMap(() => Rx.Observable.of(openDetailsPanel()));
