/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const uuidv1 = require('uuid/v1');
const {CLEAR_NOTIFICATIONS} = require('../actions/notifications');
const {basicError, basicSuccess} = require('../utils/NotificationUtils');
const LocaleUtils = require('../utils/LocaleUtils');
const GeoStoreApi = require('../api/GeoStoreDAO');
const { MAP_INFO_LOADED } = require('../actions/config');

const {
    SAVE_DETAILS, SAVE_RESOURCE_DETAILS, MAP_CREATED,
    DELETE_MAP, OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL,
    setDetailsChanged, updateDetails,
    mapDeleting, mapDeleted, loadMaps,
    doNothing, detailsLoaded
} = require('../actions/maps');
const {
    resetCurrentMap, EDIT_MAP
} = require('../actions/currentMap');
const {closeFeatureGrid} = require('../actions/featuregrid');
const {toggleControl} = require('../actions/controls');
const {
    mapPermissionsFromIdSelector, mapThumbnailsUriFromIdSelector,
    mapDetailsUriFromIdSelector, isMapsLastPageSelector
} = require('../selectors/maps');
const {
    mapIdSelector, mapInfoDetailsUriFromIdSelector
} = require('../selectors/map');
const {
    currentMapDetailsTextSelector, currentMapIdSelector,
    currentMapDetailsUriSelector, currentMapSelector,
    currentMapDetailsChangedSelector, currentMapOriginalDetailsTextSelector
} = require('../selectors/currentmap');
const {
    currentMessagesSelector
} = require('../selectors/locale');

const {userParamsSelector} = require('../selectors/security');
const {manageMapResource, deleteResourceById, getIdFromUri} = require('../utils/ObservableUtils');
const ConfigUtils = require('../utils/ConfigUtils');

/**
    If details are changed from the original ones then set unsavedCahnges to true
*/
const setDetailsChangedEpic = (action$, store) =>
    action$.ofType(SAVE_DETAILS)
    .switchMap((a) => {
        const state = store.getState();
        const detailsUri = currentMapDetailsUriSelector(state);
        if (!detailsUri) {
            return Rx.Observable.of(setDetailsChanged(a.detailsText !== "<p><br></p>"));
        }
        const originalDetails = currentMapOriginalDetailsTextSelector(state);
        const currentDetails = currentMapDetailsTextSelector(state);
        return Rx.Observable.of(setDetailsChanged(originalDetails !== currentDetails));
    });


/**
 * If the details resource does not exist it saves it, and it updates its permission with the one set for the mapPermissionsFromIdSelector
 * and it updates the attribute details in map resource
*/
const saveResourceDetailsEpic = (action$, store) =>
    action$.ofType(SAVE_RESOURCE_DETAILS)
    .switchMap(() => {
        const state = store.getState();
        const mapId = currentMapIdSelector(state);
        const value = currentMapDetailsTextSelector(state, mapId);
        const detailsChanged = currentMapDetailsChangedSelector(state);

        let params = {
            attribute: "details",
            map: currentMapSelector(state),
            resource: null,
            type: "STRING"
        };
        if (!detailsChanged) {
            return Rx.Observable.of(doNothing());
        }
        if (value !== "" && detailsChanged) {
            params.resource = {
                category: "DETAILS",
                userParams: userParamsSelector(state),
                metadata: {name: uuidv1()},
                value,
                permissions: mapPermissionsFromIdSelector(state, mapId),
                optionsAttr: {},
                optionsRes: {}
            };
            params.messages = currentMessagesSelector(state);
        } else {
            params.optionsDel = {};
        }
        return manageMapResource({
            ...params
        });
    });

/**
    Epics used to fetch and/or open the details modal
*/
const fetchDetailsFromResourceEpic = (action$, store) =>
    action$.ofType(EDIT_MAP)
    .switchMap(() => {
        const state = store.getState();
        const detailsUri = currentMapDetailsUriSelector(state);
        if (!detailsUri || detailsUri === "NODATA") {
            return Rx.Observable.of(
                updateDetails("", true, "")
            );
        }
        const detailsId = getIdFromUri(detailsUri);
        return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
            .then(data => data))
            .switchMap((details) => {
                return Rx.Observable.of(
                    updateDetails(details, true, details)
                );
            }).catch(() => {
                return Rx.Observable.of(basicError({
                    message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorFetchingDetailsOfMap") + currentMapIdSelector(store.getState())}));
            });
    });

const deleteMapAndAssociatedResourcesEpic = (action$, store) =>
    action$.ofType(DELETE_MAP)
    .switchMap((action) => {
        const state = store.getState();
        const mapId = action.resourceId;
        const options = action.options;
        const detailsUri = mapDetailsUriFromIdSelector(state, mapId);
        const thumbnailUri = mapThumbnailsUriFromIdSelector(state, mapId);
        const detailsId = getIdFromUri(detailsUri);
        const thumbnailsId = getIdFromUri(thumbnailUri);

        return Rx.Observable.forkJoin(
            // delete details
            deleteResourceById(thumbnailsId, options),
            // delete thumbanil
            deleteResourceById(detailsId, options),
            // delete map
            deleteResourceById(mapId, options)
        ).concatMap(([details, thumbnail, map]) => {
            let actions = [];
            if (details.resType === "error") {
                actions.push(basicError({message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorDeletingDetailsOfMap") + mapId }));
            }
            if (thumbnail.resType === "error") {
                actions.push(basicError({message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorDeletingThumbnailOfMap") + mapId }));
            }
            if (map.resType === "error") {
                actions.push(basicError({message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorDeletingMap") + mapId }));
                actions.push(mapDeleted(mapId, "failure", map.error));
            }
            if (map.resType === "success") {
                actions.push(mapDeleted(mapId, "success"));
                if ( isMapsLastPageSelector(state)) {
                    actions.push(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
                }
            }
            if (map.resType === "success" && details.resType === "success" && thumbnail.resType === "success") {
                actions.push(basicSuccess({ message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.allResDeleted") + mapId }));

            }
            return Rx.Observable.from(actions);
        }).startWith(mapDeleting(mapId));
    });

const mapCreatedNotificationEpic = action$ =>
    action$.ofType(MAP_CREATED)
        .concat(() => action$.ofType(CLEAR_NOTIFICATIONS))
        .switchMap(() => Rx.Observable.of(basicSuccess({message: "maps.feedback.successSavedMap"})));

const fetchDataForDetailsPanel = (action$, store) =>
    action$.ofType(OPEN_DETAILS_PANEL)
    .switchMap(() => {
        const state = store.getState();
        const mapId = mapIdSelector(state);
        const detailsUri = mapInfoDetailsUriFromIdSelector(state);
        const detailsId = getIdFromUri(detailsUri);
        return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
            .then(data => data))
            .switchMap((details) => {
                return Rx.Observable.from( [
                        closeFeatureGrid(),
                        updateDetails(details, true, details
                    )]
                );
            })
            .catch(() => {
                return Rx.Observable.of(basicError({
                    message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorFetchingDetailsOfMap") + mapId}));
            });
    }).startWith(toggleControl("details", "enabled"));

const closeDetailsPanelEpic = (action$) =>
    action$.ofType(CLOSE_DETAILS_PANEL)
    .switchMap(() => Rx.Observable.from( [
                toggleControl("details", "enabled"),
                resetCurrentMap()
            ])
    );
const storeDetailsInfoEpic = (action$, store) =>
    action$.ofType(MAP_INFO_LOADED)
    .switchMap(() => {
        const mapId = mapIdSelector(store.getState());
        return Rx.Observable.fromPromise(
            GeoStoreApi.getResourceAttribute(mapId, "details")
            .then(res => res.data)
        )
        .switchMap((details) => {
            return Rx.Observable.of(
                    detailsLoaded(mapId, details)
                );
        });
    });


module.exports = {
    storeDetailsInfoEpic,
    closeDetailsPanelEpic,
    fetchDataForDetailsPanel,
    mapCreatedNotificationEpic,
    deleteMapAndAssociatedResourcesEpic,
    setDetailsChangedEpic,
    fetchDetailsFromResourceEpic,
    saveResourceDetailsEpic
};
