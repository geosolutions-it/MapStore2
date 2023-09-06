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

export const editAnnotation = (id) => ({
    type: EDIT_ANNOTATION,
    id
});
export const download = (annotations) => {
    return {
        type: DOWNLOAD,
        annotations
    };
};
export const loadAnnotations = (features, override = false) => {
    return {
        type: LOAD_ANNOTATIONS,
        features,
        override
    };
};
export const newAnnotation = () => {
    return {
        type: NEW_ANNOTATION
    };
};
export const closeAnnotations = () => {
    return {
        type: CLOSE_ANNOTATIONS
    };
};
export const confirmCloseAnnotations = (layer) => {
    return {
        type: CONFIRM_CLOSE_ANNOTATIONS,
        layer
    };
};
export const cancelCloseAnnotations = () => {
    return {
        type: CANCEL_CLOSE_ANNOTATIONS
    };
};
export const removeAnnotation = (id) => {
    return {
        type: REMOVE_ANNOTATION,
        id
    };
};
export const storeAnnotationsSession = (session) => {
    return {
        type: STORE_ANNOTATIONS_SESSION,
        session
    };
};
export const mergeAnnotationsFeatures = (id, annotation) => {
    return {
        type: MERGE_ANNOTATIONS_FEATURES,
        id,
        annotation
    };
};
export const selectAnnotationFeature = (id) => {
    return {
        type: SELECT_ANNOTATION_FEATURE,
        id
    };
};
