/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Actions for floatinglegend.
 * @name actions.floatinglegend
 */

export const RESIZE_LEGEND = 'FLOATINGLEGEND:RESIZE_LEGEND';
export const EXPAND_LEGEND = 'FLOATINGLEGEND:EXPAND_LEGEND';
/**
 * resizeLegend action, type `RESIZE_LEGEND`
 * @memberof actions.floatinglegend
 * @param  {object} size size of legend {width: 0, height: 0}
 * @return {action} type `RESIZE_LEGEND` with size
 */
export function resizeLegend(size) {
    return {
        type: RESIZE_LEGEND,
        size
    };
}
/**
 * expandLegend action, type `EXPAND_LEGEND`
 * @memberof actions.floatinglegend
 * @param  {boolean} expanded expanded state of legend action
 * @return {action} type `EXPAND_LEGEND` with expanded
 */
export function expandLegend(expanded) {
    return {
        type: EXPAND_LEGEND,
        expanded
    };
}
