/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { RESIZE_LEGEND, EXPAND_LEGEND } = require('../actions/floatinglegend');

const {set} = require('../utils/ImmutableUtils');
/**
 * Manages the state of the floatinglegend
 * The properties represent the shape of the state
 * @prop {object} size size of legend {width: 0, height: 0}
 * @prop {boolan} expanded expanded state
 * @memberof reducers
 */
function floatinglegend(state = {}, action) {
    switch (action.type) {
    case RESIZE_LEGEND: {
        return set('size', {
            width: action.size && action.size.width,
            height: action.size && action.size.height
        }, state);
    }
    case EXPAND_LEGEND: {
        return {...state, expanded: action.expanded};
    }
    default:
        return state;
    }
}
module.exports = floatinglegend;
