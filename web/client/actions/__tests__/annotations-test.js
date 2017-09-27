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
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE,
    SET_STYLE,
    RESTORE_STYLE,
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
    restoreStyle
} = require('../annotations');

describe('Test correctness of the annotations actions', () => {
    it('edit annotation', (done) => {
        const result = editAnnotation('1');
        expect(result).toExist();
        expect(isFunction(result)).toBe(true);
        result((action) => {
            expect(action.type).toEqual(EDIT_ANNOTATION);
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
        }, {}, {});
        expect(result.type).toEqual(SAVE_ANNOTATION);
        expect(result.id).toEqual('1');
        expect(result.fields.name).toEqual('changed');
        expect(result.geometry).toExist();
        expect(result.style).toExist();
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
});
