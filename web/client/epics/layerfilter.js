/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


// eslint-disable-next-line no-unused-vars
const Rx = require('rxjs');

const {get, head} = require("lodash");
const { LOCATION_CHANGE} = require('react-router-redux');

const {TOGGLE_CONTROL, setControlProperty} = require('../actions/controls');
const {QUERY_FORM_SEARCH, loadFilter, reset, search} = require('../actions/queryform');
const {changeLayerProperties} = require('../actions/layers');


const { warning} = require('../actions/notifications');
const {OPEN_QUERY_BUILDER, initFilterPersistence, DISCARD_CURRENT_FILTER, APPLY_FILTER, storeAppliedFilter} = require('../actions/filterPersistence');
const {featureTypeSelected, toggleLayerFilter, initQueryPanel} = require("../actions/wfsquery");
const {getSelectedLayer} = require("../selectors/layers");

const {changeDrawingStatus} = require('../actions/draw');
const FilterUtils = require('../utils/FilterUtils');
const {getNativeCrs} = require('../observables/wms');

const isNotEmptyFilter = ({crossLayerFilter, spatialField, filterFields} = {}) => {
    return !!(filterFields && head(filterFields)
    || spatialField && spatialField.method && spatialField.operation && spatialField.geometry
    || crossLayerFilter && crossLayerFilter.collectGeometries && crossLayerFilter.operation);
};

const endLayerFilterEpic = (action$) => ob$ => ob$.takeUntil(action$.ofType(TOGGLE_CONTROL).
            filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled"))
            .merge(action$.ofType(LOCATION_CHANGE)));

// Create action to add filter to wms layer
const addFilterToLayer = (layer, filter) => {
    return changeLayerProperties(layer, {layerFilter: filter});
};
// Create action to add nativeCrs to wms layer
const addNativeCrsLayer = (layer, nativeCrs = "") => {
    return changeLayerProperties(layer, {nativeCrs});
};


module.exports = {
/**
 * It manages the initialization of the query builder used to build layer filter object
 * and the update of layerFilter in layer state
 */
    handleLayerFilterPanel: (action$, {getState}) =>
        action$.ofType(OPEN_QUERY_BUILDER).switchMap(() => {
            const layer = getSelectedLayer(getState());
            const {url, name, layerFilter} = layer || {};
            return Rx.Observable.of(
                featureTypeSelected(url, name),
                // Load the filter from the layer if it exist
                loadFilter(layerFilter),
                initFilterPersistence(layerFilter),
                setControlProperty('queryPanel', "enabled", true)
            )
            .merge(
                getNativeCrs(layer)
                .map((nativeCrs) => addNativeCrsLayer(layer.id, nativeCrs))
                .catch(() => {
                    return Rx.Observable.of(
                        warning({
                            title: "notification.warning",
                            message: "featuregrid.errorProjFetch",
                            position: "tc",
                            autoDismiss: 5
                        }));
                }),
                Rx.Observable.of(toggleLayerFilter()).filter(() => !get(getState(), "query.isLayerFilter")),
                action$.ofType(QUERY_FORM_SEARCH)
                    .switchMap( ({filterObj}) => {
                        let newFilter = isNotEmptyFilter(filterObj) ? {...get(getState(), "queryform", {})} : undefined;
                        if (newFilter) {
                            const {nativeCrs} = getSelectedLayer(getState());
                            newFilter = FilterUtils.normalizeFilterCQL(newFilter, nativeCrs);
                        }
                        return Rx.Observable.of(addFilterToLayer(layer.id, newFilter));
                    })
            ).let(endLayerFilterEpic(action$)).concat(Rx.Observable.from([toggleLayerFilter(), reset(), changeDrawingStatus("clean", "", "queryform", [], {})]))
            ;
        }),
    restoreSavedFilter: (action$, {getState}) =>
        action$.ofType(DISCARD_CURRENT_FILTER)
        .switchMap(() => {
            const params = {typeName: get(getState(), "state.query.typeName")};
            const searchUrl = get(getState(), "state.query.url");
            const filter = get(getState(), "filterPersistence.persisted");
            return Rx.Observable.of(changeDrawingStatus('clean', '', "queryform", []),
            loadFilter(filter),
            search(searchUrl, filter, params),
            initQueryPanel());

        }),
    onApplyFilter: (action$, {getState}) =>
        action$.ofType(APPLY_FILTER)
        .map(() => {
            const newFilter = {...get(getState(), "queryform", {})};
            return storeAppliedFilter(newFilter);

        })
};
