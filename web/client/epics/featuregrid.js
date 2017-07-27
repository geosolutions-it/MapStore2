/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const {get, head, isEmpty} = require('lodash');
const axios = require('../libs/ajax');
const {fidFilter} = require('../utils/ogc/Filter/filter');
const {getDefaultFeatureProjection} = require('../utils/FeatureGridUtils');
const {isSimpleGeomType} = require('../utils/MapUtils');
const assign = require('object-assign');
const {changeDrawingStatus, GEOMETRY_CHANGED} = require('../actions/draw');
const requestBuilder = require('../utils/ogc/WFST/RequestBuilder');
const {findGeometryProperty} = require('../utils/ogc/WFS/base');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {query, QUERY_CREATE, QUERY_RESULT, LAYER_SELECTED_FOR_SEARCH, FEATURE_CLOSE, closeResponse} = require('../actions/wfsquery');
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');
const {SORT_BY, CHANGE_PAGE, SAVE_CHANGES, SAVE_SUCCESS, DELETE_SELECTED_FEATURES, featureSaving,
    saveSuccess, saveError, clearChanges, setLayer, clearSelection, toggleViewMode, toggleTool,
    CLEAR_CHANGES, START_EDITING_FEATURE, TOGGLE_MODE, MODES, geometryChanged, DELETE_GEOMETRY, deleteGeometryFeature,
    SELECT_FEATURES, DESELECT_FEATURES, START_DRAWING_FEATURE, CREATE_NEW_FEATURE, CLOSE_GRID, closeFeatureGrid, CLEAR_AND_CLOSE, CLOSE_DIALOG_AND_DRAWER} = require('../actions/featuregrid');

const {TOGGLE_CONTROL} = require('../actions/controls');
const {refreshLayerVersion} = require('../actions/layers');
const {selectedFeaturesSelector, changesMapSelector, newFeaturesSelector, hasChangesSelector, hasNewFeaturesSelector, selectedFeatureSelector, selectedFeaturesCount, selectedLayerIdSelector, isDrawingSelector, modeSelector} = require('../selectors/featuregrid');
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
    featureLayerSelectionInitialization: (action$) =>
        action$.ofType(LAYER_SELECTED_FOR_SEARCH)
            .switchMap( a => Rx.Observable.of(setLayer(a.id))),
    featureGridSelectionClearOnClose: (action$) => action$.ofType(FEATURE_CLOSE).switchMap(() => Rx.Observable.of(clearSelection(), toggleTool("featureCloseConfirm", false), toggleViewMode())),
    featureGridStartupQuery: (action$, store) =>
        action$.ofType(QUERY_CREATE)
            .switchMap(action => Rx.Observable.of(
                toggleControl("featuregrid", "open", true),
                query(action.searchUrl,
                    addPagination(action.filterObj, getPagination(store.getState())
                ))
            )),
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
    saveChangedGeometries: (action$, store) => action$.ofType(GEOMETRY_CHANGED)
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
    deleteGeometryFeature: (action$, store) => action$.ofType(DELETE_GEOMETRY)
        .switchMap( () => {
            const state = store.getState();
            return Rx.Observable.from([
                deleteGeometryFeature(selectedFeaturesSelector(state)),
                drawSupportReset()
            ]);
        }),
    triggerDrawSupportOnSelectionChange: (action$, store) => action$.ofType(SELECT_FEATURES, DESELECT_FEATURES, CLEAR_CHANGES, TOGGLE_MODE)
        .filter(() => modeSelector(store.getState()) === MODES.EDIT)
        .switchMap( (a) => {
            const state = store.getState();
            let useOriginal = a.type === CLEAR_CHANGES;
            return setupDrawSupport(state, useOriginal);
        }),
    stopDrawSupport: (action$) => action$.ofType(TOGGLE_MODE, CREATE_NEW_FEATURE)
        .filter(a => a.type === TOGGLE_MODE ? a.mode === MODES.VIEW : true )
        .switchMap( () => {
            return Rx.Observable.of(drawSupportReset());
        }),
    /**
     * Closes the feature grid when the drawer menu button has been toggled
     * @memberof epics.featuregrid
     * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
     * @return {external:Observable}
     */
    autoCloseFeatureGridEpicOnDrowerOpen: action$ =>
        action$.ofType(TOGGLE_CONTROL)
        .switchMap(action => action.control && action.control === 'drawer' ? Rx.Observable.of(closeFeatureGrid()) : Rx.Observable.empty()),
    askChangesConfirmOnFeatureGridClose: (action$, store) => action$.ofType(CLOSE_GRID).switchMap( () => {
        const state = store.getState();
        if (hasChangesSelector(state) || hasNewFeaturesSelector(state)) {
            return Rx.Observable.of(toggleTool("featureCloseConfirm", true));
        }
        return Rx.Observable.of(closeResponse());
    }),
    clearAndClose: (action$) => action$.ofType(CLEAR_AND_CLOSE, FEATURE_CLOSE)
        .switchMap( () => Rx.Observable.of(clearChanges(), toggleTool("clearConfirm", false))),
    closeDialogAndDrawer: (action$) => action$.ofType(CLOSE_DIALOG_AND_DRAWER)
        .switchMap( () => {
            return Rx.Observable.of(setControlProperty("drawer", "enabled", false), toggleTool("featureCloseConfirm", false));
        })
};
