/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const uuidv1 = require('uuid/v1');
const {error, success, CLEAR_NOTIFICATIONS} = require('../actions/notifications');
const GeoStoreApi = require('../api/GeoStoreDAO');
const {
    SAVE_DETAILS, SAVE_RESOURCE_DETAILS,
    OPEN_OR_FETCH_DETAILS, DELETE_MAP, doNothing,
    setDetailsChanged, updateDetails, toggleDetailsSheet,
    mapDeleting, mapDeleted, loadMaps, MAP_CREATED
} = require('../actions/maps');
const {
    mapPermissionsFromIdSelector,
    mapThumbnailsUriFromIdSelector,
    mapDetailsUriFromIdSelector
} = require('../selectors/maps');
const {
    currentMapDetailsTextSelector, currentMapIdSelector,
    currentMapDetailsUriSelector, currentMapSelector,
    currentMapDetailsChangedSelector, currentMapOriginalDetailsTextSelector
} = require('../selectors/currentmap');

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
        } else {
            params.optionsDel = {};
        }
        return manageMapResource({
            ...params
        });
    });

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
        let detailsId = getIdFromUri(detailsUri);
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
            }).catch(e => {
                return Rx.Observable.of(error({
                        title: "notification.warning",
                        message: "Error FETCHING details for this map: " + currentMapIdSelector(store.getState()) + "\t\n" + e.status + " " + e.data,
                        autoDismiss: 6,
                        position: "tc"
                    }));
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
                actions.push(error({
                        title: "notification.warning",
                        message: "Error when DELETING details for this map: " + currentMapIdSelector(store.getState()) + "\t\n" + details.error.status + " " + details.error.data,
                        autoDismiss: 6,
                        position: "tc"
                    }));
            }
            if (thumbnail.resType === "error") {
                actions.push(error({
                        title: "notification.warning",
                        message: "Error when DELETING thumbanil for this map: " + currentMapIdSelector(store.getState()) + "\t\n" + details.error.status + " " + details.error.data,
                        autoDismiss: 6,
                        position: "tc"
                    }));
            }
            if (map.resType === "success" && details.resType === "success" && thumbnail.resType === "success") {
                actions.push(mapDeleted(resourceId, "success"));
                actions.push(success({
                        title: "notification.success",
                        message: "All resources associated with this map #### have been deleted successfully",
                        autoDismiss: 6,
                        position: "tc"
                    }));

                if ( state && state.maps && state.maps.totalCount === state.maps.start) {
                    actions.push(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
                }
            } else if (map.resType === "error") {
                actions.push(error({
                        title: "notification.warning",
                        message: "Error when DELETING this map: " + currentMapIdSelector(store.getState()) + "\t\n" + details.error.status + " " + details.error.data,
                        autoDismiss: 6,
                        position: "tc"
                    }));
                actions.push(mapDeleted(resourceId, "failure", map.error));
            }
            return Rx.Observable.from(actions);
        }).startWith(mapDeleting(resourceId));
    });

const mapCreatedNotificationEpic = action$ =>
    action$.ofType(MAP_CREATED).concat(
        action$.ofType(CLEAR_NOTIFICATIONS))
        .switchMap(() => Rx.Observable.of(success({
            title: "success",
            message: "The Map has been created correctly",
            autoDismiss: 6,
            position: "tc"
        })));


module.exports = {
    mapCreatedNotificationEpic,
    deleteMapAndAssociatedResources,
    setDetailsChangedEpic,
    fetchDetailsFromResource,
    saveResourceDetailsEpic
};
