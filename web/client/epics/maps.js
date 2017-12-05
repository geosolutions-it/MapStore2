/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const uuidv1 = require('uuid/v1');
const {head} = require('lodash');
const {error} = require('../actions/notifications');
const GeoStoreApi = require('../api/GeoStoreDAO');
const {
    DELETE_DETAILS, SAVE_DETAILS, SAVE_RESOURCE_DETAILS,
    OPEN_OR_FETCH_DETAILS,
    setUnsavedChanges, updateDetails, toggleDetailsSheet
} = require('../actions/maps');
const {
    mapDetailsFromIdSelector, mapPermissionsFromIdSelector
} = require('../selectors/maps');
const {
    currentMapDetailsSelector, currentMapIdSelector,
    currentMapDetailsUriSelector, currentMapSelector,
    currentMapDetailsChangedSelector
} = require('../selectors/currentmap');

const {userParamsSelector} = require('../selectors/security');
const {manageMapResource} = require('../utils/ObservableUtils');

/**
    If details are changed from the original ones then set unsavedCahnges to true
*/
const setUnsavedChangesEpic = (action$, store) =>
    action$.ofType(SAVE_DETAILS, DELETE_DETAILS)
    .switchMap(() => {
        const state = store.getState();
        const mapId = currentMapIdSelector(state);
        const originalDetails = mapDetailsFromIdSelector(state, mapId);
        const currentDetails = currentMapDetailsSelector(state);
        return Rx.Observable.of(setUnsavedChanges(originalDetails !== currentDetails), "detailsChanged");
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
        const value = currentMapDetailsSelector(state);
        const detailsChanged = currentMapDetailsChangedSelector(state);

        const createResOptions = {
            attribute: "details",
            map: currentMapSelector(state),
            resource: detailsChanged ? null : {
                category: "DETAILS",
                userParams: userParamsSelector(state),
                metadata: {name: uuidv1()},
                value,
                type: "STRING",
                permissions: mapPermissionsFromIdSelector(state, mapId),
                optionsAttr: {},
                optionsRes: {}
            }
        };
        return Rx.Observable.of({
            ...createResOptions
        }).let(manageMapResource);
    });

const fetchDetailsFromResource = (action$, store) =>
    action$.ofType(OPEN_OR_FETCH_DETAILS)
    .filter(a => a.fetch)
    .switchMap((a) => {
        const state = store.getState();
        let detailsId = head(decodeURIComponent(currentMapDetailsUriSelector(state)).match(/\d+/));
        return Rx.Observable.fromPromise(GeoStoreApi.getData(detailsId)
            .then(data => data))
            .switchMap((details) => {
                if (a.open) {
                    return Rx.Observable.of(
                        // update value in maps state
                        updateDetails(details, true),
                        toggleDetailsSheet(a.open)
                    );
                }
                return Rx.Observable.of(
                    // update value in maps state
                    updateDetails(details)
                );
            }).catch(e => {
                return Rx.Observable.of(error({
                        title: "notification.warning",
                        message: "Error saving details for this map: " + currentMapIdSelector(store.getState()) + "\t\n" + e.status + " " + e.data,
                        autoDismiss: 0,
                        position: "tc"
                    }));
            });
    });

module.exports = {
    setUnsavedChangesEpic,
    fetchDetailsFromResource,
    saveResourceDetailsEpic
};
