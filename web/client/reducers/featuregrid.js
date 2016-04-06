/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require("object-assign");
const {SELECT_FEATURES, SET_FEATURES} = require('../actions/featuregrid');

function featuregrid(state = {
    select: [],
    features: []
}, action) {
    switch (action.type) {
        case SELECT_FEATURES:
            return assign({}, state, {select: action.features});
        case SET_FEATURES:
            return assign({}, state, {features: action.features});
        default:
            return state;
    }
}

module.exports = featuregrid;
