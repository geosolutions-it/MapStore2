/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const uuidv1 = require('uuid/v1');
const {basicError, basicSuccess} = require('../utils/NotificationUtils');
const GeoStoreApi = require('../api/GeoStoreDAO');
const { MAP_INFO_LOADED } = require('../actions/config');
const {isNil, find} = require('lodash');
const {
    SAVE_DETAILS, SAVE_RESOURCE_DETAILS,
    DELETE_MAP, OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL, NO_DETAILS_AVAILABLE,
    setDetailsChanged, updateDetails,
    mapDeleting, toggleDetailsEditability, mapDeleted, loadMaps,
    doNothing, detailsLoaded, detailsSaving, onDisplayMetadataEdit,
    RESET_UPDATING, resetUpdating, toggleDetailsSheet
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

const {userParamsSelector} = require('../selectors/security');
const {deleteResourceById, createAssociatedResource, deleteAssociatedResource, updateAssociatedResource} = require('../utils/ObservableUtils');
const ConfigUtils = require('../utils/ConfigUtils');

const {getIdFromUri} = require('../utils/MapUtils');

const manageMapResource = ({map = {}, attribute = "", resource = null, type = "STRING", optionsDel = {}, messages = {}} = {}) => {
    const attrVal = map[attribute];
    const mapId = map.id;
    // create
    if ((isNil(attrVal) || attrVal === "NODATA") && !isNil(resource)) {
        return createAssociatedResource({...resource, attribute, mapId, type, messages});
    }
    if (isNil(resource)) {
        // delete
        return deleteAssociatedResource({
            mapId,
            attribute,
            type,
            resourceId: getIdFromUri(attrVal),
            options: optionsDel,
            messages});
    }
    // update
    return updateAssociatedResource({
        permissions: resource.permissions,
        resourceId: getIdFromUri(attrVal),
        value: resource.value,
        attribute,
        options: resource.optionsAttr,
        messages});

};

/**
    If details are changed from the original ones then set unsavedChanges to true
*/
const setDetailsChangedEpic = (action$, store) =>
    action$.ofType(SAVE_DETAILS)
    .switchMap((a) => {
        let actions = [];
        const state = store.getState();
        const detailsUri = currentMapDetailsUriSelector(state);
        if (a.detailsText.length <= 500000) {
            actions.push(toggleDetailsSheet(true));
        } else {
            actions.push(basicError({message: "maps.feedback.errorSizeExceeded"}));
        }
        if (!detailsUri) {
            actions.push(setDetailsChanged(a.detailsText !== "<p><br></p>"));
            return Rx.Observable.from(actions);
        }
        const originalDetails = currentMapOriginalDetailsTextSelector(state);
        const currentDetails = currentMapDetailsTextSelector(state);
        actions.push(setDetailsChanged(originalDetails !== currentDetails));
        return Rx.Observable.from(actions);
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
        }).concat([detailsSaving(false), resetUpdating(mapId)]).startWith(detailsSaving(true));
    });

/**
    Epics used to fetch and/or open the details modal
*/
const fetchDetailsFromResourceEpic = (action$, store) =>
    action$.ofType(EDIT_MAP)
    .switchMap(() => {
        const state = store.getState();
        const mapId = currentMapIdSelector(state);
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
                return Rx.Observable.of(
                    basicError({ message: "maps.feedback.errorFetchingDetailsOfMap"}),
                    updateDetails(NO_DETAILS_AVAILABLE, true, NO_DETAILS_AVAILABLE),
                    toggleDetailsEditability(mapId));
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
            // delete thumbnail
            deleteResourceById(detailsId, options),
            // delete map
            deleteResourceById(mapId, options)
        ).concatMap(([details, thumbnail, map]) => {
            let actions = [];
            if (details.resType === "error") {
                actions.push(basicError({message: "maps.feedback.errorDeletingDetailsOfMap"}));
            }
            if (thumbnail.resType === "error") {
                actions.push(basicError({message: "maps.feedback.errorDeletingThumbnailOfMap"}));
            }
            if (map.resType === "error") {
                actions.push(basicError({message: "maps.feedback.errorDeletingMap"}));
                actions.push(mapDeleted(mapId, "failure", map.error));
            }
            if (map.resType === "success") {
                actions.push(mapDeleted(mapId, "success"));
                if ( isMapsLastPageSelector(state)) {
                    actions.push(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*"));
                }
            }
            if (map.resType === "success" && details.resType === "success" && thumbnail.resType === "success") {
                actions.push(basicSuccess({ message: "maps.feedback.allResDeleted"}));

            }
            return Rx.Observable.from(actions);
        }).startWith(mapDeleting(mapId));
    });

const fetchDataForDetailsPanel = (action$, store) =>
    action$.ofType(OPEN_DETAILS_PANEL)
    .switchMap(() => {
        const state = store.getState();
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
            }).startWith(toggleControl("details", "enabled"))
            .catch(() => {
                return Rx.Observable.of(
                    basicError({message: "maps.feedback.errorFetchingDetailsOfMap"}),
                    updateDetails(NO_DETAILS_AVAILABLE, true, NO_DETAILS_AVAILABLE)
                );
            });
    });

const closeDetailsPanelEpic = (action$) =>
    action$.ofType(CLOSE_DETAILS_PANEL)
    .switchMap(() => Rx.Observable.from( [
                toggleControl("details", "enabled"),
                resetCurrentMap()
            ])
    );
const resetCurrentMapEpic = (action$) =>
    action$.ofType(RESET_UPDATING)
    .switchMap(() => Rx.Observable.from( [
                onDisplayMetadataEdit(false),
                resetCurrentMap()
            ])
    );
const storeDetailsInfoEpic = (action$, store) =>
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
                if (!details) {
                    return Rx.Observable.empty();
                }
                return Rx.Observable.of(
                        detailsLoaded(mapId, details.value)
                    );
            });
    });


module.exports = {
    resetCurrentMapEpic,
    storeDetailsInfoEpic,
    closeDetailsPanelEpic,
    fetchDataForDetailsPanel,
    deleteMapAndAssociatedResourcesEpic,
    setDetailsChangedEpic,
    fetchDetailsFromResourceEpic,
    saveResourceDetailsEpic
};
