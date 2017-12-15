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
const {
    SAVE_DETAILS, SAVE_RESOURCE_DETAILS, MAP_CREATED,
    OPEN_OR_FETCH_DETAILS, DELETE_MAP, OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL,
    setDetailsChanged, updateDetails, toggleDetailsSheet,
    mapDeleting, mapDeleted, loadMaps, resetCurrentMap,
    doNothing
} = require('../actions/maps');
const {closeFeatureGrid} = require('../actions/featuregrid');
const {toggleControl} = require('../actions/controls');
const {
    mapPermissionsFromIdSelector, mapThumbnailsUriFromIdSelector,
    mapDetailsUriFromIdSelector, isMapsLastPageSelector
} = require('../selectors/maps');
const {
    mapIdSelector
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
const fetchDetailsFromResource = (action$, store) =>
    action$.ofType(OPEN_OR_FETCH_DETAILS)
    .filter(a => a.fetch)
    .switchMap((a) => {
        const state = store.getState();
        const detailsUri = currentMapDetailsUriSelector(state);
        if (!detailsUri || detailsUri === "NODATA") {
            if (a.open) {
                return Rx.Observable.of(
                    updateDetails("", true, ""),
                    toggleDetailsSheet(a.readOnly)
                );
            }
            return Rx.Observable.of(
                updateDetails("", true, "")
            );
        }
        const detailsId = getIdFromUri(detailsUri);
        return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
            .then(data => data))
            .switchMap((details) => {
                if (a.open) {
                    return Rx.Observable.of(
                        updateDetails(details, true, details),
                        toggleDetailsSheet(a.readOnly)
                    );
                }
                return Rx.Observable.of(
                    updateDetails(details, true, details)
                );
            }).catch(() => {
                return Rx.Observable.of(basicError({
                    message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorFetchingDetailsOfMap") + currentMapIdSelector(store.getState())}));
            });
    });

const deleteMapAndAssociatedResources = (action$, store) =>
    action$.ofType(DELETE_MAP)
    .switchMap((action) => {
        const state = store.getState();
        const {resourceId, options} = action;
        const mapId = action.resourceId;
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
                actions.push(mapDeleted(resourceId, "failure", map.error));
            }
            if (map.resType === "success") {
                actions.push(mapDeleted(resourceId, "success"));
                if ( isMapsLastPageSelector(state)) {
                    actions.push(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
                }
            }
            if (map.resType === "success" && details.resType === "success" && thumbnail.resType === "success") {
                actions.push(basicSuccess({ message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.allResDeleted") + mapId }));

            }
            return Rx.Observable.from(actions);
        }).startWith(mapDeleting(resourceId));
    });

const mapCreatedNotificationEpic = action$ =>
    action$.ofType(MAP_CREATED)
        .concat(action$.ofType(CLEAR_NOTIFICATIONS))
        .switchMap(() => Rx.Observable.of(basicSuccess({message: "maps.feedback.successSavedMap"})));

const fetchdataForDetailsPanel = (action$, store) =>
    action$.ofType(OPEN_DETAILS_PANEL)
    .switchMap(() => {
        const state = store.getState();
        const mapId = mapIdSelector(state);
        const detailsUri = mapDetailsUriFromIdSelector(state, mapId);
        const detailsId = getIdFromUri(detailsUri);
        return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
            .then(data => data))
            .switchMap((details) => {
                return Rx.Observable.from( [
                        toggleControl("details", "enabled"),
                        closeFeatureGrid(),
                        updateDetails(details, true, details
                    )]
                );
            })
            .catch(() => {
                return Rx.Observable.of(basicError({
                    message: LocaleUtils.getMessageById(state.locale.messages, "maps.feedback.errorFetchingDetailsOfMap") + mapId}));
            });
    });

const closeDetailsPanel = (action$) =>
    action$.ofType(CLOSE_DETAILS_PANEL)
    .switchMap(() => Rx.Observable.from( [
                toggleControl("details", "enabled"),
                resetCurrentMap()
            ])
    );
module.exports = {
    closeDetailsPanel,
    fetchdataForDetailsPanel,
    mapCreatedNotificationEpic,
    deleteMapAndAssociatedResources,
    setDetailsChangedEpic,
    fetchDetailsFromResource,
    saveResourceDetailsEpic
};
