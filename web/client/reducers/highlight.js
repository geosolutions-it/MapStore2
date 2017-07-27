/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    HIGHLIGHT_STATUS,
    UPDATE_HIGHLIGHTED
} = require('../actions/highlight');
const {
    TOGGLE_MODE,
    MODES
} = require('../actions/featuregrid');

const assign = require('object-assign');

const initialState = {
    status: 'disabled',
    layer: 'featureselector',
    features: [],
    highlighted: 0,
    featuresPath: "highlight.emptyFeatures",
    emptyFeatures: []
};

function highlight(state = initialState, action) {
    switch (action.type) {
        case TOGGLE_MODE: {
            return assign({}, state, {
                featuresPath: action.mode === MODES.VIEW ? "featuregrid.select" : "highlight.emptyFeatures"
            });
        }
        case HIGHLIGHT_STATUS: {
            return {...state, status: action.status};
        }
        case UPDATE_HIGHLIGHTED: {
            return {...state, highlighted: action.features.length, features: action.features, status: action.status || state.status};
        }
        default:
            return state;
    }
}

module.exports = highlight;
