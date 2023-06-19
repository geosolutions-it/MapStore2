/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { applyDefaultStyleToVectorLayer } from '../StyleUtils';

describe('StyleUtils', () => {
    it('should add default style if the layer id providing an empty style object with applyDefaultStyleToVectorLayer (point geometry)', () => {
        const layer = { features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } }] };
        const newLayerWithStyle = applyDefaultStyleToVectorLayer(layer);
        expect(newLayerWithStyle.style.format).toBe('geostyler');
        expect(newLayerWithStyle.style.metadata).toEqual({ editorType: 'visual' });
        expect(newLayerWithStyle.style.body.rules.length).toBe(1);
        expect(newLayerWithStyle.style.body.rules.map(({ symbolizers }) => symbolizers[0]?.kind)).toEqual(['Mark']);
    });
    it('should add default style if the layer id providing an empty style object with applyDefaultStyleToVectorLayer (line geometry)', () => {
        const layer = { features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }] };
        const newLayerWithStyle = applyDefaultStyleToVectorLayer(layer);
        expect(newLayerWithStyle.style.format).toBe('geostyler');
        expect(newLayerWithStyle.style.metadata).toEqual({ editorType: 'visual' });
        expect(newLayerWithStyle.style.body.rules.length).toBe(1);
        expect(newLayerWithStyle.style.body.rules.map(({ symbolizers }) => symbolizers[0]?.kind)).toEqual(['Line']);
    });
    it('should add default style if the layer id providing an empty style object with applyDefaultStyleToVectorLayer (polygon geometry)', () => {
        const layer = { features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [2, 1], [0, 0]]] } }] };
        const newLayerWithStyle = applyDefaultStyleToVectorLayer(layer);
        expect(newLayerWithStyle.style.format).toBe('geostyler');
        expect(newLayerWithStyle.style.metadata).toEqual({ editorType: 'visual' });
        expect(newLayerWithStyle.style.body.rules.length).toBe(1);
        expect(newLayerWithStyle.style.body.rules.map(({ symbolizers }) => symbolizers[0]?.kind)).toEqual(['Fill']);
    });
    it('should add default style if the layer id providing an empty style object with applyDefaultStyleToVectorLayer (geometry collection)', () => {
        const layer = { features: [
            { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } },
            { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [2, 1], [0, 0]]] } }
        ] };
        const newLayerWithStyle = applyDefaultStyleToVectorLayer(layer);
        expect(newLayerWithStyle.style.format).toBe('geostyler');
        expect(newLayerWithStyle.style.metadata).toEqual({ editorType: 'visual' });
        expect(newLayerWithStyle.style.body.rules.length).toBe(3);
        expect(newLayerWithStyle.style.body.rules.map(({ symbolizers }) => symbolizers[0]?.kind)).toEqual(['Mark', 'Line', 'Fill']);
    });
});
