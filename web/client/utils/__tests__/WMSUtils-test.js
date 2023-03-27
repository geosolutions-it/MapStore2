/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { getLayerOptions } from '../WMSUtils';

describe('Test the WMSUtils', () => {
    it('test getLayerOptions', () => {
        expect(getLayerOptions()).toEqual({});
        const capabilities = {
            Style: { Name: 'generic' },
            Abstract: 'description',
            LatLonBoundingBox: {$: { minx: -180, miny: -90, maxx: 180, maxy: 90 }}
        };
        expect(getLayerOptions(capabilities))
            .toEqual({
                capabilities,
                description: 'description',
                boundingBox: { minx: -180, miny: -90, maxx: 180, maxy: 90 },
                availableStyles: [{ name: 'generic' }]
            });
    });
});
