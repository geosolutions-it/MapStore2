/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    HIGHLIGHT_STATUS,
    UPDATE_HIGHLIGHTED,
    SET_HIGHLIGHT_FEATURES_PATH
} = require('../actions/highlight');

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
    case SET_HIGHLIGHT_FEATURES_PATH: {
        return assign({}, state, {
            featuresPath: action.featuresPath || "highlight.emptyFeatures"
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
