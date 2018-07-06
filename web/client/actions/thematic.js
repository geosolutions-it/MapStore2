/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const FIELDS_LOADED = 'THEMATIC:FIELDS_LOADED';
const FIELDS_ERROR = 'THEMATIC:FIELDS_ERROR';
const LOAD_FIELDS = 'THEMATIC:LOAD_FIELDS';

const CLASSIFICATION_LOADED = 'THEMATIC:CLASSIFICATION_LOADED';
const CLASSIFICATION_ERROR = 'THEMATIC:CLASSIFICATION_ERROR';
const LOAD_CLASSIFICATION = 'THEMATIC:LOAD_CLASSIFICATION';

const CHANGE_CONFIGURATION = 'THEMATIC:CHANGE_CONFIGURATION';

const CHANGE_DIRTY = 'THEMATIC:CHANGE_DIRTY';
const CHANGE_INPUT_VALIDITY = 'THEMATIC:CHANGE_INPUT_VALIDITY';

function fieldsLoaded(layer, fields) {
    return {
        type: FIELDS_LOADED,
        layer,
        fields
    };
}

function fieldsError(layer, error) {
    return {
        type: FIELDS_ERROR,
        layer,
        error
    };
}

function loadFields(layer) {
    return {
        type: LOAD_FIELDS,
        layer
    };
}

function loadClassification(layer, params) {
    return {
        type: LOAD_CLASSIFICATION,
        layer,
        params
    };
}

function classificationLoaded(layer, classification) {
    return {
        type: CLASSIFICATION_LOADED,
        layer,
        classification
    };
}

function classificationError(layer, error) {
    return {
        type: CLASSIFICATION_ERROR,
        layer,
        error
    };
}

function changeConfiguration(layer, editEnabled, current, error) {
    return {
        type: CHANGE_CONFIGURATION,
        layer,
        editEnabled,
        current,
        error
    };
}

function setDirty() {
    return {
        type: CHANGE_DIRTY,
        dirty: true
    };
}

function cancelDirty() {
    return {
        type: CHANGE_DIRTY,
        dirty: false
    };
}

function setInvalidInput(input, message, params) {
    return {
        type: CHANGE_INPUT_VALIDITY,
        valid: false,
        input,
        message,
        params
    };
}

function resetInvalidInput(input) {
    return {
        type: CHANGE_INPUT_VALIDITY,
        valid: true,
        input
    };
}

module.exports = {
    FIELDS_LOADED,
    FIELDS_ERROR,
    LOAD_FIELDS,
    CLASSIFICATION_LOADED,
    CLASSIFICATION_ERROR,
    LOAD_CLASSIFICATION,
    CHANGE_CONFIGURATION,
    CHANGE_DIRTY,
    CHANGE_INPUT_VALIDITY,
    fieldsLoaded,
    loadFields,
    fieldsError,
    loadClassification,
    classificationLoaded,
    classificationError,
    changeConfiguration,
    setDirty,
    cancelDirty,
    setInvalidInput,
    resetInvalidInput
};
