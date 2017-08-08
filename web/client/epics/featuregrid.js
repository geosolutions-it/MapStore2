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
const axios = require('../libs/ajax');
const bbox = require('@turf/bbox');
const {fidFilter} = require('../utils/ogc/Filter/filter');
const {getDefaultFeatureProjection} = require('../utils/FeatureGridUtils');
const {isSimpleGeomType} = require('../utils/MapUtils');
const assign = require('object-assign');
const {changeDrawingStatus, GEOMETRY_CHANGED} = require('../actions/draw');
const requestBuilder = require('../utils/ogc/WFST/RequestBuilder');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {setControlProperty} = require('../actions/controls');
const {query, QUERY_CREATE, QUERY_RESULT, LAYER_SELECTED_FOR_SEARCH, FEATURE_TYPE_LOADED, featureTypeSelected, createQuery} = require('../actions/wfsquery');
const {reset, QUERY_FORM_RESET} = require('../actions/queryform');
const {zoomToExtent} = require('../actions/map');
const {BROWSE_DATA} = require('../actions/layers');

const {SORT_BY, CHANGE_PAGE, SAVE_CHANGES, SAVE_SUCCESS, DELETE_SELECTED_FEATURES, featureSaving, changePage,
    saveSuccess, saveError, clearChanges, setLayer, clearSelection, toggleViewMode, toggleTool,
    CLEAR_CHANGES, START_EDITING_FEATURE, TOGGLE_MODE, MODES, geometryChanged, DELETE_GEOMETRY, deleteGeometryFeature,
    SELECT_FEATURES, DESELECT_FEATURES, START_DRAWING_FEATURE, CREATE_NEW_FEATURE,
    CLEAR_CHANGES_CONFIRMED, FEATURE_GRID_CLOSE_CONFIRMED,
    openFeatureGrid, closeFeatureGrid, OPEN_FEATURE_GRID, CLOSE_FEATURE_GRID, CLOSE_FEATURE_GRID_CONFIRM, OPEN_ADVANCED_SEARCH, ZOOM_ALL} = require('../actions/featuregrid');

const {TOGGLE_CONTROL, resetControls} = require('../actions/controls');
const {setHighlightFeaturesPath} = require('../actions/highlight');
const {refreshLayerVersion} = require('../actions/layers');
const {selectedFeaturesSelector, changesMapSelector, newFeaturesSelector, hasChangesSelector, hasNewFeaturesSelector,
    selectedFeatureSelector, selectedFeaturesCount, selectedLayerIdSelector, isDrawingSelector, modeSelector,
    isFeatureGridOpen} = require('../selectors/featuregrid');

const {error} = require('../actions/notifications');
const {describeSelector, isDescribeLoaded, getFeatureById, wfsURL, wfsFilter, featureCollectionResultSelector} = require('../selectors/query');
const drawSupportReset = () => changeDrawingStatus("clean", "", "featureGrid", [], {});
const {interceptOGCError} = require('../utils/ObservableUtils');
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
                    ...wfsFilter(state)
                },
                getPagination(state, {page, size})
            )
    ));
};

const createInitialQueryFlow = (action$, store, {url, name} = {}) => {
    const createInitialQuery = () => createQuery(url, {
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
module.exports = {
    featureGridBrowseData: (action$, store) =>
        action$.ofType(BROWSE_DATA).switchMap( ({layer}) =>
            Rx.Observable.of(
                setControlProperty('drawer', 'enabled', false),
                setLayer(layer.id),
                openFeatureGrid()
            ).merge(
                createInitialQueryFlow(action$, store, layer)
            ).merge(
                get(store.getState(), "query.typeName") !== name
                    ? Rx.Observable.of(reset())
                    : Rx.Observable.empty()

            )
        ),
    /**
     * Intercepts layer selection to set it's id in the status and retrieve it later
     */
    featureGridLayerSelectionInitialization: (action$) =>
        action$.ofType(LAYER_SELECTED_FOR_SEARCH)
            .switchMap( a => Rx.Observable.of(setLayer(a.id))),
    /**
     * Intercepts query creation to perform the real query, setting page to 0
     */
    featureGridStartupQuery: (action$, store) =>
        action$.ofType(QUERY_CREATE)
            .switchMap(() => Rx.Observable.of(changePage(0))
            .concat(modeSelector(store.getState()) === MODES.VIEW ? Rx.Observable.of(toggleViewMode()) : Rx.Observable.empty())),
    /**
     * Create sorted queries on sort action
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
     * perform paginated query on page change
     */
    featureGridChangePage: (action$, store) =>
        action$.ofType(CHANGE_PAGE).switchMap(createLoadPageFlow(store)),
    /**
     * Reload the page on save success.
     * NOTE: The page is in the action.
     * ( e.g. for delete the page may be reset to 0)
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
    /**
     * intercept geomertry changed events in draw support to update current
     * modified geometry in featuregrid
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
     */
    triggerDrawSupportOnSelectionChange: (action$, store) => action$.ofType(SELECT_FEATURES, DESELECT_FEATURES, CLEAR_CHANGES, TOGGLE_MODE)
        .filter(() => modeSelector(store.getState()) === MODES.EDIT)
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
     */
    setHighlightFeaturesPath: (action$) => action$.ofType(TOGGLE_MODE)
        .switchMap( (a) => {
            if (a.mode === MODES.VIEW) {
                return Rx.Observable.of(drawSupportReset(), setHighlightFeaturesPath("featuregrid.select"));
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
    /**
     * Closes the feature grid when the drawer menu button has been toggled
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
    onOpenAdvancedSearch: (action$, store) =>
        action$.ofType(OPEN_ADVANCED_SEARCH).switchMap(() =>
            Rx.Observable.of(
                setControlProperty('queryPanel', "enabled", true),
                closeFeatureGrid()
            ).merge(
                action$.ofType(QUERY_FORM_RESET) // ON RESET YOU HAVE TO PERFORM A SEARCH AGAIN WHEN BACK
                    .switchMap(() => action$.ofType(TOGGLE_CONTROL)
                    .filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled"))
                    .switchMap( () => createInitialQueryFlow(action$, store, {
                        url: get(store.getState(), "query.url"),
                        name: get(store.getState(), "query.typeName")
                    }))))
            .merge(
                Rx.Observable.race(
                    action$.ofType(QUERY_CREATE).mergeMap(() =>
                        Rx.Observable.of(
                            setControlProperty('queryPanel', "enabled", false),
                            openFeatureGrid()
                        )
                    ),
                    action$.ofType(TOGGLE_CONTROL)
                        .filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled"))
                        .mergeMap(() =>
                            Rx.Observable.of(
                                openFeatureGrid()
                            )
                    )
                ).takeUntil(action$.ofType(OPEN_FEATURE_GRID, LOCATION_CHANGE))
            )
        ),
    onFeatureGridZoomAll: (action$, store) =>
        action$.ofType(ZOOM_ALL).switchMap(() =>
            Rx.Observable.of(zoomToExtent(bbox(featureCollectionResultSelector(store.getState())), "EPSG:4326"))
    ),
    /**
     * reset controls on edit mode switch
     */
    resetControlsOnEnterInEditMode: (action$) =>
        action$.ofType(TOGGLE_MODE)
        .filter(a => a.mode === MODES.EDIT).map(() => resetControls(["query"]))
};
