/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import GeoJSONStyledFeatures from '../GeoJSONStyledFeatures';

describe('Test GeoJSONStyledFeatures', () => {
    it('it should exclude invalid features', () => {
        const styledFeatures = new GeoJSONStyledFeatures({
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [7, 41], [7, 41], [7, 41]]]
                },
                properties: {}
            }]
        });
        expect(styledFeatures._features.length).toBe(0);
    });
    it('it should include valid features', () => {
        const styledFeatures = new GeoJSONStyledFeatures({
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [7, 41], [7, 41], [7, 41]]]
                },
                properties: {}
            }, {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46]]]
                },
                properties: {}
            }]
        });
        expect(styledFeatures._features.length).toBe(1);
    });
});
