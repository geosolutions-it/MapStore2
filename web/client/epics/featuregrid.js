/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {get, head, isEmpty} = require('lodash');
const { LOCATION_CHANGE } = require('react-router-redux');
const axios = require('../libs/ajax');
const {fidFilter} = require('../utils/ogc/Filter/filter');
const {getDefaultFeatureProjection} = require('../utils/FeatureGridUtils');
const {isSimpleGeomType} = require('../utils/MapUtils');
const assign = require('object-assign');
const {changeDrawingStatus, GEOMETRY_CHANGED} = require('../actions/draw');
const requestBuilder = require('../utils/ogc/WFST/RequestBuilder');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {setControlProperty} = require('../actions/controls');
const {query, QUERY_CREATE, QUERY_RESULT, LAYER_SELECTED_FOR_SEARCH, closeResponse} = require('../actions/wfsquery');
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');
const {SORT_BY, CHANGE_PAGE, SAVE_CHANGES, SAVE_SUCCESS, DELETE_SELECTED_FEATURES, featureSaving, changePage,
    saveSuccess, saveError, clearChanges, setLayer, clearSelection, toggleViewMode, toggleTool,
    CLEAR_CHANGES, START_EDITING_FEATURE, TOGGLE_MODE, MODES, geometryChanged, DELETE_GEOMETRY, deleteGeometryFeature,
    SELECT_FEATURES, DESELECT_FEATURES, START_DRAWING_FEATURE, CREATE_NEW_FEATURE, CLOSE_GRID, closeFeatureGrid,
    CLEAR_CHANGES_CONFIRMED, FEATURE_GRID_CLOSE_CONFIRMED} = require('../actions/featuregrid');

const {TOGGLE_CONTROL} = require('../actions/controls');
const {setHighlightFeaturesPath} = require('../actions/highlight');
const {refreshLayerVersion} = require('../actions/layers');
const {selectedFeaturesSelector, changesMapSelector, newFeaturesSelector, hasChangesSelector, hasNewFeaturesSelector,
    selectedFeatureSelector, selectedFeaturesCount, selectedLayerIdSelector, isDrawingSelector, modeSelector,
    isFeatureGridOpen} = require('../selectors/featuregrid');

const {error} = require('../actions/notifications');
const {describeSelector, getFeatureById, wfsURL, wfsFilter} = require('../selectors/query');
const drawSupportReset = () => changeDrawingStatus("clean", "", "featureGrid", [], {});
/**
 * Intercept OGC Exception (200 response with exceptionReport) to throw error in the stream
 * @param  {observable} observable The observable that emits the server response
 * @return {observable}            The observable that returns the response or throws the error.
 */
const interceptOGCError = (observable) => observable.switchMap(response => {
    if (typeof response.data === "string") {
        if (response.data.indexOf("ExceptionReport") > 0) {
            return Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                 tagNameProcessors: [stripPrefix],
                 explicitArray: false,
                 mergeAttrs: true
            }, callback))(response.data).map(data => {
                throw get(data, "ExceptionReport.Exception.ExceptionText") || "Undefined OGC Service Error";
            });

        }
    }
    return Rx.Observable.of(response);
});

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

module.exports = {
    /**
     * Intercepts layer selection to set it's id in the status and retrieve it later
     */
    featureGridLayerSelectionInitialization: (action$) =>
        action$.ofType(LAYER_SELECTED_FOR_SEARCH)
            .switchMap( a => Rx.Observable.of(setLayer(a.id))),
    /**
     * Intercepts query creation to perform the real query, setting page to 0
     */
    featureGridStartupQuery: (action$) =>
        action$.ofType(QUERY_CREATE)
            .switchMap(() => Rx.Observable.of(
                changePage(0),
                toggleViewMode()
            )),
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
        action$.ofType(CHANGE_PAGE).switchMap( ({page, size} = {}) =>
            Rx.Observable.of( query(
                    wfsURL(store.getState()),
                    addPagination({
                            ...wfsFilter(store.getState())
                        },
                        getPagination(store.getState(), {page, size})
                    )
            ))
        ),
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
                        message: e,
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
                        message: e,
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
        action$.ofType(LOCATION_CHANGE).switchMap( () =>Rx.Observable.of(
            closeResponse()
        )),
    /**
     * Closes the feature grid when the drawer menu button has been toggled
     */
    autoCloseFeatureGridEpicOnDrowerOpen: (action$, store) => action$.ofType(TOGGLE_CONTROL)
        .filter(action => action.control && action.control === 'drawer' && isFeatureGridOpen(store.getState()))
        .switchMap(() => Rx.Observable.of(closeFeatureGrid())),
    askChangesConfirmOnFeatureGridClose: (action$, store) => action$.ofType(CLOSE_GRID).switchMap( () => {
        const state = store.getState();
        if (hasChangesSelector(state) || hasNewFeaturesSelector(state)) {
            return Rx.Observable.of(toggleTool("featureCloseConfirm", true));
        }
        return Rx.Observable.of(closeResponse());
    }),
    onClearChangeConfirmedFeatureGrid: (action$) => action$.ofType(CLEAR_CHANGES_CONFIRMED)
        .switchMap( () => Rx.Observable.of(clearChanges(), toggleTool("clearConfirm", false))),
    onCloseFeatureGridConfirmed: (action$) => action$.ofType(FEATURE_GRID_CLOSE_CONFIRMED)
        .switchMap( () => {
            return Rx.Observable.of(setControlProperty("drawer", "enabled", false), toggleTool("featureCloseConfirm", false));
        })
};
