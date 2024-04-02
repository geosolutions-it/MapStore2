/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


// eslint-disable-next-line no-unused-vars
import Rx from 'rxjs';

import { get, head } from 'lodash';
import { LOCATION_CHANGE } from 'connected-react-router';
import { TOGGLE_CONTROL, setControlProperty } from '../actions/controls';
import { QUERY_FORM_SEARCH, loadFilter, reset, search } from '../actions/queryform';
import { changeLayerProperties } from '../actions/layers';

import {
    OPEN_QUERY_BUILDER,
    initLayerFilter,
    DISCARD_CURRENT_FILTER,
    APPLY_FILTER,
    storeAppliedFilter,
    LAYER_FILTER_BY_LEGEND,
    RESET_LAYER_FILTER_BY_LEGEND
} from '../actions/layerFilter';
import { featureTypeSelected, toggleLayerFilter, initQueryPanel } from '../actions/wfsquery';
import { getSelectedLayer } from '../selectors/layers';
import { changeDrawingStatus } from '../actions/draw';
import {setupCrossLayerFilterDefaults} from '../utils/FilterUtils';

const isNotEmptyFilter = ({crossLayerFilter, spatialField, filterFields, filters } = {}) => {
    return !!(filterFields && head(filterFields)
    || spatialField && spatialField.method && spatialField.operation && spatialField.geometry
    || crossLayerFilter && crossLayerFilter.collectGeometries && crossLayerFilter.operation)
    || filters && filters.length > 0;
};

const endLayerFilterEpic = (action$) => ob$ => ob$.takeUntil(action$.ofType(TOGGLE_CONTROL).
    filter(({control, property} = {}) => control === "queryPanel" && (!property || property === "enabled"))
    .merge(action$.ofType(LOCATION_CHANGE)));

// Create action to add filter to wms layer
const addFilterToLayer = (layer, filter) => {
    return changeLayerProperties(layer, {layerFilter: filter});
};


/**
 * It manages the initialization of the query builder used to build the layerFilter
 * and the update of layerFilter in layer state
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `OPEN_QUERY_BUILDER` and `QUERY_FORM_SEARCH`
 * @return {external:Observable} `FEATURE_TYPE_SELECTED` `QUERYFORM:LOAD_FILTER` `LAYER_FILTER:INIT_LAYER_FILTER` `SET_CONTROL_PROPERTY` (open queryPanel)
 * and on `QUERY_FORM_SEARCH` `CHANGE_LAYERPROPERTIS` adding layerFilter to selected layer
 * terminate on `LOCATION_CHANGE` `TOGGLE_CONTROL` with queryPanel enabled === false
 */
export const handleLayerFilterPanel = (action$, {getState}) =>
    action$.ofType(OPEN_QUERY_BUILDER).switchMap(() => {
        const layer = getSelectedLayer(getState());
        const {url, name, layerFilter, fields} = layer || {};
        const searchUrl = layer && layer.search && layer.search.url;
        return Rx.Observable.of(
            featureTypeSelected(searchUrl || url, name, fields),
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
                            newFilter.crossLayerFilter = newFilter.crossLayerExpanded && setupCrossLayerFilterDefaults(newFilter.crossLayerFilter) || null;
                        }
                        return Rx.Observable.of(addFilterToLayer(layer.id, newFilter));
                    })
            ).let(endLayerFilterEpic(action$)).concat(Rx.Observable.from([toggleLayerFilter(), reset(), changeDrawingStatus("clean", "", "queryform", [], {})]))
        ;
    });
/**
 * It throws the correct actions to discard the current applied filter and reload the last saved if present
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `DISCARD_CURRENT_FILTER`
 * @return {external:Observable} `QUERYFORM:LOAD_FILTER` `QUERY_FORM_SEARCH` `INIT_QUERY_PANEL`
 */
export const restoreSavedFilter = (action$, {getState}) =>
    action$.ofType(DISCARD_CURRENT_FILTER)
        .switchMap(() => {
            const params = {typeName: get(getState(), "state.query.typeName")};
            const searchUrl = get(getState(), "state.query.url");
            const filter = get(getState(), "layerFilter.persisted");
            return Rx.Observable.of(changeDrawingStatus('clean', '', "queryform", []),
                loadFilter(filter),
                search(searchUrl, filter, params),
                initQueryPanel());

        });
/**
 * It Persists the current applied filter
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `APPLY_FILTER`
 * @return {external:Observable} `APPLIED_FILTER`
 */
export const onApplyFilter = (action$, {getState}) =>
    action$.ofType(APPLY_FILTER)
        .map(() => {
            const newFilter = {...get(getState(), "queryform", {})};
            return storeAppliedFilter(newFilter);

        });

/**
 * It applies the legend filter for wms layer
 * @memberof epics.layerFilter
 * @param {external:Observable} action$ manages `LAYER_FILTER_BY_LEGEND`
 * @return {external:Observable} `APPLIED_FILTER`
 */
export const applyWMSCQLFilterBasedOnLegendFilter = (action$, {getState}) => {
    return  action$.ofType(LAYER_FILTER_BY_LEGEND)
        .switchMap((action) => {
            const state = getState();
            const layer = head(state.layers.flat.filter(l => l.id === action.layerId));
            const queryFormFilterObj = {...get(getState(), "queryform", {})};
            let filterObj = layer.layerFilter ? layer.layerFilter : queryFormFilterObj;
            let searchUrl = layer.search.url;
            // reset thte filter if legendCQLFilter is empty
            if (!action.legendCQLFilter) {
                // todo: clear legend filter
                const isLegendFilterExist = filterObj?.filters?.find(f => f.id === 'interactiveLegend');
                if (isLegendFilterExist) {
                    filterObj = {
                        ...filterObj, filters: filterObj?.filters?.filter(f => f.id !== 'interactiveLegend')
                    };
                }
                let newFilter = isNotEmptyFilter(filterObj) ? filterObj : undefined;
                return Rx.Observable.of(search(searchUrl, newFilter), addFilterToLayer(layer.id, newFilter), storeAppliedFilter(newFilter));
            }
            let cqlStatement = action.legendCQLFilter;
            if (cqlStatement) {
                // remove the unnecessaru brackets
                // "[LAND_KM >= '5062.5' AND LAND_KM < '20300.35']" ---> to be "LAND_KM >= '5062.5' AND LAND_KM < '20300.35'"
                cqlStatement = cqlStatement.includes("[") ? cqlStatement.slice(1, cqlStatement.length - 1) : cqlStatement;
            }
            let filter = {
                ...(filterObj || {}), filters: [
                    ...(filterObj?.filters?.filter(f => f.id !== 'interactiveLegend') || []), ...[
                        {
                            "id": "interactiveLegend",
                            "format": "logic",
                            "version": "1.0.0",
                            "logic": "AND",
                            "filters": [{
                                "format": "cql",
                                "version": "1.0.0",
                                "body": cqlStatement,
                                "id": `[${cqlStatement}]`
                            }]
                        }
                    ]
                ]
            };
            return Rx.Observable.of(search(searchUrl, filter), addFilterToLayer(layer.id, filter), storeAppliedFilter(filter));
        });
};

export const applyResetLegendFilter = (action$, {getState}) => {
    return  action$.ofType(RESET_LAYER_FILTER_BY_LEGEND)
        .switchMap((action) => {
            const state = getState();
            const layer = getSelectedLayer(state);
            // check if the chnaged param is style or not, if not cancel the epic
            // const isChangeStyleParam = Object.keys(action.newParams).length === 1 && action.newParams?.style;
            // check if the selected style is different than the current layer's one, if not cancel the epic
            const isNewStyleSelected = layer.style !== action?.newSelectedStyle;
            // check if the layer has interactive legend or not, if not cancel the epic
            const isLayerWithJSONLegend = layer?.enableInteractiveLegend;
            if (!isNewStyleSelected || !isLayerWithJSONLegend) return Rx.Observable.empty();
            const queryFormFilterObj = {...get(getState(), "queryform", {})};
            let filterObj = layer.layerFilter ? layer.layerFilter : queryFormFilterObj;
            let searchUrl = layer.search.url;
            // reset thte filter if legendCQLFilter is empty
            const isLegendFilterExist = filterObj?.filters?.find(f => f.id === 'interactiveLegend');
            if (isLegendFilterExist) {
                filterObj = {
                    ...filterObj, filters: filterObj?.filters?.filter(f => f.id !== 'interactiveLegend')
                };
                let newFilter = isNotEmptyFilter(filterObj) ? filterObj : undefined;
                return Rx.Observable.of(search(searchUrl, newFilter), addFilterToLayer(layer.id, newFilter), storeAppliedFilter(newFilter));
            }
            return Rx.Observable.empty();
        });
};

export default {
    handleLayerFilterPanel,
    restoreSavedFilter,
    onApplyFilter,
    applyWMSCQLFilterBasedOnLegendFilter,
    applyResetLegendFilter
};
