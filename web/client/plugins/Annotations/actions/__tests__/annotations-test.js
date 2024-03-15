/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    EDIT_ANNOTATION,
    DOWNLOAD,
    LOAD_ANNOTATIONS,
    NEW_ANNOTATION,
    CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    REMOVE_ANNOTATION,
    STORE_ANNOTATIONS_SESSION,
    MERGE_ANNOTATIONS_FEATURES,
    SELECT_ANNOTATION_FEATURE,
    editAnnotation,
    download,
    loadAnnotations,
    newAnnotation,
    closeAnnotations,
    confirmCloseAnnotations,
    cancelCloseAnnotations,
    removeAnnotation,
    storeAnnotationsSession,
    mergeAnnotationsFeatures,
    selectAnnotationFeature
} from '../annotations';

describe('annotations actions', () => {
    it('edit annotation', () => {
        const result = editAnnotation('1');
        expect(result.type).toBe(EDIT_ANNOTATION);
        expect(result.id).toBe('1');
    });
    it('creates new annotation', () => {
        const result = newAnnotation();
        expect(result.type).toBe(NEW_ANNOTATION);
    });
    it('close annotations', () => {
        const result = closeAnnotations();
        expect(result.type).toBe(CLOSE_ANNOTATIONS);
    });
    it('load annotations', () => {
        const result = loadAnnotations([]);
        expect(result.type).toBe(LOAD_ANNOTATIONS);
        expect(result.features).toBeTruthy();
        expect(result.override).toBe(false);
    });
    it('download annotations', () => {
        const result = download();
        expect(result.type).toBe(DOWNLOAD);
    });
    it('confirm close annotations', () => {
        const result = confirmCloseAnnotations({ id: 'annotations:1' });
        expect(result.type).toBe(CONFIRM_CLOSE_ANNOTATIONS);
        expect(result.layer).toEqual({ id: 'annotations:1' });
    });
    it('cancel close annotations', () => {
        const result = cancelCloseAnnotations();
        expect(result.type).toBe(CANCEL_CLOSE_ANNOTATIONS);
    });
    it('remove annotations', () => {
        const id = 'annotations:1';
        const result = removeAnnotation(id);
        expect(result.type).toBe(REMOVE_ANNOTATION);
        expect(result.id).toBe(id);
    });
    it('store annotations session', () => {
        const session = { features: [], style: { format: 'geostyler', body: { name: '', rules: [] } } };
        const result = storeAnnotationsSession(session);
        expect(result.type).toBe(STORE_ANNOTATIONS_SESSION);
        expect(result.session).toEqual(session);
    });
    it('merge annotations features', () => {
        const id = 'annotations:1';
        const annotation = { id: 'annotations:2', features: [], style: { format: 'geostyler', body: { name: '', rules: [] } } };
        const result = mergeAnnotationsFeatures(id, annotation);
        expect(result.type).toBe(MERGE_ANNOTATIONS_FEATURES);
        expect(result.id).toBe(id);
        expect(result.annotation).toEqual(annotation);
    });
    it('select annotation feature', () => {
        const id = 'feature-1';
        const result = selectAnnotationFeature(id);
        expect(result.type).toBe(SELECT_ANNOTATION_FEATURE);
        expect(result.id).toBe(id);
    });
});
