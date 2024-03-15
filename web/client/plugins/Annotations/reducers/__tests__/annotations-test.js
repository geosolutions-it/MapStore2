/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import annotations from '../annotations';

import {
    editAnnotation,
    closeAnnotations,
    confirmCloseAnnotations,
    cancelCloseAnnotations,
    storeAnnotationsSession,
    selectAnnotationFeature
} from '../../actions/annotations';

describe('annotations reducer', () => {
    it('edit annotation', () => {
        const state = annotations({}, editAnnotation('annotations:1'));
        expect(state.editing).toBe(true);
    });
    it('close annotations', () => {
        const state = annotations({}, closeAnnotations());
        expect(state.closeId).toBe(1);
    });
    it('confirm close annotations', () => {
        const state = annotations({}, confirmCloseAnnotations());
        expect(state.editing).toBe(false);
        expect(state.closeId).toBe(0);
        expect(state.session).toBe(null);
    });
    it('cancel close annotations', () => {
        const state = annotations({}, cancelCloseAnnotations());
        expect(state.closeId).toBe(0);
    });
    it('store annotations session', () => {
        const session = { features: [], style: { format: 'geostyler', body: { name: '', rules: [] } } };
        const state = annotations({}, storeAnnotationsSession(session));
        expect(state.session).toEqual(session);
    });
    it('select annotation feature', () => {
        const state = annotations({}, selectAnnotationFeature('feature-01'));
        expect(state.featureId).toBe('feature-01');
    });
});
