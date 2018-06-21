/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { LOAD_FIELDS, FIELDS_LOADED, FIELDS_ERROR, LOAD_CLASSIFICATION, CLASSIFICATION_LOADED, CLASSIFICATION_ERROR,
    CHANGE_CONFIGURATION} = require('../actions/thematic');
const { HIDE_SETTINGS } = require('../actions/layers');
const assign = require('object-assign');

const initialState = {
    loadingFields: false,
    errorFields: null,
    loadingClassification: false,
    errorClassification: null,
    customClassification: false,
    adminCfg: {
        open: false,
        current: null,
        error: null
    }
};

function thematic(state = initialState, action) {
    switch (action.type) {
        case HIDE_SETTINGS:
            return assign({}, initialState);
        case LOAD_FIELDS:
            return assign({}, state, {
                fields: null,
                loadingFields: true,
                errorFields: null
            });
        case FIELDS_LOADED:
            return assign({}, state, {
                fields: action.fields,
                loadingFields: false,
                errorFields: null
            });
        case FIELDS_ERROR:
            return assign({}, state, {
                fields: null,
                loadingFields: false,
                errorFields: action.error
            });
        case LOAD_CLASSIFICATION:
            return assign({}, state, {
                classification: null,
                loadingClassification: true,
                errorClassification: null
            });
        case CLASSIFICATION_LOADED:
            return assign({}, state, {
                classification: action.classification,
                loadingClassification: false,
                errorClassification: null,
                customClassification: false
            });
        case CLASSIFICATION_ERROR:
            return assign({}, state, {
                classification: null,
                loadingClassification: false,
                errorClassification: action.error,
                customClassification: false
            });
        case CHANGE_CONFIGURATION:
            return assign({}, state, {
                adminCfg: {
                    open: action.editEnabled,
                    current: action.current,
                    error: action.error
                }
            });
        default:
            return state;
    }
}

module.exports = thematic;
