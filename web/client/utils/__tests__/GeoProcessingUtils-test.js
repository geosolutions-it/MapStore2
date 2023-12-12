/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    createFC,
    getCounter,
    createFeatureId,
    transformLineToArc
} from '../GeoProcessingUtils';
import {
    GPT_BUFFER_GROUP_ID
} from '../../actions/geoProcessing';
describe('GeoProcessing utils', () => {
    it('test createFC', () => {
        const features = [{
            type: "Feature",
            id: "ft-id",
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        }];
        const ftColl = createFC(features);
        expect(ftColl).toEqual({ type: 'FeatureCollection', features: [ { type: 'Feature', id: 'ft-id', geometry: { type: 'Point', coordinates: [ 1, 2 ] } } ] });
    });
    it('test getCounter', () => {
        const layers = [{
            group: GPT_BUFFER_GROUP_ID,
            name: "Buffer Layer 0"
        }];
        const counter = getCounter(layers, GPT_BUFFER_GROUP_ID);
        expect(counter).toEqual(1);
        const counter2 = getCounter([
            ...layers,
            {
                group: GPT_BUFFER_GROUP_ID,
                name: "Buffer Layer 3"
            },
            {
                group: GPT_BUFFER_GROUP_ID,
                name: "Buffer Layer 4"
            }
        ], GPT_BUFFER_GROUP_ID);
        expect(counter2).toEqual(5);
    });
    it('test createFeatureId', () => {
        let id = createFeatureId({}, 0);
        expect(id).toEqual("Feature #0");
        id = createFeatureId({id: "test"}, 0);
        expect(id).toEqual("test");
    });
    it('test transformLineToArc', () => {
        let ft = transformLineToArc({}, 0);
        expect(ft).toEqual({});
        ft = transformLineToArc({
            geometry: {
                coordinates: [[1, 1], [2, 2]]
            },
            properties: {
                geodesic: true
            }
        }, 0);
        expect(ft.geometry.coordinates.length).toEqual(100);
    });
});
