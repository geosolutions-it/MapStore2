/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const FIELDS_LOADED = 'THEMATIC:FIELDS_LOADED';
export const FIELDS_ERROR = 'THEMATIC:FIELDS_ERROR';
export const LOAD_FIELDS = 'THEMATIC:LOAD_FIELDS';

export const CLASSIFICATION_LOADED = 'THEMATIC:CLASSIFICATION_LOADED';
export const CLASSIFICATION_ERROR = 'THEMATIC:CLASSIFICATION_ERROR';
export const LOAD_CLASSIFICATION = 'THEMATIC:LOAD_CLASSIFICATION';

export const CHANGE_CONFIGURATION = 'THEMATIC:CHANGE_CONFIGURATION';

export const CHANGE_DIRTY = 'THEMATIC:CHANGE_DIRTY';
export const CHANGE_INPUT_VALIDITY = 'THEMATIC:CHANGE_INPUT_VALIDITY';

export function fieldsLoaded(layer, fields) {
    return {
        type: FIELDS_LOADED,
        layer,
        fields
    };
}

export function fieldsError(layer, error) {
    return {
        type: FIELDS_ERROR,
        layer,
        error
    };
}

export function loadFields(layer) {
    return {
        type: LOAD_FIELDS,
        layer
    };
}

export function loadClassification(layer, params) {
    return {
        type: LOAD_CLASSIFICATION,
        layer,
        params
    };
}

export function classificationLoaded(layer, classification) {
    return {
        type: CLASSIFICATION_LOADED,
        layer,
        classification
    };
}

export function classificationError(layer, error) {
    return {
        type: CLASSIFICATION_ERROR,
        layer,
        error
    };
}

export function changeConfiguration(layer, editEnabled, current, error) {
    return {
        type: CHANGE_CONFIGURATION,
        layer,
        editEnabled,
        current,
        error
    };
}

export function setDirty() {
    return {
        type: CHANGE_DIRTY,
        dirty: true
    };
}

export function cancelDirty() {
    return {
        type: CHANGE_DIRTY,
        dirty: false
    };
}

export function setInvalidInput(input, message, params) {
    return {
        type: CHANGE_INPUT_VALIDITY,
        valid: false,
        input,
        message,
        params
    };
}

export function resetInvalidInput(input) {
    return {
        type: CHANGE_INPUT_VALIDITY,
        valid: true,
        input
    };
}
