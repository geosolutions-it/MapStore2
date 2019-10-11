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
const { LOCATION_CHANGE} = require('connected-react-router');

const {TOGGLE_CONTROL, setControlProperty} = require('../actions/controls');
const {QUERY_FORM_SEARCH, loadFilter, reset, search} = require('../actions/queryform');
const {changeLayerProperties} = require('../actions/layers');


const {OPEN_QUERY_BUILDER, initLayerFilter, DISCARD_CURRENT_FILTER, APPLY_FILTER, storeAppliedFilter} = require('../actions/layerFilter');
const {featureTypeSelected, toggleLayerFilter, initQueryPanel} = require("../actions/wfsquery");
const {getSelectedLayer} = require("../selectors/layers");

const {changeDrawingStatus} = require('../actions/draw');
const FilterUtils = require('../utils/FilterUtils');

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


module.exports = {
/**
 * It manages the initialization of the query builder used to build the layerFilter
 * and the update of layerFilter in layer state
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `OPEN_QUERY_BUILDER` and `QUERY_FORM_SEARCH`
 * @return {external:Observable} `FEATURE_TYPE_SELECTED` `QUERYFORM:LOAD_FILTER` `LAYER_FILTER:INIT_LAYER_FILTER` `SET_CONTROL_PROPERTY` (open queryPanel)
 * and on `QUERY_FORM_SEARCH` `CHANGE_LAYERPROPERTIS` adding layerFilter to selected layer
 * terminate on `LOCATION_CHANGE` `TOGGLE_CONTROL` with queryPanel enabled === false
 */
    handleLayerFilterPanel: (action$, {getState}) =>
        action$.ofType(OPEN_QUERY_BUILDER).switchMap(() => {
            const layer = getSelectedLayer(getState());
            const {url, name, layerFilter} = layer || {};
            const searchUrl = layer && layer.search && layer.search.url;
            return Rx.Observable.of(
                featureTypeSelected(searchUrl || url, name),
                // Load the filter from the layer if it exist
                loadFilter(layerFilter),
                initLayerFilter(layerFilter),
                setControlProperty('queryPanel', "enabled", true)
            )
                .merge(
                    Rx.Observable.of(toggleLayerFilter()).filter(() => !get(getState(), "query.isLayerFilter")),
                    action$.ofType(QUERY_FORM_SEARCH)
                        .switchMap( ({filterObj}) => {
                            let newFilter = isNotEmptyFilter(filterObj) ? {...get(getState(), "queryform", {})} : undefined;
                            if (newFilter) {
                                newFilter.filterFields = newFilter.attributePanelExpanded && newFilter.filterFields || [];
                                newFilter.spatialField = newFilter.spatialPanelExpanded && newFilter.spatialField || null;
                                newFilter.crossLayerFilter = newFilter.crossLayerExpanded && FilterUtils.setupCrossLayerFilterDefaults(newFilter.crossLayerFilter) || null;
                            }
                            return Rx.Observable.of(addFilterToLayer(layer.id, newFilter));
                        })
                ).let(endLayerFilterEpic(action$)).concat(Rx.Observable.from([toggleLayerFilter(), reset(), changeDrawingStatus("clean", "", "queryform", [], {})]))
            ;
        }),
    /**
 * It throws the correct actions to discard the current applied filter and reload the last saved if present
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `DISCARD_CURRENT_FILTER`
 * @return {external:Observable} `QUERYFORM:LOAD_FILTER` `QUERY_FORM_SEARCH` `INIT_QUERY_PANEL`
 */
    restoreSavedFilter: (action$, {getState}) =>
        action$.ofType(DISCARD_CURRENT_FILTER)
            .switchMap(() => {
                const params = {typeName: get(getState(), "state.query.typeName")};
                const searchUrl = get(getState(), "state.query.url");
                const filter = get(getState(), "layerFilter.persisted");
                return Rx.Observable.of(changeDrawingStatus('clean', '', "queryform", []),
                    loadFilter(filter),
                    search(searchUrl, filter, params),
                    initQueryPanel());

            }),
    /**
 * It Persists the current applied filter
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `APPLY_FILTER`
 * @return {external:Observable} `APPLIED_FILTER`
 */
    onApplyFilter: (action$, {getState}) =>
        action$.ofType(APPLY_FILTER)
            .map(() => {
                const newFilter = {...get(getState(), "queryform", {})};
                return storeAppliedFilter(newFilter);

            })
};
