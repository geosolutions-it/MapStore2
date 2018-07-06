/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const RESIZE_LEGEND = 'FLOATINGLEGEND:RESIZE_LEGEND';
const EXPAND_LEGEND = 'FLOATINGLEGEND:EXPAND_LEGEND';
/**
 * resizeLegend action, type `RESIZE_LEGEND`
 * @memberof actions.floatinglegend
 * @param  {object} size size of legend {width: 0, height: 0}
 * @return {action} type `RESIZE_LEGEND` with size
 */
function resizeLegend(size) {
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
function expandLegend(expanded) {
    return {
        type: EXPAND_LEGEND,
        expanded
    };
}
/**
 * Actions for floatinglegend.
 * @name actions.floatinglegend
 */
module.exports = {
    RESIZE_LEGEND,
    EXPAND_LEGEND,
    resizeLegend,
    expandLegend
};
