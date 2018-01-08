/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {get, head, isEmpty, find} = require('lodash');
const { LOCATION_CHANGE } = require('react-router-redux');
const Proj4js = require('proj4').default;
const proj4 = Proj4js;
const axios = require('../libs/ajax');
const bbox = require('@turf/bbox');
const {fidFilter} = require('../utils/ogc/Filter/filter');
const {getDefaultFeatureProjection} = require('../utils/FeatureGridUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');
const LayersUtils = require('../utils/LayersUtils');
const {isSimpleGeomType} = require('../utils/MapUtils');
const assign = require('object-assign');
const {changeDrawingStatus, GEOMETRY_CHANGED, drawSupportReset} = require('../actions/draw');
const requestBuilder = require('../utils/ogc/WFST/RequestBuilder');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {setControlProperty} = require('../actions/controls');
const {query, QUERY_CREATE, QUERY_RESULT, LAYER_SELECTED_FOR_SEARCH, FEATURE_TYPE_LOADED, UPDATE_QUERY, featureTypeSelected, createQuery, updateQuery, TOGGLE_SYNC_WMS} = require('../actions/wfsquery');
const {reset, QUERY_FORM_SEARCH, loadFilter} = require('../actions/queryform');
const {zoomToExtent} = require('../actions/map');

const {BROWSE_DATA, changeLayerProperties, refreshLayerVersion} = require('../actions/layers');
const {purgeMapInfoResults} = require('../actions/mapInfo');
const {getCapabilities, parseLayerCapabilities} = require('../api/WMS');

const {SORT_BY, CHANGE_PAGE, SAVE_CHANGES, SAVE_SUCCESS, DELETE_SELECTED_FEATURES, featureSaving, changePage,
    saveSuccess, saveError, clearChanges, setLayer, clearSelection, toggleViewMode, toggleTool,
    CLEAR_CHANGES, START_EDITING_FEATURE, TOGGLE_MODE, MODES, geometryChanged, DELETE_GEOMETRY, deleteGeometryFeature,
    SELECT_FEATURES, DESELECT_FEATURES, START_DRAWING_FEATURE, CREATE_NEW_FEATURE,
    CLEAR_CHANGES_CONFIRMED, FEATURE_GRID_CLOSE_CONFIRMED,
    openFeatureGrid, closeFeatureGrid, OPEN_FEATURE_GRID, CLOSE_FEATURE_GRID, CLOSE_FEATURE_GRID_CONFIRM, OPEN_ADVANCED_SEARCH, ZOOM_ALL, UPDATE_FILTER, START_SYNC_WMS,
    STOP_SYNC_WMS, startSyncWMS, storeAdvancedSearchFilter} = require('../actions/featuregrid');

const {TOGGLE_CONTROL, resetControls} = require('../actions/controls');
const {setHighlightFeaturesPath} = require('../actions/highlight');

const {selectedFeaturesSelector, changesMapSelector, newFeaturesSelector, hasChangesSelector, hasNewFeaturesSelector,
    selectedFeatureSelector, selectedFeaturesCount, selectedLayerIdSelector, isDrawingSelector, modeSelector,
    isFeatureGridOpen, hasSupportedGeometry} = require('../selectors/featuregrid');
const {queryPanelSelector} = require('../selectors/controls');

const {error, warning} = require('../actions/notifications');
const {describeSelector, isDescribeLoaded, getFeatureById, wfsURL, wfsFilter, featureCollectionResultSelector, isSyncWmsActive} = require('../selectors/query');

const {getLayerFromId} = require('../selectors/layers');

const {interceptOGCError} = require('../utils/ObservableUtils');

const {gridUpdateToQueryUpdate} = require('../utils/FeatureGridUtils');

const {queryFormUiStateSelector} = require('../selectors/queryform');
/**
@return a spatial filter with coordinates reprojeted to nativeCrs
*/
const reprojectFilterInNativeCrs = (filter, nativeCrs) => {
    let newCoords = CoordinatesUtils.reprojectGeoJson(filter.spatialField.geometry, filter.spatialField.geometry.projection || "EPSG:3857", nativeCrs).coordinates;
    return {
        ...filter,
        spatialField: {
            ...filter.spatialField,
            geometry: {
                ...filter.spatialField.geometry,
                coordinates: newCoords
            }
        }
    };
};
const setupDrawSupport = (state, original) => {
    const defaultFeatureProj = getDefaultFeatureProjection();
    let drawOptions; let geomType;
    let feature = assign({}, selectedFeatureSelector(state), {type: "Feature"});
    if (!isEmpty(feature)) {
        geomType = findGeometryProperty(describeSelector(state)).localType;

        // TODO check this WITH APPLY CHANGES
        let changes = changesMapSelector(state);
        if (changes[feature.id] && (changes[feature.id].geometry || changes[feature.id].geometry === null)) {
            feature.geometry = changes[feature.id].geometry;
        }
        if (feature._new && !feature.geometry) {
            const stateNewFeature = find(newFeaturesSelector(state), {id: feature.id});
            if (stateNewFeature && stateNewFeature.geometry ) {
                feature.geometry = stateNewFeature.geometry;
            }

        }
        if (original) {
            feature.geometry = getFeatureById(state, feature.id) ? getFeatureById(state, feature.id).geometry : null;
        }

        drawOptions = {
            featureProjection: defaultFeatureProj,
            stopAfterDrawing: isSimpleGeomType(geomType),
            editEnabled: !!feature.geometry,
            drawEnabled: false,
            ftId: feature.id
        };
        if (selectedFeaturesCount(state) === 1) {
            if (feature.geometry === null) {
                return Rx.Observable.from([
                    drawSupportReset()
                ]);
            }
            return Rx.Observable.from([
                changeDrawingStatus("drawOrEdit", geomType, "featureGrid", [feature], drawOptions)
            ]);
        }
    }
    return Rx.Observable.from([
        changeDrawingStatus("clean", "", "featureGrid", [], {})
    ]);
};

// pagination selector
const getPagination = (state, {page, size} = {}) => {
    let currentPagination = get(state, "featuregrid.pagination");
    let maxFeatures = size !== undefined ? size : currentPagination.size;
    return {
        startIndex: page !== undefined ? page * maxFeatures : currentPagination.page * maxFeatures,
        maxFeatures
    };
};
const addPagination = (filterObj, pagination) => ({
    ...filterObj,
    pagination
});

const createChangesTransaction = (changes, newFeatures, {insert, update, propertyChange, getPropertyName, transaction})=>
    transaction(
        newFeatures.map(f => insert(f)),
        Object.keys(changes).map( id =>
            Object.keys(changes[id]).map(name =>
                update([propertyChange(getPropertyName(name), changes[id][name]), fidFilter("ogc", id)])
            )
        )
    );
const createDeleteTransaction = (features, {transaction, deleteFeature}) => transaction(
    features.map(deleteFeature)
);
const save = (url, body) => Rx.Observable.defer(() => axios.post(url, body, {headers: { 'Content-Type': 'application/xml'}}))
    .let(interceptOGCError);

const createSaveChangesFlow = (changes = {}, newFeatures = [], describeFeatureType, url) => save(
    url,
    createChangesTransaction(changes, newFeatures, requestBuilder(describeFeatureType))
);

const createDeleteFlow = (features, describeFeatureType, url) => save(
    url,
    createDeleteTransaction(features, requestBuilder(describeFeatureType))
);

const createLoadPageFlow = (store) => ({page, size} = {}) => {
    const state = store.getState();
    return Rx.Observable.of( query(
            wfsURL(state),
            addPagination({
                    ...(wfsFilter(state))
                },
                getPagination(state, {page, size})
            )
    ));
};

const createInitialQueryFlow = (action$, store, {url, name, id} = {}) => {
    const filterObj = get(store.getState(), `featuregrid.advancedFilters.${id}`);
    const createInitialQuery = () => createQuery(url, filterObj || {
        featureTypeName: name,
        filterType: 'OGC',
        ogcVersion: '1.1.0'
    });

    if (isDescribeLoaded(store.getState(), name)) {
        return Rx.Observable.of(createInitialQuery(), featureTypeSelected(url, name));
    }
    return Rx.Observable.of(featureTypeSelected(url, name)).merge(
        action$.ofType(FEATURE_TYPE_LOADED).filter(({typeName} = {}) => typeName === name)
            .map(createInitialQuery)
    );
};

// Create action to add filter to wms layer
const addFilterToWMSLayer = (layer, filter) => {
    return changeLayerProperties(layer, {filterObj: filter});
};
// Create action to add nativeCrs to wms layer
const addNativeCrsLayer = (layer, nativeCrs = "") => {
    return changeLayerProperties(layer, {nativeCrs});
};
const removeFilterFromWMSLayer = ({featuregrid: f} = {}) => {
    return changeLayerProperties(f.selectedLayer, {filterObj: undefined});
};

/**
 * Epìcs for feature grid
 * @memberof epics
 * @name featuregrid
 */
module.exports = {
    featureGridBrowseData: (action$, store) =>
        action$.ofType(BROWSE_DATA).switchMap( ({layer}) => {
            const currentTypeName = get(store.getState(), "query.typeName");
            return Rx.Observable.of(
                setControlProperty('drawer', 'enabled', false),
                setLayer(layer.id),
                openFeatureGrid()
                ).merge(
                    createInitialQueryFlow(action$, store, layer)
                )
                .merge(
                    Rx.Observable.of(reset())
                    .filter(() => currentTypeName !== layer.name)
                );
        }),
    /**
     * Intercepts layer selection to set it's id in the status and retrieve it later
     * @memberof epics.featuregrid
     */
    featureGridLayerSelectionInitialization: (action$) =>
        action$.ofType(LAYER_SELECTED_FOR_SEARCH)
            .switchMap( a => Rx.Observable.of(setLayer(a.id))),
    /**
     * Intercepts query creation to perform the real query, setting page to 0
     * @memberof epics.featuregrid
     */
    featureGridStartupQuery: (action$, store) =>
        action$.ofType(QUERY_CREATE)
            .switchMap(() => Rx.Observable.of(changePage(0))
            .concat(modeSelector(store.getState()) === MODES.VIEW ? Rx.Observable.of(toggleViewMode()) : Rx.Observable.empty())),
    /**
     * Create sorted queries on sort action
     * @memberof epics.featuregrid
     */
    featureGridSort: (action$, store) =>
        action$.ofType(SORT_BY).switchMap( ({sortBy, sortOrder}) =>
            Rx.Observable.of( query(
                    wfsURL(store.getState()),
                    addPagination({
                            ...wfsFilter(store.getState()),
                            sortOptions: {sortBy, sortOrder}
                        },
                        getPagination(store.getState())
                    )
            ))
        ),
    /**
     * Performs the query when the text filter is updated
     * @memberof epics.featuregrid
     */
    featureGridUpdateFilter: (action$, store) => action$.ofType(QUERY_CREATE).switchMap( () =>
        action$.ofType(UPDATE_FILTER)
            .map( ({update = {}} = {}) => updateQuery(gridUpdateToQueryUpdate(update, wfsFilter(store.getState()))))
    ),

    /**
     * perform paginated query on page change
     * @memberof epics.featuregrid
     */
    featureGridChangePage: (action$, store) =>
        action$.ofType(CHANGE_PAGE)
            .merge(action$.ofType(UPDATE_QUERY).debounceTime(500).map(action => ({...action, page: 0})))
            .switchMap(createLoadPageFlow(store)),
    /**
     * Reload the page on save success.
     * NOTE: The page is in the action.
     * ( e.g. for delete the page may be reset to 0)
     * @memberof epics.featuregrid
     */
    featureGridReloadPageOnSaveSuccess: (action$, store) =>
        action$.ofType(SAVE_SUCCESS).switchMap( ({page, size} = {}) =>
            Rx.Observable.of(
                query(
                    wfsURL(store.getState()),
                    addPagination({
                            ...wfsFilter(store.getState())
                        },
                        getPagination(store.getState(), {page, size})
                    )
                ),
                refreshLayerVersion(selectedLayerIdSelector(store.getState()))

            ).merge(
                action$.ofType(QUERY_RESULT).map(() => clearChanges())
            )
        ),
    /**
     * trigger WFS transaction stream on SAVE_CHANGES action
     */
    savePendingFeatureGridChanges: (action$, store) =>
        action$.ofType(SAVE_CHANGES).switchMap( () =>
            Rx.Observable.of(featureSaving())
                .concat(
                    createSaveChangesFlow(
                        changesMapSelector(store.getState()),
                        newFeaturesSelector(store.getState()),
                        describeSelector(store.getState()),
                        wfsURL(store.getState())
                    ).map(() => saveSuccess())
                    .catch((e) => Rx.Observable.of(saveError(), error({
                        title: "featuregrid.errorSaving",
                        message: e.message || "Unknown Exception",
                        uid: "saveError",
                        autoDismiss: 5
                      })))
                )


        ),
    /**
     * trigger WFS transaction stream on DELETE_SELECTED_FEATURES action
     * @memberof epics.featuregrid
     */
    deleteSelectedFeatureGridFeatures: (action$, store) =>
        action$.ofType(DELETE_SELECTED_FEATURES).switchMap( () =>
            Rx.Observable.of(featureSaving())
                .concat(
                    createDeleteFlow(
                        selectedFeaturesSelector(store.getState()),
                        describeSelector(store.getState()),
                        wfsURL(store.getState())
                    ).map(() => saveSuccess())
                    // close window
                    .catch((e) => Rx.Observable.of(saveError(), error({
                        title: "featuregrid.errorSaving",
                        message: e.message || "Unknown Exception",
                        uid: "saveError"
                      }))).concat(Rx.Observable.of(
                          toggleTool("deleteConfirm"),
                          clearSelection()
                      ))
                )
        ),
    /**
     * Enable and manage editing draw support
     * @memberof epics.featuregrid
     */
    handleEditFeature: (action$, store) => action$.ofType(START_EDITING_FEATURE)
        .switchMap( () => {
            const state = store.getState();
            const describe = describeSelector(state);
            const defaultFeatureProj = getDefaultFeatureProjection();
            const geomType = findGeometryProperty(describe).localType;
            const drawOptions = {
                featureProjection: defaultFeatureProj,
                stopAfterDrawing: false,
                editEnabled: true,
                drawEnabled: false
            };
            let feature = assign({}, selectedFeatureSelector(state), {type: "Feature"});
            let changes = changesMapSelector(state);
            if (changes[feature.id] && changes[feature.id] && changes[feature.id].geometry) {
                feature.geometry = changes[feature.id].geometry;
            }
            return Rx.Observable.of(changeDrawingStatus("drawOrEdit", geomType, "featureGrid", [feature], drawOptions));
        }),
    /**
     * handle drawing actions on START_DRAWING_FEATURE action
     * @memberof epics.featuregrid
     */
    handleDrawFeature: (action$, store) => action$.ofType(START_DRAWING_FEATURE)
        .switchMap( () => {
            const state = store.getState();
            const describe = describeSelector(state);
            const defaultFeatureProj = getDefaultFeatureProjection();
            const geomType = findGeometryProperty(describe).localType;
            let feature = assign({}, selectedFeatureSelector(state), {type: "Feature"});
            let changes = changesMapSelector(state);
            if (changes[feature.id] && (changes[feature.id].geometry || changes[feature.id].geometry === null)) {
                feature.geometry = changes[feature.id].geometry;
            }
            if (feature._new) {
                feature.geometry = head(newFeaturesSelector(state)).geometry;
            }
            const drawOptions = {
                featureProjection: defaultFeatureProj,
                stopAfterDrawing: true,
                editEnabled: !isDrawingSelector(state),
                drawEnabled: isDrawingSelector(state)
            };
            return Rx.Observable.of(changeDrawingStatus("drawOrEdit", geomType, "featureGrid", [feature], drawOptions));
        }),
    resetEditingOnFeatureGridClose: (action$, store) => action$.ofType(OPEN_FEATURE_GRID).switchMap( () =>
        action$.ofType(TOGGLE_MODE)
            .filter(() => modeSelector(store.getState()) === MODES.EDIT)
            .take(1)
            .switchMap( () =>
                action$.ofType(LOCATION_CHANGE, CLOSE_FEATURE_GRID)
                    .take(1)
                    .switchMap(() => Rx.Observable.of(drawSupportReset())))

    ),
    closeCatalogOnFeatureGridOpen: (action$) =>
        action$.ofType(OPEN_FEATURE_GRID)
            .switchMap( () => {
                return Rx.Observable.of(setControlProperty('metadataexplorer', 'enabled', false));
            }),
    /**
     * intercept geometry changed events in draw support to update current
     * modified geometry in featuregrid
     * @memberof epics.featuregrid
     */
    onFeatureGridGeometryEditing: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
        .filter(a => a.owner === "featureGrid")
        .switchMap( (a) => {
            const state = store.getState();
            const defaultFeatureProj = getDefaultFeatureProjection();
            const drawOptions = {
                featureProjection: defaultFeatureProj,
                stopAfterDrawing: false,
                editEnabled: true,
                drawEnabled: false
            };
            let feature = assign({}, head(a.features), {id: selectedFeatureSelector(state).id, _new: selectedFeatureSelector(state)._new, type: "Feature"});
            let enableEdit = a.enableEdit === "enterEditMode" ? Rx.Observable.of(changeDrawingStatus("drawOrEdit", feature.geometry.type, "featureGrid", [feature], drawOptions)) : Rx.Observable.empty();
            return Rx.Observable.of(geometryChanged([feature])).concat(enableEdit);
        }),
    /**
     * Manage delete geometry action flow
     * @memberof epics.featuregrid
     */
    deleteGeometryFeature: (action$, store) => action$.ofType(DELETE_GEOMETRY)
        .switchMap( () => {
            const state = store.getState();
            return Rx.Observable.from([
                deleteGeometryFeature(selectedFeaturesSelector(state)),
                drawSupportReset()
            ]);
        }),
    /**
     * triggers draw support events on selection changes.
     * @memberof epics.featuregrid
     */
    triggerDrawSupportOnSelectionChange: (action$, store) => action$.ofType(SELECT_FEATURES, DESELECT_FEATURES, CLEAR_CHANGES, TOGGLE_MODE)
        .filter(() => modeSelector(store.getState()) === MODES.EDIT && hasSupportedGeometry(store.getState()))
        .switchMap( (a) => {
            const state = store.getState();
            let useOriginal = a.type === CLEAR_CHANGES;
            return setupDrawSupport(state, useOriginal);
        }),
    /**
     * Proerly resets draw support on create new feature
     */
    onFeatureGridCreateNewFeature: (action$) => action$.ofType(CREATE_NEW_FEATURE)
        .switchMap( () => {
            return Rx.Observable.of(drawSupportReset());
        }),
    /**
     * control highlight support on view mode.
     * @memberof epics.featuregrid
     */
    setHighlightFeaturesPath: (action$, store) => action$.ofType(TOGGLE_MODE)
        .switchMap( (a) => {
            if (a.mode === MODES.VIEW) {
                return Rx.Observable.of(drawSupportReset(), setHighlightFeaturesPath("featuregrid.select"));
            }
            if (a.mode === MODES.EDIT && !hasSupportedGeometry(store.getState())) {
                return Rx.Observable.of(drawSupportReset(), setHighlightFeaturesPath("featuregrid.select"), warning({
                    title: "featuregrid.notSupportedGeometryTitle",
                    message: "featuregrid.notSupportedGeometry",
                    uid: "notSupportedGeometryWarning",
                    autoDismiss: 5
                }));
            }
            return Rx.Observable.of(setHighlightFeaturesPath());
        }),
    /**
     * Restores the view mode on location change.
     * This forces to view mode and turn all tools to initial state.
     */
    resetGridOnLocationChange: action$ =>
        action$.ofType(OPEN_FEATURE_GRID).switchMap( () =>
            action$.ofType(LOCATION_CHANGE)
                .take(1)
                .switchMap(() =>
                    Rx.Observable.of(
                        toggleViewMode(),
                        closeFeatureGrid()
                    )
                )
                .takeUntil(action$.ofType(CLOSE_FEATURE_GRID))
        ),
    resetQueryPanel: (action$, store) =>
        action$.ofType(LOCATION_CHANGE).switchMap( () => {
            return queryPanelSelector(store.getState()) ? Rx.Observable.of(setControlProperty('queryPanel', "enabled", false))
        : Rx.Observable.empty(); }
    ),
    /**
     * Closes the feature grid when the drawer menu button has been toggled
     * @memberof epics.featuregrid
     */
    autoCloseFeatureGridEpicOnDrowerOpen: (action$, store) =>
        action$.ofType(OPEN_FEATURE_GRID).switchMap(() =>
            action$.ofType(TOGGLE_CONTROL)
                .filter(action => action.control && action.control === 'drawer' && isFeatureGridOpen(store.getState()))
                .switchMap(() => Rx.Observable.of(closeFeatureGrid()))
                .takeUntil(action$.ofType(CLOSE_FEATURE_GRID, LOCATION_CHANGE))
        ),
    askChangesConfirmOnFeatureGridClose: (action$, store) => action$.ofType(CLOSE_FEATURE_GRID_CONFIRM).switchMap( () => {
        const state = store.getState();
        if (hasChangesSelector(state) || hasNewFeaturesSelector(state)) {
            return Rx.Observable.of(toggleTool("featureCloseConfirm", true));
        }
        return Rx.Observable.of(closeFeatureGrid());
    }),
    onClearChangeConfirmedFeatureGrid: (action$) => action$.ofType(CLEAR_CHANGES_CONFIRMED)
        .switchMap( () => Rx.Observable.of(clearChanges(), toggleTool("clearConfirm", false))),
    onCloseFeatureGridConfirmed: (action$) => action$.ofType(FEATURE_GRID_CLOSE_CONFIRMED)
        .switchMap( () => {
            return Rx.Observable.of(setControlProperty("drawer", "enabled", false), toggleTool("featureCloseConfirm", false));
        }),
    removeWmsFilterOnGridClose: (action$, store) =>
        action$.ofType(OPEN_ADVANCED_SEARCH, CLOSE_FEATURE_GRID)
           .filter(() => isSyncWmsActive(store.getState()))
           .scan((acc, cur) => {
               return cur.type === CLOSE_FEATURE_GRID && acc.type !== OPEN_ADVANCED_SEARCH ? removeFilterFromWMSLayer(store.getState()) : cur;
           }, {type: ''})
           .filter((a) => a.type === 'CHANGE_LAYER_PROPERTIES'),
    onOpenAdvancedSearch: (action$, store) =>
        action$.ofType(OPEN_ADVANCED_SEARCH).switchMap(() => {
            return Rx.Observable.of(
                loadFilter(get(store.getState(), `featuregrid.advancedFilters.${selectedLayerIdSelector(store.getState())}`)),
                closeFeatureGrid(),
                setControlProperty('queryPanel', "enabled", true)
            )
            .merge(
                Rx.Observable.race(
                    action$.ofType(QUERY_FORM_SEARCH).mergeMap((action) =>
                        Rx.Observable.of(
                            createQuery(action.searchUrl, action.filterObj),
                            storeAdvancedSearchFilter(assign({}, queryFormUiStateSelector(store.getState()), action.filterObj)),
                            setControlProperty('queryPanel', "enabled", false),
                            openFeatureGrid()
                        )
                    ),
                    action$.ofType(TOGGLE_CONTROL)
                        .filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled"))
                        .mergeMap(() => {
                            const {drawStatus} = (store.getState()).draw || {};
                            const acts = drawStatus !== 'clean' ? [changeDrawingStatus("clean", "", "featureGrid", [], {})] : [];
                            return Rx.Observable.from(acts.concat(openFeatureGrid()));
                        }
                    )
                ).takeUntil(action$.ofType(OPEN_FEATURE_GRID, LOCATION_CHANGE))
            );
        }),
    onFeatureGridZoomAll: (action$, store) =>
        action$.ofType(ZOOM_ALL).switchMap(() =>
            Rx.Observable.of(zoomToExtent(bbox(featureCollectionResultSelector(store.getState())), "EPSG:4326"))
    ),
    /**
     * reset controls on edit mode switch
     */
    resetControlsOnEnterInEditMode: (action$) =>
        action$.ofType(TOGGLE_MODE)
        .filter(a => a.mode === MODES.EDIT).map(() => resetControls(["query"])),
    closeIdentifyEpic: (action$) =>
        action$.ofType(OPEN_FEATURE_GRID)
        .switchMap(() => {
            return Rx.Observable.of(purgeMapInfoResults());
        }),
    /**
     * start sync filter with wms layer
     *
     * Since the CQL_FILTER must be projected in the native crs of the layer
     * if this info is missing and sync is active we need to perform a getCapabilites
     * to the single layer in order to fetch this data. see #2210 issue.
     */
     startSyncWmsFilter: (action$, store) =>
        action$.ofType(TOGGLE_SYNC_WMS)
        .filter( () => isSyncWmsActive(store.getState()))
        .switchMap(() => {
            const state = store.getState();
            const layerId = selectedLayerIdSelector(state);
            const objLayer = getLayerFromId(store.getState(), layerId);
            if (!objLayer.nativeCrs) {
                const reqUrl = LayersUtils.getCapabilitiesUrl(objLayer);
                // update layer with nativeCrs if fetched otherwise display a warning
                return Rx.Observable.fromPromise(
                    getCapabilities(reqUrl, false)
                    .then((capabilities) => {
                        const layerCapability = parseLayerCapabilities(capabilities, objLayer);
                        return head(layerCapability.crs) || "EPSG:3857";
                    })).switchMap((nativeCrs) => {
                        if (!CoordinatesUtils.determineCrs(nativeCrs)) {
                            const EPSG = nativeCrs.split(":").length === 2 ? nativeCrs.split(":")[1] : "3857";
                            return Rx.Observable.fromPromise(CoordinatesUtils.fetchProjRemotely(nativeCrs, CoordinatesUtils.getProjUrl(EPSG))
                                .then(res => {
                                    proj4.defs(nativeCrs, res.data);
                                    return [addNativeCrsLayer(layerId, nativeCrs), startSyncWMS()];
                                })).switchMap(actions => Rx.Observable.from(actions))
                                .catch(() => {
                                    return Rx.Observable.of(
                                        warning({
                                            title: "notification.warning",
                                            message: "featuregrid.errorProjFetch",
                                            position: "tc",
                                            autoDismiss: 5
                                        }),
                                        startSyncWMS());
                                });
                        }
                        return Rx.Observable.of(addNativeCrsLayer(layerId, nativeCrs), startSyncWMS());
                    });
            }
            return Rx.Observable.of(startSyncWMS());
        }),
    /**
     * stop sync filter with wms layer
     */
    stopSyncWmsFilter: (action$, store) =>
        action$.ofType(TOGGLE_SYNC_WMS)
        .filter( () => !isSyncWmsActive(store.getState()))
        .switchMap(() => Rx.Observable.from([removeFilterFromWMSLayer(store.getState()), {type: STOP_SYNC_WMS}])),
    /**
     * Sync map with filter.
     *
     */
    syncMapWmsFilter: (action$, store) =>
        action$.ofType(QUERY_CREATE, UPDATE_QUERY).
            filter((a) => {
                const {disableQuickFilterSync} = (store.getState()).featuregrid;
                return a.type === QUERY_CREATE || !disableQuickFilterSync;
            })
            .switchMap(() => {
                const {query: q, featuregrid: f} = store.getState();
                const layerId = (f || {}).selectedLayer;
                const filter = (q || {}).filterObj;
                return Rx.Observable.merge(
                    Rx.Observable.of(isSyncWmsActive(store.getState())).filter(a => a),
                    action$.ofType(START_SYNC_WMS))
                    .mergeMap(() => {
                        // if a spatial filter is present AND native crs is not present, we call the getCapabilites
                        if (filter && filter.spatialField && filter.spatialField.geometry && filter.spatialField.geometry.coordinates && filter.spatialField.geometry.coordinates[0]) {
                            const objLayer = getLayerFromId(store.getState(), layerId);
                            if (!objLayer.nativeCrs) {
                                const onlyAttributeFilter = {
                                    ...filter,
                                    spatialField: undefined
                                };
                                return Rx.Observable.of(addFilterToWMSLayer(layerId, onlyAttributeFilter));
                            }
                            return Rx.Observable.of(addFilterToWMSLayer(layerId, reprojectFilterInNativeCrs(filter, objLayer.nativeCrs)));
                        }
                        return Rx.Observable.of(addFilterToWMSLayer(layerId, filter));
                    });
            })
};
