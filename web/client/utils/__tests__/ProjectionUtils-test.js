/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

import {
    getProjections,
    getProjection,
    isProjectionAvailable
} from '../ProjectionUtils';

import { setConfigProp, removeConfigProp } from '../ConfigUtils';

describe('CoordinatesUtils', () => {
    it('should return default projections with getProjections', () => {
        const projections = getProjections();
        expect(projections).toBeTruthy();
        expect(Object.keys(projections)).toEqual(['EPSG:3857', 'EPSG:4326']);
    });
    it('should return default and configured projections with getProjections', () => {
        const projectionDefs = [
            {
                code: 'EPSG:3003',
                def: '+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs',
                extent: [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
                worldExtent: [6.6500, 8.8000, 12.0000, 47.0500]
            }
        ];
        setConfigProp('projectionDefs',  projectionDefs);
        const projections = getProjections();
        expect(Object.keys(projections)).toEqual(['EPSG:3857', 'EPSG:4326', 'EPSG:3003']);
        removeConfigProp('projectionDefs');
    });
    it('should return extent with getProjection', () => {
        const { extent } = getProjection('EPSG:3857');
        expect(extent).toEqual([ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ]);
    });
    it('should return default extent with getProjection if code is not configured', () => {
        const { extent } = getProjection('EPSG:3003');
        expect(extent).toEqual([ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ]);
    });
    it('should return extent with getProjection if the code has been configured', () => {
        const projectionDefs = [
            {
                code: 'EPSG:3003',
                def: '+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs',
                extent: [ 1241482.0019, 973563.1609, 1830078.9331, 5215189.0853 ],
                worldExtent: [ 6.6500, 8.8000, 12.0000, 47.0500 ]
            }
        ];
        setConfigProp('projectionDefs',  projectionDefs);
        const { extent } = getProjection('EPSG:3003');
        expect(extent).toEqual([ 1241482.0019, 973563.1609, 1830078.9331, 5215189.0853 ]);
        removeConfigProp('projectionDefs');
    });
    it('should detect if a projection is available or not', () => {
        expect(isProjectionAvailable('EPSG:4326')).toBe(true);
        expect(isProjectionAvailable('EPSG:3857')).toBe(true);
        expect(isProjectionAvailable('EPSG:32122')).toBe(false);
    });
});

describe('registerGridFiles', () => {
    let mockProj4Instance;
    let mockAxios;

    beforeEach(() => {
        // Mock proj4 instance
        mockProj4Instance = {
            nadgrid: expect.createSpy()
        };

        // Mock axios using MockAdapter
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('should register GSB grid files successfully', (done) => {
        // Mock successful axios response with ArrayBuffer
        const mockArrayBuffer = new ArrayBuffer(8);

        // Mock the axios GET request
        mockAxios.onGet('/path/to/test.gsb').reply(200, mockArrayBuffer, { 'content-type': 'application/octet-stream' });

        const gridFiles = {
            'test-grid': {
                type: 'gsb',
                path: '/path/to/test.gsb'
            }
        };

        const { registerGridFiles } = require('../ProjectionUtils');

        registerGridFiles(gridFiles, mockProj4Instance).then(() => {
            // Verify proj4 nadgrid was called with correct parameters
            expect(mockProj4Instance.nadgrid).toHaveBeenCalledWith('test-grid', mockArrayBuffer, {includeErrorFields: false});
            done();
        }).catch(done);
    });

});
