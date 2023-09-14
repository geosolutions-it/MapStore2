/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    annotationsLayerSelector,
    annotationsLayersSelector,
    getSelectedAnnotationLayer,
    editingSelector,
    getAnnotationsSession,
    getSelectedAnnotationFeatureId
} from '../annotations';

describe('annotations selectors', () => {
    it('annotationsLayerSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layer-01',
                        type: 'vector',
                        title: 'Vector',
                        features: []
                    },
                    {
                        id: 'annotations:1',
                        type: 'vector',
                        title: 'Annotations',
                        rowViewer: 'annotations',
                        features: []
                    }
                ]
            }
        };
        expect(annotationsLayerSelector(state)).toEqual({
            id: 'annotations:1',
            type: 'vector',
            title: 'Annotations',
            rowViewer: 'annotations',
            features: []
        });
    });
    it('annotationsLayersSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layer-01',
                        type: 'vector',
                        title: 'Vector',
                        features: []
                    },
                    {
                        id: 'annotations:1',
                        type: 'vector',
                        title: 'Annotations',
                        rowViewer: 'annotations',
                        features: []
                    },
                    {
                        id: 'annotations:2',
                        type: 'vector',
                        title: 'Annotations',
                        rowViewer: 'annotations',
                        features: []
                    }
                ]
            }
        };
        expect(annotationsLayersSelector(state)).toEqual([
            {
                id: 'annotations:1',
                type: 'vector',
                title: 'Annotations',
                rowViewer: 'annotations',
                features: []
            },
            {
                id: 'annotations:2',
                type: 'vector',
                title: 'Annotations',
                rowViewer: 'annotations',
                features: []
            }
        ]);
    });
    it('getSelectedAnnotationLayer', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layer-01',
                        type: 'vector',
                        title: 'Vector',
                        features: []
                    },
                    {
                        id: 'annotations:1',
                        type: 'vector',
                        title: 'Annotations',
                        rowViewer: 'annotations',
                        features: []
                    }
                ],
                selected: ['annotations:1']
            }
        };
        expect(getSelectedAnnotationLayer(state)).toEqual({
            id: 'annotations:1',
            type: 'vector',
            title: 'Annotations',
            rowViewer: 'annotations',
            features: []
        });
    });
    it('editingSelector', () => {
        const state = {
            annotations: {
                editing: true
            }
        };
        expect(editingSelector(state)).toBe(true);
    });
    it('getAnnotationsSession', () => {
        const state = {
            annotations: {
                session: { features: [] }
            }
        };
        expect(getAnnotationsSession(state)).toEqual({ features: [] });
    });
    it('getSelectedAnnotationFeatureId', () => {
        const state = {
            annotations: {
                featureId: 'feature-01'
            }
        };
        expect(getSelectedAnnotationFeatureId(state)).toBe('feature-01');
    });
});
