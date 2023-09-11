/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const EDIT_ANNOTATION = 'ANNOTATIONS:EDIT';
export const DOWNLOAD = 'ANNOTATIONS:DOWNLOAD';
export const LOAD_ANNOTATIONS = 'ANNOTATIONS:LOAD_ANNOTATIONS';
export const NEW_ANNOTATION = 'ANNOTATIONS:NEW';
export const CLOSE_ANNOTATIONS = 'ANNOTATIONS:CLOSE';
export const CONFIRM_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CONFIRM_CLOSE';
export const CANCEL_CLOSE_ANNOTATIONS = 'ANNOTATIONS:CANCEL_CLOSE';
export const REMOVE_ANNOTATION = 'ANNOTATIONS:REMOVE';
export const STORE_ANNOTATIONS_SESSION = 'ANNOTATIONS:STORE_SESSION';
export const MERGE_ANNOTATIONS_FEATURES = 'ANNOTATIONS:MERGE_FEATURES';
export const SELECT_ANNOTATION_FEATURE = 'ANNOTATIONS:SELECT_FEATURE';
/**
 * Enable the tools to edit an annotation layer
 * @param {string} id identifier of the annotation to edit
 * @return {object} of type `EDIT_ANNOTATION` with id
 */
export const editAnnotation = (id) => ({
    type: EDIT_ANNOTATION,
    id
});
/**
 * Download an array of annotations layers
 * @param {array} annotations an array of annotations layers
 * @return {object} of type `DOWNLOAD` with annotations
 */
export const download = (annotations) => {
    return {
        type: DOWNLOAD,
        annotations
    };
};
/**
 * Loads new annotation in map
 * @param {array} features list of annotations layers
 * @param {boolean} override if true remove existing annotations
 * @return {object} of type `LOAD_ANNOTATIONS` with features and override
 */
export const loadAnnotations = (features, override = false) => {
    return {
        type: LOAD_ANNOTATIONS,
        features,
        override
    };
};
/**
 * Creates a new annotations layer
 * @return {object} of type `NEW_ANNOTATION`
 */
export const newAnnotation = () => {
    return {
        type: NEW_ANNOTATION
    };
};
/**
 * Close annotations panel
 * @return {object} of type `CLOSE_ANNOTATIONS`
 */
export const closeAnnotations = () => {
    return {
        type: CLOSE_ANNOTATIONS
    };
};
/**
 * Confirm closing of annotation panel
 * @param {object} layer annotation layer
 * @return {object} of type `CONFIRM_CLOSE_ANNOTATIONS` and layer
 */
export const confirmCloseAnnotations = (layer) => {
    return {
        type: CONFIRM_CLOSE_ANNOTATIONS,
        layer
    };
};
/**
 * Cancel closing of annotation panel
 * @return {object} of type `CANCEL_CLOSE_ANNOTATIONS`
 */
export const cancelCloseAnnotations = () => {
    return {
        type: CANCEL_CLOSE_ANNOTATIONS
    };
};
/**
 * Remove an annotations layer using the id
 * @param {string} id
 * @return {object} of type `REMOVE_ANNOTATION` with id
 */
export const removeAnnotation = (id) => {
    return {
        type: REMOVE_ANNOTATION,
        id
    };
};
/**
 * Store the current editing state of the annotation panel in state
 * @param {object} session the present state of editing
 * @return {object} of type `STORE_ANNOTATIONS_SESSION` with session
 */
export const storeAnnotationsSession = (session) => {
    return {
        type: STORE_ANNOTATIONS_SESSION,
        session
    };
};
/**
 * Merge an annotation layer to another
 * @param {string} id annotation layer to target
 * @param {object} annotation features and style to merge
 * @return {object} of type `MERGE_ANNOTATIONS_FEATURES` with id and annotation
 */
export const mergeAnnotationsFeatures = (id, annotation) => {
    return {
        type: MERGE_ANNOTATIONS_FEATURES,
        id,
        annotation
    };
};
/**
 * Select a feature identifier of a annotation
 * @param {string} id identifier of the selected feature
 * @return {object} of type `SELECT_ANNOTATION_FEATURE` with id
 */
export const selectAnnotationFeature = (id) => {
    return {
        type: SELECT_ANNOTATION_FEATURE,
        id
    };
};
