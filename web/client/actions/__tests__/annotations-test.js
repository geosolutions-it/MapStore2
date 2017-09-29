/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {isFunction} = require('lodash');

const {
    EDIT_ANNOTATION,
    REMOVE_ANNOTATION,
    CONFIRM_REMOVE_ANNOTATION,
    CANCEL_REMOVE_ANNOTATION,
    CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE,
    SET_STYLE,
    RESTORE_STYLE,
    SHOW_ANNOTATION,
    CANCEL_SHOW_ANNOTATION,
    NEW_ANNOTATION,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    FILTER_ANNOTATIONS,
    editAnnotation,
    removeAnnotation,
    confirmRemoveAnnotation,
    cancelRemoveAnnotation,
    cancelEditAnnotation,
    saveAnnotation,
    toggleAdd,
    updateAnnotationGeometry,
    validationError,
    removeAnnotationGeometry,
    toggleStyle,
    setStyle,
    restoreStyle,
    showAnnotation,
    cancelShowAnnotation,
    newAnnotation,
    highlight,
    cleanHighlight,
    filterAnnotations,
    closeAnnotations,
    confirmCloseAnnotations,
    cancelCloseAnnotations
} = require('../annotations');

describe('Test correctness of the annotations actions', () => {
    it('edit annotation', (done) => {
        const result = editAnnotation('1', 'Point');
        expect(result).toExist();
        expect(isFunction(result)).toBe(true);
        result((action) => {
            expect(action.type).toEqual(EDIT_ANNOTATION);
            expect(action.featureType).toEqual('Point');
            expect(action.feature).toExist();
            expect(action.feature.properties.name).toEqual('myannotation');
            done();
        }, () => ({
            layers: {
                flat: [{
                    id: 'annotations',
                    features: [{
                        properties: {
                            id: '1',
                            name: 'myannotation'
                        }
                    }]
                }]
            }
        }));
    });

    it('remove annotation', () => {
        const result = removeAnnotation('1');
        expect(result.type).toEqual(REMOVE_ANNOTATION);
        expect(result.id).toEqual('1');
    });

    it('confirm remove annotation', () => {
        const result = confirmRemoveAnnotation('1');
        expect(result.type).toEqual(CONFIRM_REMOVE_ANNOTATION);
        expect(result.id).toEqual('1');
    });

    it('cancel remove annotation', () => {
        const result = cancelRemoveAnnotation();
        expect(result.type).toEqual(CANCEL_REMOVE_ANNOTATION);
    });

    it('cancel edit annotation', () => {
        const result = cancelEditAnnotation();
        expect(result.type).toEqual(CANCEL_EDIT_ANNOTATION);
    });

    it('save annotation', () => {
        const result = saveAnnotation('1', {
            name: 'changed'
        }, {}, {}, true);
        expect(result.type).toEqual(SAVE_ANNOTATION);
        expect(result.id).toEqual('1');
        expect(result.fields.name).toEqual('changed');
        expect(result.geometry).toExist();
        expect(result.style).toExist();
        expect(result.newFeature).toBe(true);
    });

    it('toggle add', () => {
        const result = toggleAdd();
        expect(result.type).toEqual(TOGGLE_ADD);
    });

    it('toggle style', () => {
        const result = toggleStyle();
        expect(result.type).toEqual(TOGGLE_STYLE);
    });

    it('restore style', () => {
        const result = restoreStyle();
        expect(result.type).toEqual(RESTORE_STYLE);
    });

    it('set style', () => {
        const result = setStyle({});
        expect(result.type).toEqual(SET_STYLE);
        expect(result.style).toExist();
    });

    it('update annotation geometry', () => {
        const result = updateAnnotationGeometry({});
        expect(result.type).toEqual(UPDATE_ANNOTATION_GEOMETRY);
        expect(result.geometry).toExist();
    });

    it('validation error', () => {
        const result = validationError({
            'title': 'error1'
        });
        expect(result.type).toEqual(VALIDATION_ERROR);
        expect(result.errors.title).toEqual('error1');
    });

    it('remove annotation geometry', () => {
        const result = removeAnnotationGeometry();
        expect(result.type).toEqual(REMOVE_ANNOTATION_GEOMETRY);
    });

    it('shows annotation', () => {
        const result = showAnnotation('1');
        expect(result.type).toEqual(SHOW_ANNOTATION);
        expect(result.id).toEqual('1');
    });

    it('cancels show annotation', () => {
        const result = cancelShowAnnotation();
        expect(result.type).toEqual(CANCEL_SHOW_ANNOTATION);
    });

    it('creates new annotation', () => {
        const result = newAnnotation('Point');
        expect(result.type).toEqual(NEW_ANNOTATION);
        expect(result.featureType).toEqual('Point');
    });

    it('highlights annotation', () => {
        const result = highlight('1');
        expect(result.type).toEqual(HIGHLIGHT);
        expect(result.id).toEqual('1');
    });

    it('cleans highlights', () => {
        const result = cleanHighlight('1');
        expect(result.type).toEqual(CLEAN_HIGHLIGHT);
    });

    it('filters annotaions', () => {
        const result = filterAnnotations('1');
        expect(result.type).toEqual(FILTER_ANNOTATIONS);
        expect(result.filter).toEqual('1');
    });

    it('close annotations', () => {
        const result = closeAnnotations();
        expect(result.type).toEqual(CLOSE_ANNOTATIONS);
    });

    it('confirm close annotations', () => {
        const result = confirmCloseAnnotations();
        expect(result.type).toEqual(CONFIRM_CLOSE_ANNOTATIONS);
    });

    it('cancel close annotations', () => {
        const result = cancelCloseAnnotations();
        expect(result.type).toEqual(CANCEL_CLOSE_ANNOTATIONS);
    });
});
