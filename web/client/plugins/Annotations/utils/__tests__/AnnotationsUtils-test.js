/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {
    isGeodesicMeasure,
    validateCoords,
    coordToArray,
    validateCoordsArray,
    getComponents,
    annotationsToGeoJSON,
    geoJSONToAnnotations,
    importJSONToAnnotations,
    checkInvalidCoordinate,
    parseUpdatedCoordinates,
    validateFeature,
    applyDefaultCoordinates,
    getFeatureIcon
} from '../AnnotationsUtils';
import { annotationsTest, annotationsTestResult, annotationsTestFromGeoJson } from './resources';

import { MeasureTypes } from '../../../../utils/MeasureUtils';

describe('AnnotationsUtils', () => {
    it('isGeodesicMeasure', () => {
        expect(isGeodesicMeasure(MeasureTypes.LENGTH)).toBe(true);
        expect(isGeodesicMeasure(MeasureTypes.AREA)).toBe(true);
        expect(isGeodesicMeasure(MeasureTypes.BEARING)).toBe(false);
    });
    it('validateCoords', () => {
        expect(validateCoords({ lat: '', lon: 0 })).toBe(false);
        expect(validateCoords({ lat: 0, lon: 0 })).toBe(true);
        expect(validateCoords({ lat: 0, lon: 0, height: '' })).toBe(false);
        expect(validateCoords({ lat: 0, lon: 0, height: 0 })).toBe(true);
    });
    it('coordToArray', () => {
        expect(coordToArray({ lat: 0, lon: 0, height: 0 })).toEqual([0, 0, 0]);
        expect(coordToArray({ lat: 0, lon: 0 })).toEqual([0, 0]);
    });
    it('coordToArray', () => {
        expect(validateCoordsArray(['', 0])).toBe(false);
        expect(validateCoordsArray([0, 0])).toBe(true);
        expect(validateCoordsArray([0, 0, ''])).toBe(false);
        expect(validateCoordsArray([0, 0, 0])).toBe(true);
    });
    it('getComponents', () => {
        expect(getComponents({ coordinates: [[[0, 0], [1, 1], [1, 0], [0, 0]]], type: 'Polygon' }))
            .toEqual([ { lat: 0, lon: 0 }, { lat: 1, lon: 1 }, { lat: 0, lon: 1 } ]);

        expect(getComponents({ coordinates: [[0, 0], [1, 1], [1, 0]], type: 'LineString' }))
            .toEqual([ { lat: 0, lon: 0 }, { lat: 1, lon: 1 }, { lat: 0, lon: 1 } ]);

        expect(getComponents({ coordinates: [0, 0], type: 'Point' }))
            .toEqual([ { lat: 0, lon: 0 } ]);
    });
    it('annotationsToGeoJSON', () => {
        const annotations = [
            { id: 'annotations:1', visibility: true, rowViewer: 'annotations', title: 'Annotation01', type: 'vector', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-01'], symbolizers: [{ kind: 'Icon' }] }] } }, features: [{ type: 'Feature', id: 'feature-01', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 'feature-01', annotationType: 'Point' } }] },
            { id: 'annotations:2', visibility: true, rowViewer: 'annotations', title: 'Annotation02', description: '<p>description</p>', type: 'vector', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-02'], symbolizers: [{ kind: 'Icon' }] }] } }, features: [{ type: 'Feature', id: 'feature-02', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 'feature-02', annotationType: 'Point' } }] }
        ];
        expect(annotationsToGeoJSON(annotations)).toEqual({
            type: 'FeatureCollection',
            msType: 'annotations',
            features: [
                {
                    type: 'Feature',
                    id: 'feature-01',
                    geometry: {
                        type: 'Point',
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        id: 'feature-01',
                        annotationType: 'Point',
                        annotationLayerId: 'annotations:1',
                        annotationLayerTitle: 'Annotation01',
                        annotationLayerDescription: undefined
                    }
                },
                {
                    type: 'Feature',
                    id: 'feature-02',
                    geometry: {
                        type: 'Point',
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        id: 'feature-02',
                        annotationType: 'Point',
                        annotationLayerId: 'annotations:2',
                        annotationLayerTitle: 'Annotation02',
                        annotationLayerDescription: '<p>description</p>'
                    }
                }
            ],
            annotations: [
                { id: 'annotations:1', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-01'], symbolizers: [{ kind: 'Icon' }] }] } } },
                { id: 'annotations:2', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-02'], symbolizers: [{ kind: 'Icon' }] }] } } }
            ]
        });
    });
    it('annotationsToGeoJSON with length and area measures', () => {
        // round numbers to 12 significant digits because floating point results
        // of transcendental functions can differ across browser versions
        const roundNumbers = value => JSON.parse(JSON.stringify(value, (key, val) => typeof val === 'number' ? Number(val.toPrecision(12)) : val));
        expect(roundNumbers(annotationsToGeoJSON(annotationsTest))).toEqual(roundNumbers(annotationsTestResult));
    });
    it('geoJSONToAnnotations', () => {
        const geoJSON = {
            type: 'FeatureCollection',
            msType: 'annotations',
            features: [
                {
                    type: 'Feature',
                    id: 'feature-01',
                    geometry: {
                        type: 'Point',
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        id: 'feature-01',
                        annotationType: 'Point',
                        annotationLayerId: 'annotations:1',
                        annotationLayerTitle: 'Annotation01',
                        annotationLayerDescription: undefined
                    }
                },
                {
                    type: 'Feature',
                    id: 'feature-02',
                    geometry: {
                        type: 'Point',
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        id: 'feature-02',
                        annotationType: 'Point',
                        annotationLayerId: 'annotations:2',
                        annotationLayerTitle: 'Annotation02',
                        annotationLayerDescription: '<p>description</p>'
                    }
                }
            ],
            annotations: [
                { id: 'annotations:1', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-01'], symbolizers: [{ kind: 'Icon' }] }] } } },
                { id: 'annotations:2', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-02'], symbolizers: [{ kind: 'Icon' }] }] } } }
            ]
        };
        expect(geoJSONToAnnotations(geoJSON)).toEqual([
            { id: 'annotations:1', visibility: true, rowViewer: 'annotations', title: 'Annotation01', description: undefined, type: 'vector', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-01'], symbolizers: [{ kind: 'Icon' }] }] } }, features: [{ type: 'Feature', id: 'feature-01', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 'feature-01', annotationType: 'Point' } }] },
            { id: 'annotations:2', visibility: true, rowViewer: 'annotations', title: 'Annotation02', description: '<p>description</p>', type: 'vector', style: { format: 'geostyler', body: { name: '', rules: [{ name: '', filter: ['==', 'id', 'feature-02'], symbolizers: [{ kind: 'Icon' }] }] } }, features: [{ type: 'Feature', id: 'feature-02', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id: 'feature-02', annotationType: 'Point' } }] }
        ]);
    });
    it('geoJSONToAnnotations with geodesic measures in input', () => {
        expect(geoJSONToAnnotations(annotationsTestResult)).toEqual(annotationsTestFromGeoJson);
    });
    it('importJSONToAnnotations invalid', () => {
        expect(importJSONToAnnotations({})).toEqual([]);
    });
    it('checkInvalidCoordinate', () => {
        expect(checkInvalidCoordinate('')).toBe(true);
        expect(checkInvalidCoordinate(0)).toBe(false);
    });
    it('parseUpdatedCoordinates', () => {
        expect(parseUpdatedCoordinates('Polygon', [[0, 0], [1, 1], [1, 0], [0, 0]])).toEqual([[[ 0, 0 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ]]]);
        expect(parseUpdatedCoordinates('LineString', [[0, 0], [1, 1], [1, 0]])).toEqual([[0, 0], [1, 1], [1, 0]]);
        expect(parseUpdatedCoordinates('Point', [[0, 0]])).toEqual([0, 0]);
    });
    it('validateFeature', () => {
        // point
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Point' } })).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, ''] }, properties: { annotationType: 'Point' } })).toBe(false);
        // circle
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Circle', radius: 100 } })).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Circle' } })).toBe(false);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Circle' } }, true)).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, ''] }, properties: { annotationType: 'Circle', radius: 100 } })).toBe(false);
        // text
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Text', label: 'New' } })).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Text' } })).toBe(false);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { annotationType: 'Text' } }, true)).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, ''] }, properties: { annotationType: 'Text', label: 'New' } })).toBe(false);
        // line
        expect(validateFeature({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] }, properties: { annotationType: 'LineString' } })).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0]] }, properties: { annotationType: 'LineString' } })).toBe(false);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0], [1, '']] }, properties: { annotationType: 'LineString' } })).toBe(false);
        // polygon
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]] }, properties: { annotationType: 'Polygon' } })).toBe(true);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0]]] }, properties: { annotationType: 'Polygon' } })).toBe(false);
        expect(validateFeature({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [0, 1], [0, '']]] }, properties: { annotationType: 'Polygon' } })).toBe(false);
    });
    it('applyDefaultCoordinates', () => {
        expect(applyDefaultCoordinates({ type: 'Feature', geometry: null, properties: { annotationType: 'Point' } }).geometry)
            .toEqual({ type: 'Point', coordinates: [ '', '' ] });
        expect(applyDefaultCoordinates({ type: 'Feature', geometry: null, properties: { annotationType: 'Circle' } }).geometry)
            .toEqual({ type: 'Point', coordinates: [ '', '' ] });
        expect(applyDefaultCoordinates({ type: 'Feature', geometry: null, properties: { annotationType: 'Text' } }).geometry)
            .toEqual({ type: 'Point', coordinates: [ '', '' ] });
        expect(applyDefaultCoordinates({ type: 'Feature', geometry: null, properties: { annotationType: 'LineString' } }).geometry)
            .toEqual({ type: 'LineString', coordinates: [[ '', '' ]] });
        expect(applyDefaultCoordinates({ type: 'Feature', geometry: null, properties: { annotationType: 'Polygon' } }).geometry)
            .toEqual({ type: 'Polygon', coordinates: [[[ '', '' ]]] });
    });
    it('getFeatureIcon', () => {
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { annotationType: 'Point' } })).toBe('point');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { annotationType: 'Circle' } })).toBe('1-circle');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { annotationType: 'Text' } })).toBe('font');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { annotationType: 'LineString' } })).toBe('polyline');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { annotationType: 'Polygon' } })).toBe('polygon');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { measureType: 'length', annotationType: 'LineString' } })).toBe('1-measure-length');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { measureType: 'area', annotationType: 'Polygon' } })).toBe('1-measure-area');
        expect(getFeatureIcon({ type: 'Feature', geometry: null, properties: { measureType: 'bearing', annotationType: 'LineString' } })).toBe('1-measure-bearing');
    });
});

