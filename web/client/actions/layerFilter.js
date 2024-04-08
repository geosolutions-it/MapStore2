/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const INIT_LAYER_FILTER = 'LAYER_FILTER:INIT_LAYER_FILTER';
/**
 * It saves current applied filter in the state
 */
export const APPLIED_FILTER = 'LAYER_FILTER:APPLIED_FILTER';
/**
 * It saves the current applied filter
 */
export const STORE_CURRENT_APPLIED_FILTER = 'LAYER_FILTER:STORE_CURRENT_APPLIED_FILTER';
/**
 * It discard current applied filter restoring the last saved one
 */
export const DISCARD_CURRENT_FILTER = 'LAYER_FILTER:DISCARD_CURRENT_FILTER';

export const APPLY_FILTER = 'LAYER_FILTER:APPLY_FILTER';
/**
 * It opens the queary panel to be used as layer filter query builder
 */
export const OPEN_QUERY_BUILDER = 'LAYER_FILTER:OPEN_QUERY_BUILDER';

export const LAYER_FILTER_BY_LEGEND = 'LAYER_FILTER:LAYER_FILTER_BY_LEGEND';

export const RESET_LAYER_FILTER_BY_LEGEND = 'LAYER_FILTER:RESET_LAYER_FILTER_BY_LEGEND';

export function storeCurrentFilter() {
    return {
        type: STORE_CURRENT_APPLIED_FILTER
    };
}

export function discardCurrentFilter() {
    return {
        type: DISCARD_CURRENT_FILTER
    };
}
export function openQueryBuilder() {
    return {
        type: OPEN_QUERY_BUILDER
    };
}
export function storeAppliedFilter(filter) {
    return {
        type: APPLIED_FILTER,
        filter
    };
}
export function applyFilter() {
    return {
        type: APPLY_FILTER
    };
}

export function initLayerFilter(filter) {
    return {
        type: INIT_LAYER_FILTER,
        filter
    };
}

export function layerFilterByLegend(layerId, nodeType, legendCQLFilter) {
    return {
        type: LAYER_FILTER_BY_LEGEND,
        legendCQLFilter,
        nodeType,
        layerId
    };
}

export function resetLegendFilter(reason, value) {
    return {
        type: RESET_LAYER_FILTER_BY_LEGEND,
        reason,     // here the reason for reset is change 'style' or change the enable/disable interactive legend config 'disableEnableInteractiveLegend'
        value
    };
}
