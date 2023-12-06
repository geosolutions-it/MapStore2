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
    getCounter
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
});
