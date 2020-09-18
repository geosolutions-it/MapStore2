/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { get, head, isEmpty, find, castArray, includes, reduce } = require('lodash');
const { LOCATION_CHANGE } = require('connected-react-router');


const axios = require('../libs/ajax');
const bbox = require('@turf/bbox');
const {fidFilter} = require('../utils/ogc/Filter/filter');
const {getDefaultFeatureProjection, getPagesToLoad} = require('../utils/FeatureGridUtils');
const {isSimpleGeomType} = require('../utils/MapUtils');
const assign = require('object-assign');
const {changeDrawingStatus, GEOMETRY_CHANGED, drawSupportReset} = require('../actions/draw');
const requestBuilder = require('../utils/ogc/WFST/RequestBuilder');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const { FEATURE_INFO_CLICK, HIDE_MAPINFO_MARKER} = require('../actions/mapInfo');
const {query, QUERY, QUERY_CREATE, QUERY_RESULT, LAYER_SELECTED_FOR_SEARCH, FEATURE_TYPE_LOADED, UPDATE_QUERY, featureTypeSelected, createQuery, updateQuery, TOGGLE_SYNC_WMS, QUERY_ERROR, FEATURE_LOADING} = require('../actions/wfsquery');
const {reset, QUERY_FORM_SEARCH, loadFilter} = require('../actions/queryform');
const {zoomToExtent, CLICK_ON_MAP} = require('../actions/map');
const {projectionSelector} = require('../selectors/map');


const { BROWSE_DATA, changeLayerProperties, refreshLayerVersion, CHANGE_LAYER_PARAMS} = require('../actions/layers');
const { closeIdentify, hideMapinfoMarker } = require('../actions/mapInfo');


const {SORT_BY, CHANGE_PAGE, SAVE_CHANGES, SAVE_SUCCESS, DELETE_SELECTED_FEATURES, featureSaving, changePage,
    saveSuccess, saveError, clearChanges, setLayer, clearSelection, toggleViewMode, toggleTool,
    CLEAR_CHANGES, START_EDITING_FEATURE, TOGGLE_MODE, MODES, geometryChanged, DELETE_GEOMETRY, deleteGeometryFeature,
    SELECT_FEATURES, DESELECT_FEATURES, START_DRAWING_FEATURE, CREATE_NEW_FEATURE,
    CLEAR_CHANGES_CONFIRMED, FEATURE_GRID_CLOSE_CONFIRMED,
    openFeatureGrid, closeFeatureGrid, OPEN_FEATURE_GRID, CLOSE_FEATURE_GRID, CLOSE_FEATURE_GRID_CONFIRM, OPEN_ADVANCED_SEARCH, ZOOM_ALL, UPDATE_FILTER, START_SYNC_WMS,
    STOP_SYNC_WMS, startSyncWMS, storeAdvancedSearchFilter, fatureGridQueryResult, LOAD_MORE_FEATURES, SET_TIME_SYNC,
    updateFilter, selectFeatures, DEACTIVATE_GEOMETRY_FILTER, ACTIVATE_TEMPORARY_CHANGES, disableToolbar, FEATURES_MODIFIED,
    deactivateGeometryFilter } = require('../actions/featuregrid');

const {TOGGLE_CONTROL, resetControls, setControlProperty, toggleControl} = require('../actions/controls');
const {queryPanelSelector, showCoordinateEditorSelector, drawerEnabledControlSelector} = require('../selectors/controls');
const {setHighlightFeaturesPath} = require('../actions/highlight');
const {selectedFeaturesSelector, changesMapSelector, newFeaturesSelector, hasChangesSelector, hasNewFeaturesSelector,
    selectedFeatureSelector, selectedFeaturesCount, selectedLayerIdSelector, isDrawingSelector, modeSelector,
    isFeatureGridOpen, timeSyncActive, hasSupportedGeometry, queryOptionsSelector, getAttributeFilters, selectedLayerSelector} = require('../selectors/featuregrid');
const {error, warning} = require('../actions/notifications');
const {describeSelector, isDescribeLoaded, getFeatureById, wfsURL, wfsFilter, featureCollectionResultSelector, isSyncWmsActive, featureLoadingSelector} = require('../selectors/query');

const {interceptOGCError} = require('../utils/ObservableUtils');
const {gridUpdateToQueryUpdate, updatePages} = require('../utils/FeatureGridUtils');
const {queryFormUiStateSelector, spatialFieldSelector} = require('../selectors/queryform');
const {composeAttributeFilters} = require('../utils/FilterUtils');

const CoordinatesUtils = require('../utils/CoordinatesUtils');
const MapUtils = require('../utils/MapUtils');

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
            if (feature.geometry === null || feature.id === 'empty_row') {
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
const createLoadPageFlow = (store) => ({page, size, reason} = {}) => {
    const state = store.getState();
    return Rx.Observable.of( query(
        wfsURL(state),
        addPagination({
            ...(wfsFilter(state))
        },
        getPagination(state, {page, size})
        ),
        queryOptionsSelector(state),
        reason
    ));
};

const createInitialQueryFlow = (action$, store, {url, name, id} = {}) => {
    const filterObj = get(store.getState(), `featuregrid.advancedFilters["${id}"]`);
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

const removeFilterFromWMSLayer = ({featuregrid: f} = {}) => {
    return changeLayerProperties(f.selectedLayer, {filterObj: undefined});
};

const updateFilterFunc = (store) => ({update = {}} = {}) => {
    // If an advanced filter is present it's filterFields should be composed with the action'
    const {id} = selectedLayerSelector(store.getState());
    const filterObj = get(store.getState(), `featuregrid.advancedFilters["${id}"]`);
    if (filterObj) {
        const attributesFilter = getAttributeFilters(store.getState()) || {};
        const columnsFilters = reduce(attributesFilter, (cFilters, value, attribute) => {
            return gridUpdateToQueryUpdate({attribute, ...value}, cFilters);
        }, {});
        const composedFilterFields = composeAttributeFilters([filterObj, columnsFilters], "AND", "AND");
        const filter = {...filterObj, ...composedFilterFields};
        return updateQuery(filter, update.type);
    }
    return updateQuery(gridUpdateToQueryUpdate(update, wfsFilter(store.getState())), update.type);
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
                ...(currentTypeName !== layer.name ? [reset()] : []),
                setControlProperty('drawer', 'enabled', false),
                setLayer(layer.id),
                openFeatureGrid()
            ).merge(
                createInitialQueryFlow(action$, store, layer)
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
     * With virtualScroll active reset to page 0 but the grid will reload
     * to the current index
     * @memberof epics.featuregrid
     */
    featureGridSort: (action$, store) =>
        action$.ofType(SORT_BY)
            .switchMap( ({sortBy, sortOrder}) =>
                Rx.Observable.of( query(
                    wfsURL(store.getState()),
                    addPagination({
                        ...wfsFilter(store.getState()),
                        sortOptions: {sortBy, sortOrder}
                    },
                    getPagination(store.getState())
                    ),
                    queryOptionsSelector(store.getState())
                ))
                    .merge(action$.ofType(QUERY_RESULT)
                        .map((ra) => fatureGridQueryResult(get(ra, "result.features", []), [get(ra, "filterObj.pagination.startIndex")]))
                        .takeUntil(action$.ofType(QUERY_ERROR))
                        .take(1)
                    )
            ),
    /**
     * Performs the query when the geometry filter is updated
     * @memberof epics.featuregrid
     */
    featureGridUpdateGeometryFilter: (action$, store) =>
        action$.ofType(OPEN_FEATURE_GRID).flatMap(() => Rx.Observable.merge(
            action$.ofType(UPDATE_FILTER)
                .take(1)
                .filter(({update = {}}) => !!update.value)
                .map(updateFilterFunc(store)),
            action$.ofType(UPDATE_FILTER)
                .filter(({update = {}}) => update.type === 'geometry')
                .distinctUntilChanged(({update: update1}, {update: update2}) => {
                    return !update1.enabled && update2.enabled && !update1.value && !update2.value ||
                        update1.value === update2.value;
                })
                .skip(1)
                .map(updateFilterFunc(store))
        ).takeUntil(action$.ofType(CLOSE_FEATURE_GRID))),
    /**
     * Performs the query when the text filters are updated
     * @memberof epics.featuregrid
     */
    featureGridUpdateTextFilters: (action$, store) => action$.ofType(QUERY_CREATE).switchMap(() =>
        action$.ofType(UPDATE_FILTER)
            .filter(({update = {}}) => update.type !== 'geometry')
            .map(updateFilterFunc(store))
    ),
    handleClickOnMap: (action$, store) =>
        action$.ofType(UPDATE_FILTER)
            .filter(({update = {}}) => update.type === 'geometry' && update.enabled)
            .switchMap(() =>
                action$.ofType(CLICK_ON_MAP).switchMap(({point: {latlng, pixel}}) => {
                    const currentFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry') || {};

                    const projection = projectionSelector(store.getState());
                    const center = CoordinatesUtils.reproject([latlng.lng, latlng.lat], 'EPSG:4326', projection);
                    const hook = MapUtils.getHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
                    const radius = CoordinatesUtils.calculateCircleRadiusFromPixel(hook, pixel, center, 4);

                    return currentFilter.deactivated ? Rx.Observable.empty() : Rx.Observable.of(updateFilter({
                        ...currentFilter,
                        value: {
                            attribute: currentFilter.attribute || get(spatialFieldSelector(store.getState()), 'attribute'),
                            geometry: {
                                center: [center.x, center.y],
                                coordinates: CoordinatesUtils.calculateCircleCoordinates(center, radius, 12),
                                extent: [center.x - radius, center.y - radius, center.x + radius, center.y + radius],
                                projection,
                                radius,
                                type: "Polygon"
                            },
                            method: "Circle",
                            operation: "INTERSECTS"
                        }
                    }));
                })
                    .takeUntil(Rx.Observable.merge(
                        action$.ofType(UPDATE_FILTER).filter(({update = {}}) => update.type === 'geometry' && !update.enabled),
                        action$.ofType(CLOSE_FEATURE_GRID, LOCATION_CHANGE)
                    ))),
    selectFeaturesOnMapClickResult: (action$, store) =>
        action$.ofType(QUERY_RESULT)
            .filter(({reason}) => reason === 'geometry')
            .map(({result}) => {
                const feature = get(result, 'features[0]');
                const geometryFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry');

                return selectFeatures(feature && geometryFilter && geometryFilter.value ? [feature] : []);
            }),
    activateTemporaryChangesEpic: (action$) =>
        action$.ofType(ACTIVATE_TEMPORARY_CHANGES)
            .flatMap(({activated}) => Rx.Observable.of(
                disableToolbar(activated),
                deactivateGeometryFilter(activated)
            )),
    handleGeometryFilterActivation: (action$, store) =>
        action$.ofType(START_DRAWING_FEATURE)
            .flatMap(() => {
                const geometryFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry') || {};
                const hasChanges = hasChangesSelector(store.getState());
                const hasNewFeatures = hasNewFeaturesSelector(store.getState());
                return Rx.Observable.of(updateFilter({
                    ...geometryFilter,
                    type: 'geometry',
                    attribute: geometryFilter.attribute || get(spatialFieldSelector(store.getState()), 'attribute'),
                    deactivated: !hasChanges && !hasNewFeatures ? !geometryFilter.deactivated : true
                }));
            }),
    deactivateGeometryFilter: (action$, store) =>
        Rx.Observable.merge(
            action$.ofType(CREATE_NEW_FEATURE, GEOMETRY_CHANGED, DELETE_GEOMETRY, FEATURES_MODIFIED),
            action$.ofType(DEACTIVATE_GEOMETRY_FILTER).filter(({deactivated}) => !!deactivated)
        )
            .flatMap(() => {
                const geometryFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry') || {};
                return !geometryFilter.deactivated ?
                    Rx.Observable.of(updateFilter({
                        ...geometryFilter,
                        type: 'geometry',
                        attribute: geometryFilter.attribute || get(spatialFieldSelector(store.getState()), 'attribute'),
                        deactivated: true
                    })) :
                    Rx.Observable.empty();
            }),
    activateGeometryFilter: (action$, store) =>
        Rx.Observable.merge(
            action$.ofType(SAVE_SUCCESS, CLEAR_CHANGES),
            action$.ofType(DEACTIVATE_GEOMETRY_FILTER).filter(({deactivated}) => !deactivated)
        )
            .flatMap(() => {
                const geometryFilter = find(getAttributeFilters(store.getState()), f => f.type === 'geometry') || {};
                const hasChanges = hasChangesSelector(store.getState());
                const hasNewFeatures = hasNewFeaturesSelector(store.getState());
                return geometryFilter.deactivated && !hasChanges && !hasNewFeatures ?
                    Rx.Observable.of(updateFilter({
                        ...geometryFilter,
                        type: 'geometry',
                        attribute: geometryFilter.attribute || get(spatialFieldSelector(store.getState()), 'attribute'),
                        deactivated: false
                    })) :
                    Rx.Observable.empty();
            }),
    /**
     * perform paginated query on page change
     * @memberof epics.featuregrid
     */
    featureGridChangePage: (action$, store) =>
        action$.ofType(CHANGE_PAGE)
            .merge(action$.ofType(UPDATE_QUERY).debounceTime(500).map(action => ({...action, page: 0})))
            .switchMap((a) => createLoadPageFlow(store)(a)
                .merge(action$.ofType(QUERY_RESULT)
                    .map((ra) => fatureGridQueryResult(get(ra, "result.features", []), [get(ra, "filterObj.pagination.startIndex")]))
                    .take(1)
                    .takeUntil(action$.ofType(QUERY_ERROR))
                )
            ),
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
                    getPagination(store.getState(), {page: page, size})
                    ),
                    queryOptionsSelector(store.getState())
                ),
                refreshLayerVersion(selectedLayerIdSelector(store.getState()))
            )
                .merge(action$.ofType(QUERY_RESULT)
                    .map((ra) => Rx.Observable.of(clearChanges(), fatureGridQueryResult(get(ra, "result.features", []), [get(ra, "filterObj.pagination.startIndex")]))
                    )
                    .mergeAll()
                    .takeUntil(action$.ofType(QUERY_ERROR))
                    .take(2)
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
    closeRightPanelOnFeatureGridOpen: (action$, store) =>
        action$.ofType(OPEN_FEATURE_GRID)
            .switchMap( () => {
                let actions = [
                    setControlProperty('metadataexplorer', 'enabled', false),
                    setControlProperty('annotations', 'enabled', false),
                    setControlProperty('details', 'enabled', false)
                ];
                if (showCoordinateEditorSelector(store.getState())) {
                    actions.push(setControlProperty('measure', 'enabled', false));
                }
                return Rx.Observable.from(actions);
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
                : Rx.Observable.empty();
        }
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
    /**
     * Removes the WMSFilter from the layer when the feature grid is closed.
     *
     */
    removeWmsFilterOnGridClose: (action$, store) =>
        action$.ofType(OPEN_FEATURE_GRID)
            // always finish internal flow before listening another OPEN_EVENT
            .exhaustMap( () =>
                // when close is performed.A delay is needed to avoid close event
                // to start the flow before OPEN_ADVANCED_SEARCH
                action$.ofType(CLOSE_FEATURE_GRID).delay(50)
                    // and WMS filter is active
                    .filter(() => isSyncWmsActive(store.getState()))
                    // remove the WMS Filter
                    .switchMap(() => Rx.Observable.of(removeFilterFromWMSLayer(store.getState())))
                    // but stop listening for close event if feature info, open search or location
                    // change are performed before it
                    .takeUntil(action$.ofType(LOCATION_CHANGE, FEATURE_INFO_CLICK, OPEN_ADVANCED_SEARCH))
            ),
    /**
     * re-opens the feature grid after it was closed by feature info click
     */
    autoReopenFeatureGridOnFeatureInfoClose: (action$) =>
        action$.ofType(OPEN_FEATURE_GRID)
            // need to finalize the flow before listen the next open event to avoid
            // to catch open feature info triggered by this flow or advanced search
            .switchMap(() =>
                Rx.Observable.race(
                    action$.ofType(FEATURE_INFO_CLICK).take(1),
                    action$.ofType(CLOSE_FEATURE_GRID).take(1)
                ).exhaustMap((action) => action.type === CLOSE_FEATURE_GRID
                    // a close event stops the flow living it free to listen the next event
                    ? Rx.Observable.empty()
                    : action$
                        // if feature info was clicked, wait for a feature info close to reopen the feature grid
                        .ofType(HIDE_MAPINFO_MARKER)
                        .switchMap(() => Rx.Observable.of(openFeatureGrid()))

                ).takeUntil(
                    action$.ofType(LOCATION_CHANGE, TOGGLE_CONTROL)
                        .filter(action => action.type === LOCATION_CHANGE || action.control && action.control === 'drawer')
                        .merge(
                            action$
                            // a close feature grid event not between feature info click and hide mapinfo marker
                                .ofType(CLOSE_FEATURE_GRID)
                                .withLatestFrom(
                                    action$
                                        .ofType(FEATURE_INFO_CLICK, HIDE_MAPINFO_MARKER)
                                        .scan((acc, { type }) => {
                                            switch (type) {
                                            case FEATURE_INFO_CLICK:
                                                return false;
                                            case HIDE_MAPINFO_MARKER:
                                                return true;
                                            default:
                                                return false;
                                            }
                                        }, true)
                                        .startWith(true),
                                    (a, b) => b
                                ).filter(e => e)

                        )
                )
            ),
    onOpenAdvancedSearch: (action$, store) =>
        action$.ofType(OPEN_ADVANCED_SEARCH).switchMap(() => {
            return Rx.Observable.of(
                loadFilter(get(store.getState(), `featuregrid.advancedFilters["${selectedLayerIdSelector(store.getState())}"]`)),
                closeFeatureGrid(),
                setControlProperty('queryPanel', "enabled", true)
            )
                .merge(
                    Rx.Observable.race(
                        action$.ofType(QUERY_FORM_SEARCH).mergeMap((action) => {
                        // merge advanced filter with columns filters
                            return Rx.Observable.of(
                                createQuery(action.searchUrl, action.filterObj),
                                storeAdvancedSearchFilter(assign({}, queryFormUiStateSelector(store.getState()), action.filterObj)),
                                setControlProperty('queryPanel', "enabled", false),
                                openFeatureGrid()
                            );
                        }),
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
        action$.ofType(ZOOM_ALL).filter(() => !get(store.getState(), "featuregird.virtualScroll", false)).switchMap(() =>
            Rx.Observable.of(zoomToExtent(bbox(featureCollectionResultSelector(store.getState())), "EPSG:4326"))

        ),
    /**
     * reset controls on edit mode switch
     */
    resetControlsOnEnterInEditMode: (action$) =>
        action$.ofType(TOGGLE_MODE)
            .filter(a => a.mode === MODES.EDIT).map(() => resetControls(["query"])),
    closeIdentifyWhenOpenFeatureGrid: (action$) =>
        action$.ofType(OPEN_FEATURE_GRID)
            .switchMap(() => {
                return Rx.Observable.of(closeIdentify());
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
            .mapTo(startSyncWMS()),
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
                        return Rx.Observable.of(addFilterToWMSLayer(layerId, filter));
                    });
            }),
    virtualScrollLoadFeatures: (action$, {getState}) =>
        action$.ofType(LOAD_MORE_FEATURES)
            .filter(() => !featureLoadingSelector(getState()))
            .switchMap( ac => {
                const state = getState();
                const {startPage, endPage} = ac.pages;
                const {pages: oldPages, pagination} = state.featuregrid;
                const size = get(pagination, "size");
                const nPs = getPagesToLoad(startPage, endPage, oldPages, size);
                const needPages = (nPs[1] - nPs[0] + 1 );
                return Rx.Observable.of( query(wfsURL(state),
                    addPagination({
                        ...(wfsFilter(state))
                    },
                    {startIndex: nPs[0] * size, maxFeatures: needPages * size }
                    ),
                    queryOptionsSelector(state)
                )).filter(() => nPs.length > 0)
                    .merge( action$.ofType(QUERY_RESULT)
                        .filter(() => nPs.length > 0)
                        .map(({result = {}, filterObj} = {}) => {
                            const {features: oldFeatures, maxStoredPages} = (getState()).featuregrid;
                            const startIndex = get(filterObj, "pagination.startIndex");
                            const { pages, features } = updatePages(
                                result,
                                { endPage, startPage },
                                { pages: oldPages, features: oldFeatures || [] },
                                { size, startIndex, maxStoredPages});
                            return fatureGridQueryResult(features, pages);
                        }).take(1).takeUntil(action$.ofType(QUERY_ERROR))
                    ).merge(
                        action$.ofType(FEATURE_LOADING).filter(() => nPs.length > 0)
                        // When loading we store the load more features request, on loading end we emit the last
                            .filter(a => !a.isLoading)
                            .withLatestFrom(action$.ofType(LOAD_MORE_FEATURES))
                            .map((p) => p[1])
                            .take(1)
                            .takeUntil(action$.ofType(QUERY_ERROR))
                    );
            }),
    /**
     * Implements synchronization with time dimension for the feature grid.
     * Performs again createQuery when time changes or if timeSync is toggled
     */
    replayOnTimeDimensionChange: (action$, { getState = () => { } } = {}) =>
        action$
            // when time is updated...
            .ofType(CHANGE_LAYER_PARAMS) // UPDATE_LAYERS_DIMENSION triggers, CHANGE_LAYER_PARAMS, that is the effective event
            .filter(({layer = [], params = {}}) =>
                // if the parameter change is for the time of the feature grid selected layer...
                includes(castArray(layer), selectedLayerIdSelector(getState()))
                && includes(Object.keys(params), "time")
                && timeSyncActive(getState()) // ... and the sync is active ...
            )
            // or when time sync is enabled/disabled
            .merge(
                action$.ofType(SET_TIME_SYNC) // note: this triggers reload on toggle time sync on/off

            ).filter(() =>
                isFeatureGridOpen(getState()) // ... if the feature grid is open ...
            )
            // ...then take the last query action performed, ...
            .withLatestFrom(
                action$.ofType(QUERY),
                (_, a) => a
            )
            // ... and emit createQuery with same parameters
            .switchMap(action =>
                Rx.Observable.of(
                    createQuery(action.searchUrl, action.filterObj)
                )
            ),
    hideFeatureGridOnDrawerOpenMobile: (action$, { getState } = {}) =>
        action$
            .ofType(TOGGLE_CONTROL)
            .filter(({ control } = {}) =>
                control === 'drawer'
                && getState().browser
                && getState().browser.mobile
                && drawerEnabledControlSelector(getState())
            )
            .switchMap(() => Rx.Observable.of(hideMapinfoMarker(), openFeatureGrid())),
    hideDrawerOnFeatureGridOpenMobile: (action$, { getState } = {}) =>
        action$
            .ofType(FEATURE_INFO_CLICK)
            .filter(() =>
                getState().browser
                && getState().browser.mobile
                && drawerEnabledControlSelector(getState())
            )
            .mapTo(toggleControl('drawer', 'enabled'))
};
