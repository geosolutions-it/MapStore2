/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const uuidv1 = require('uuid/v1');
const assign = require('object-assign');
const {push} = require('connected-react-router');
const {basicError, basicSuccess} = require('../utils/NotificationUtils');
const GeoStoreApi = require('../api/GeoStoreDAO');
const { MAP_INFO_LOADED, MAP_SAVED, mapSaveError, mapSaved, loadMapInfo, configureMap } = require('../actions/config');
const {get, isNil, isArray, isEqual, find, pick, omit, keys, zip} = require('lodash');
const {
    SAVE_DETAILS, SAVE_RESOURCE_DETAILS, MAPS_GET_MAP_RESOURCES_BY_CATEGORY,
    DELETE_MAP, OPEN_DETAILS_PANEL, MAPS_LOAD_MAP,
    CLOSE_DETAILS_PANEL, NO_DETAILS_AVAILABLE, SAVE_MAP_RESOURCE, MAP_DELETED,
    SEARCH_FILTER_CHANGED, SEARCH_FILTER_CLEAR_ALL, LOAD_CONTEXTS,
    setDetailsChanged, updateDetails, mapsLoading, mapsLoaded,
    mapDeleting, toggleDetailsEditability, mapDeleted, loadError,
    doNothing, detailsLoaded, detailsSaving, onDisplayMetadataEdit,
    RESET_UPDATING, resetUpdating, toggleDetailsSheet, getMapResourcesByCategory,
    mapUpdating, savingMap, mapCreated, loadMaps, loadContexts, setContexts, setSearchFilter, loading
} = require('../actions/maps');
const {
    resetCurrentMap, EDIT_MAP
} = require('../actions/currentMap');
const {closeFeatureGrid} = require('../actions/featuregrid');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {setTabsHidden} = require('../actions/contenttabs');
const {
    mapPermissionsFromIdSelector, mapThumbnailsUriFromIdSelector,
    mapDetailsUriFromIdSelector,
    searchTextSelector,
    searchParamsSelector,
    totalCountSelector,
    contextsSelector,
    searchFilterSelector
} = require('../selectors/maps');
const {
    mapIdSelector, mapInfoDetailsUriFromIdSelector
} = require('../selectors/map');
const {mapTypeSelector} = require('../selectors/maptype');
const {
    currentMapDetailsTextSelector, currentMapIdSelector,
    currentMapDetailsUriSelector, currentMapSelector,
    currentMapDetailsChangedSelector, currentMapOriginalDetailsTextSelector
} = require('../selectors/currentmap');
const {userParamsSelector, userRoleSelector} = require('../selectors/security');
const {
    LOGIN_SUCCESS,
    LOGOUT
} = require('../actions/security');
const {deleteResourceById, createAssociatedResource, deleteAssociatedResource, updateAssociatedResource} = require('../utils/ObservableUtils');

const {getIdFromUri} = require('../utils/MapUtils');

const {getErrorMessage} = require('../utils/LocaleUtils');
const { EMPTY_RESOURCE_VALUE } = require('../utils/MapInfoUtils');
const {createResource, updateResource, getResource, searchListByAttributes, updateResourceAttribute} = require("../api/persistence");
const {wrapStartStop} = require('../observables/epics');


const calculateNewParams = state => {
    const totalCount = totalCountSelector(state);
    const {start, limit, ...params} = searchParamsSelector(state) || {};
    if (start === totalCount - 1) {
        return {
            start: Math.max(0, start - limit),
            limit
        };
    }
    return {
        start, limit, ...params
    };
};

const manageMapResource = ({map = {}, attribute = "", resource = null, type = "STRING", optionsDel = {}, messages = {}} = {}) => {
    const attrVal = map[attribute];
    const mapId = map.id;
    // create
    if ((isNil(attrVal) || attrVal === EMPTY_RESOURCE_VALUE) && !isNil(resource)) {
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
            if (!detailsUri || detailsUri === EMPTY_RESOURCE_VALUE) {
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

const loadMapsEpic = (action$) =>
    action$.ofType(MAPS_LOAD_MAP)
        .switchMap((action) => {
            let {params, searchText, geoStoreUrl} = action;
            let modifiedSearchText = searchText.replace(/[/?:;@=&\\]+/g, '');
            let opts = assign({}, {params}, geoStoreUrl ? {baseURL: geoStoreUrl} : {});
            return Rx.Observable.of(
                mapsLoading(modifiedSearchText, params),
                getMapResourcesByCategory("MAP", modifiedSearchText, opts)
            );

        });

const reloadMapsEpic = (action$, { getState = () => { } }) =>
    action$.ofType(MAP_DELETED, MAP_SAVED)
        .delay(1000)
        .switchMap(() => Rx.Observable.of(loadMaps(false,
            searchTextSelector(getState()),
            calculateNewParams(getState())
        )));

const getMapsResourcesByCategoryEpic = (action$, store) =>
    action$.ofType(MAPS_GET_MAP_RESOURCES_BY_CATEGORY)
        .switchMap((action) => {
            const state = store.getState();
            const searchFilter = searchFilterSelector(state) || {};
            const userRole = userRoleSelector(state);
            let {map, searchText, opts = {}} = action;
            const searchFilterContexts = searchFilter.contexts && searchFilter.contexts.length > 0;
            const actualSearchText = searchFilterContexts && searchText === '*' ? '' : searchText;
            const makeFilter = () => ({
                AND: {
                    FIELD: [{
                        field: ['NAME'],
                        operator: ['ILIKE'],
                        value: ['%' + actualSearchText + '%']
                    }],
                    OR: searchFilterContexts && {
                        ATTRIBUTE: (searchFilter.contexts || []).map(context => ({
                            name: ['context'],
                            operator: ['EQUAL_TO'],
                            type: ['STRING'],
                            value: [context.id]
                        }))
                    }
                }
            });
            const getContextNames = ({results, ...other}) => {
                const maps = isArray(results) ? results : (results === "" ? [] : [results]);
                return maps.length === 0 ?
                    Rx.Observable.of({results, ...other}) :
                    Rx.Observable.forkJoin(
                        maps.map(({context}) => context ?
                            getResource(context, {includeAttributes: false, withData: false, withPermissions: false})
                                .switchMap(resource => Rx.Observable.of(resource.name))
                                .catch(() => Rx.Observable.of(null)) :
                            Rx.Observable.of(null))
                    ).map(contextNames => ({
                        results: zip(maps, contextNames).map(
                            ([curMap, contextName]) => ({...curMap, contextName})),
                        ...other
                    }));
            };

            return (searchFilterContexts ? searchListByAttributes(makeFilter(), {
                ...opts,
                params: {
                    ...(opts.params || {}),
                    includeAttributes: true
                }
            })
                .switchMap(({results, totalCount}) => {
                    const maps = {
                        results: results.map(result => ({
                            ...omit(result, 'attributes', 'permissions'),
                            ...pick(result.attributes, 'thumbnail', 'context'),
                            canCopy: userRole === 'ADMIN',
                            canEdit: userRole === 'ADMIN',
                            canDelete: userRole === 'ADMIN'
                        })),
                        totalCount,
                        success: true
                    };
                    return getContextNames(maps).switchMap(mapsWithContext =>
                        Rx.Observable.of(mapsLoaded(mapsWithContext, opts.params, actualSearchText)));
                }) :
                Rx.Observable.fromPromise(GeoStoreApi.getResourcesByCategory(map, actualSearchText, {
                    ...opts,
                    params: {
                        ...(opts.params || {}),
                        includeAttributes: true
                    }
                })
                    .then(data => data))
                    .switchMap((response) => getContextNames(response).switchMap(responseWithContext => Rx.Observable.of(
                        mapsLoaded(responseWithContext, opts.params, searchText)
                    )))
            )
                .let(wrapStartStop(
                    loading(true, 'loadingMaps'),
                    loading(false, 'loadingMaps'),
                    e => Rx.Observable.of(loadError(e))
                ));
        });

const loadMapsOnSearchFilterChange = (action$, store) =>
    action$.ofType(SEARCH_FILTER_CHANGED, SEARCH_FILTER_CLEAR_ALL)
        .filter(({filter}) => !filter || filter === 'contexts')
        .switchMap(({type}) => {
            const state = store.getState();
            const searchFilter = searchFilterSelector(state);
            const searchText = searchTextSelector(state);
            const {limit = 12, ...params} = searchParamsSelector(state) || {};

            return Rx.Observable.of(
                ...(type === SEARCH_FILTER_CLEAR_ALL ? [setSearchFilter({})] : []),
                ...(type === SEARCH_FILTER_CLEAR_ALL && (!searchFilter || (searchFilter.contexts || []).length === 0) ?
                    [] :
                    [loadMaps(null, searchText, {start: 0, limit, ...omit(params, 'start')})])
            );
        });

const hideTabsOnSearchFilterChange = (action$) =>
    action$.ofType(SEARCH_FILTER_CHANGED, SEARCH_FILTER_CLEAR_ALL)
        .filter(({filter}) => !filter || filter === 'contexts')
        .switchMap(({filterData}) => Rx.Observable.of(
            setTabsHidden(
                (filterData || []).length === 0 ? {
                    geostories: false,
                    dashboards: false
                } : {
                    geostories: true,
                    dashboards: true
                }
            )
        ));

const mapsLoadContextsEpic = (action$) =>
    action$.ofType(LOAD_CONTEXTS)
        .distinctUntilChanged((prev, cur) =>
            (prev.searchText || '*') === (cur.searchText || '*') &&
            isEqual(prev.options, cur.options) &&
            !cur.force
        )
        .switchMap(({searchText, options = {}, delayLoad = 0}) => {
            const curSearchText = searchText || '*';
            return Rx.Observable.of(null).delay(delayLoad).switchMap(() =>
                Rx.Observable.defer(() => GeoStoreApi.getResourcesByCategory('CONTEXT', curSearchText, options))
                    .switchMap(response => {
                        return Rx.Observable.of(setContexts({
                            results: (isArray(response.results) ? response.results : [response.results]).filter(r => !!r),
                            totalCount: response.totalCount,
                            searchText: curSearchText,
                            start: get(options, 'params.start'),
                            limit: get(options, 'params.limit')
                        }));
                    })
                    .let(wrapStartStop(
                        loading(true, 'loadingContexts'),
                        loading(false, 'loadingContexts'),
                        () => Rx.Observable.of(basicError({
                            message: 'maps.feedback.errorLoadingContexts'
                        }))
                    ))
            );
        });

const mapsSetupFilterOnLogin = (action$, store) =>
    action$.ofType(LOGIN_SUCCESS, LOGOUT)
        .switchMap(() => {
            const state = store.getState();
            const contexts = contextsSelector(state) || {};
            return Rx.Observable.of(setControlProperty('advancedsearchpanel', 'enabled', false), loadContexts(contexts.searchText,
                {params: {start: get(contexts, 'start', 0), limit: get(contexts, 'limit', 12)}},
                0,
                true
            ));
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
                // TODO: if after delete the page is empty, you should re-do the query for the previous page (if it exists)
                // something like :
                // if ( condition ) {
                //    actions.push(loadMaps(false, state.maps.searchText || ConfigUtils.getDefaults().initialMapFilter || "*")); // first page
                // }
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
                        if (!details || details.value === EMPTY_RESOURCE_VALUE) {
                            return Rx.Observable.empty();
                        }
                        return Rx.Observable.of(
                            detailsLoaded(mapId, details.value)
                        );
                    });
        });
/**
 * Create or update map resource with persistence api
 */
const mapSaveMapResourceEpic = (action$, store) =>
    action$.ofType(SAVE_MAP_RESOURCE)
        .exhaustMap(({resource}) => {
            // filter out invalid attributes
            const validAttributesNames = keys(resource.attributes)
                .filter(attrName => resource.attributes[attrName] !== undefined && resource.attributes[attrName] !== null);
            return Rx.Observable.forkJoin(
                (() => {
                    // get a context information using the id in the attribute
                    const contextId = get(resource, 'attributes.context');
                    return contextId ? getResource(contextId, {withData: false}) : Rx.Observable.of(null);
                })(),
                !resource.id ? createResource(resource) : updateResource(resource))
                .switchMap(([contextResource, rid]) => (validAttributesNames.length > 0 ?
                    // update valid attributes
                    Rx.Observable.forkJoin(validAttributesNames.map(attrName => updateResourceAttribute({
                        id: rid,
                        name: attrName,
                        value: resource.attributes[attrName]
                    }))) : Rx.Observable.of([])).switchMap(() =>
                    Rx.Observable.from([
                        ...(resource.id ? [loadMapInfo(rid)] : []),
                        ...(resource.id ? [configureMap(resource.data, rid)] : []),
                        resource.id ? toggleControl('mapSave') : toggleControl('mapSaveAs'),
                        mapSaved(),
                        ...(!resource.id ? [
                            mapCreated(rid, assign({id: rid, canDelete: true, canEdit: true, canCopy: true}, resource.metadata), resource.data),
                            // if we got a valid context information redirect to a context, instead of the default viewer
                            push(contextResource ?
                                `/context/${contextResource.name}/${rid}` :
                                `/viewer/${mapTypeSelector(store.getState())}/${rid}`)]
                            : [])
                    ])
                        .merge(
                            Rx.Observable.of(basicSuccess({
                                title: 'map.savedMapTitle',
                                message: 'map.savedMapMessage',
                                autoDismiss: 6,
                                position: 'tc'
                            }))
                        )
                ))
                .catch((e) => {
                    const { status, statusText, data, message, ...other} = e;
                    return Rx.Observable.of(mapSaveError(status ? { status, statusText, data } : message || other), basicError({
                        ...getErrorMessage(e, 'geostore', 'mapsError'),
                        autoDismiss: 6,
                        position: 'tc'
                    }));
                })
                .startWith(!resource.id ? savingMap(resource.metadata) : mapUpdating(resource.metadata));
        });

module.exports = {
    loadMapsEpic,
    resetCurrentMapEpic,
    storeDetailsInfoEpic,
    closeDetailsPanelEpic,
    fetchDataForDetailsPanel,
    deleteMapAndAssociatedResourcesEpic,
    getMapsResourcesByCategoryEpic,
    loadMapsOnSearchFilterChange,
    hideTabsOnSearchFilterChange,
    mapsLoadContextsEpic,
    mapsSetupFilterOnLogin,
    setDetailsChangedEpic,
    fetchDetailsFromResourceEpic,
    saveResourceDetailsEpic,
    mapSaveMapResourceEpic,
    reloadMapsEpic
};
