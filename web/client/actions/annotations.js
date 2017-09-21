/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const EDIT_ANNOTATION = 'ANNOTATIONS:EDIT';
const REMOVE_ANNOTATION = 'ANNOTATIONS:REMOVE';
const REMOVE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:REMOVE_GEOMETRY';
const CONFIRM_REMOVE_ANNOTATION = 'ANNOTATIONS:CONFIRM_REMOVE';
const CANCEL_REMOVE_ANNOTATION = 'ANNOTATIONS:CANCEL_REMOVE';
const CANCEL_EDIT_ANNOTATION = 'ANNOTATIONS:CANCEL_EDIT';
const SAVE_ANNOTATION = 'ANNOTATIONS:SAVE';
const TOGGLE_ADD = 'ANNOTATIONS:TOGGLE_ADD';
const UPDATE_ANNOTATION_GEOMETRY = 'ANNOTATIONS:UPDATE_GEOMETRY';
const VALIDATION_ERROR = 'ANNOTATIONS:VALIDATION_ERROR';

const {head} = require('lodash');

function editAnnotation(id) {
    return (dispatch, getState) => {
        dispatch({
            type: EDIT_ANNOTATION,
            feature: head(head(getState().layers.flat.filter(l => l.id === 'annotations')).features.filter(f => f.properties.id === id))
        });
    };
}

function removeAnnotation(id) {
    return {
        type: REMOVE_ANNOTATION,
        id
    };
}

function removeAnnotationGeometry() {
    return {
        type: REMOVE_ANNOTATION_GEOMETRY
    };
}

function confirmRemoveAnnotation(id) {
    return {
        type: CONFIRM_REMOVE_ANNOTATION,
        id
    };
}

function cancelRemoveAnnotation() {
    return {
        type: CANCEL_REMOVE_ANNOTATION
    };
}

function cancelEditAnnotation() {
    return {
        type: CANCEL_EDIT_ANNOTATION
    };
}

function saveAnnotation(id, fields, geometry) {
    return {
        type: SAVE_ANNOTATION,
        id,
        fields,
        geometry
    };
}

function toggleAdd() {
    return {
        type: TOGGLE_ADD
    };
}

function updateAnnotationGeometry(geometry) {
    return {
        type: UPDATE_ANNOTATION_GEOMETRY,
        geometry
    };
}

function validationError(errors) {
    return {
        type: VALIDATION_ERROR,
        errors
    };
}

module.exports = {
    EDIT_ANNOTATION,
    REMOVE_ANNOTATION,
    CONFIRM_REMOVE_ANNOTATION,
    CANCEL_REMOVE_ANNOTATION,
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    editAnnotation,
    removeAnnotation,
    confirmRemoveAnnotation,
    cancelRemoveAnnotation,
    cancelEditAnnotation,
    saveAnnotation,
    toggleAdd,
    updateAnnotationGeometry,
    validationError,
    removeAnnotationGeometry
};
