/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    LOAD_FIELDS,
    FIELDS_LOADED,
    FIELDS_ERROR,
    LOAD_CLASSIFICATION,
    CLASSIFICATION_LOADED,
    CLASSIFICATION_ERROR,
    CHANGE_CONFIGURATION,
    CHANGE_DIRTY,
    CHANGE_INPUT_VALIDITY
} from '../actions/thematic';

import { HIDE_SETTINGS } from '../actions/layers';

const initialState = {
    loadingFields: false,
    errorFields: null,
    loadingClassification: false,
    errorClassification: null,
    customClassification: false,
    dirty: false,
    adminCfg: {
        open: false,
        current: null,
        error: null
    },
    invalidInputs: {}
};

function thematic(state = initialState, action) {
    switch (action.type) {
    case HIDE_SETTINGS:
        return Object.assign({}, initialState);
    case LOAD_FIELDS:
        return Object.assign({}, state, {
            fields: null,
            loadingFields: true,
            errorFields: null
        });
    case FIELDS_LOADED:
        return Object.assign({}, state, {
            fields: action.fields,
            loadingFields: false,
            errorFields: null
        });
    case FIELDS_ERROR:
        return Object.assign({}, state, {
            fields: null,
            loadingFields: false,
            errorFields: action.error
        });
    case LOAD_CLASSIFICATION:
        return Object.assign({}, state, {
            loadingClassification: true,
            errorClassification: null
        });
    case CLASSIFICATION_LOADED:
        return Object.assign({}, state, {
            classification: action.classification,
            loadingClassification: false,
            errorClassification: null,
            customClassification: false
        });
    case CLASSIFICATION_ERROR:
        return Object.assign({}, state, {
            classification: null,
            loadingClassification: false,
            errorClassification: action.error,
            customClassification: false
        });
    case CHANGE_CONFIGURATION:
        return Object.assign({}, state, {
            adminCfg: {
                open: action.editEnabled,
                current: action.current,
                error: action.error
            }
        });
    case CHANGE_DIRTY:
        return Object.assign({}, state, {
            dirty: action.dirty
        });
    case CHANGE_INPUT_VALIDITY:
        if (action.valid) {
            return Object.assign({}, state, {
                invalidInputs: Object.keys(state.invalidInputs).reduce((previous, current) => {
                    return current === action.input ? previous : [...previous, current];
                }, {})
            });
        }
        return Object.assign({}, state, {
            invalidInputs: Object.assign({}, state.invalidInputs, {
                [action.input]: {
                    message: action.message,
                    params: action.params || {}
                }
            })
        });
    default:
        return state;
    }
}

export default thematic;
