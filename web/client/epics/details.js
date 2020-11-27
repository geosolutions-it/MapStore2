/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import { find } from 'lodash';

import {
    OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL,
    NO_DETAILS_AVAILABLE,
    updateDetails,
    detailsLoaded,
    openDetailsPanel
} from '../actions/details';
import { MAP_INFO_LOADED } from '../actions/config';
import { closeFeatureGrid } from '../actions/featuregrid';
import { toggleControl } from '../actions/controls';

import {
    mapIdSelector, mapInfoDetailsUriFromIdSelector
} from '../selectors/map';

import GeoStoreApi from '../api/GeoStoreDAO';

import { EMPTY_RESOURCE_VALUE } from '../utils/MapInfoUtils';
import { getIdFromUri } from '../utils/MapUtils';
import { basicError } from '../utils/NotificationUtils';

export const fetchDataForDetailsPanel = (action$, store) =>
    action$.ofType(OPEN_DETAILS_PANEL)
        .switchMap(() => {
            const state = store.getState();
            const detailsUri = mapInfoDetailsUriFromIdSelector(state);
            const detailsId = getIdFromUri(detailsUri);
            return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
                .then(data => data))
                .switchMap((details) => {
                    return Rx.Observable.of(
                        closeFeatureGrid(),
                        updateDetails(details)
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
    action$.ofType(CLOSE_DETAILS_PANEL)
        .switchMap(() => Rx.Observable.from( [
            toggleControl("details", "enabled")
        ])
        );

export const storeDetailsInfoEpic = (action$, store) =>
    action$.ofType(MAP_INFO_LOADED)
        .switchMap(() => {
            const mapId = mapIdSelector(store.getState());
            return !mapId ?
                Rx.Observable.empty() :
                Rx.Observable.fromPromise(
                    GeoStoreApi.getResourceAttributes(mapId)
                )
                    .switchMap((attributes) => {
                        let details = find(attributes, {name: 'details'});
                        const detailsSettingsAttribute = find(attributes, {name: 'detailsSettings'});
                        let detailsSettings = {};

                        if (!details || details.value === EMPTY_RESOURCE_VALUE) {
                            return Rx.Observable.empty();
                        }

                        try {
                            detailsSettings = JSON.parse(detailsSettingsAttribute.value);
                        } catch (e) {
                            detailsSettings = {};
                        }

                        return Rx.Observable.of(
                            detailsLoaded(mapId, details.value, detailsSettings),
                            ...(detailsSettings.showAtStartup ? [openDetailsPanel()] : [])
                        );
                    });
        });
