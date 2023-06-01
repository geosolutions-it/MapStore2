/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    getDefaultSupportedGetFeatureInfoFormats,
    isValidGetMapFormat,
    isValidGetFeatureInfoFormat,
    getLayerOptions,
    getTileGridFromLayerOptions
} from '../WMSUtils';

describe('Test the WMSUtils', () => {
    it('getDefaultSupportedGetFeatureInfoFormats', () => {
        expect(getDefaultSupportedGetFeatureInfoFormats()).toEqual(['text/plain', 'text/html', 'application/json']);
    });
    it('isValidGetMapFormat', () => {
        expect(isValidGetMapFormat('image/png')).toBe(true);
        expect(isValidGetMapFormat('image/svg')).toBe(false);
    });
    it('isValidGetFeatureInfoFormat', () => {
        expect(isValidGetFeatureInfoFormat('text/plain')).toBe(true);
        expect(isValidGetFeatureInfoFormat('application/vnd.ogc.gml')).toBe(false);
    });
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
    it('test getTileGridFromLayerOptions', () => {
        const tileGrids = [
            {
                id: 'EPSG:32122',
                crs: 'EPSG:32122',
                scales: [ 2557541.55271451, 1278770.776357255, 639385.3881786275 ],
                origins: [ [ 403035.4105968763, 414783 ], [ 403035.4105968763, 414783 ], [ 403035.4105968763, 323121 ] ],
                tileSizes: [[ 512, 512 ], [ 512, 512 ], [ 512, 512 ]]
            },
            {
                id: 'EPSG:900913',
                crs: 'EPSG:900913',
                scales: [ 559082263.9508929, 279541131.97544646, 139770565.98772323 ],
                origin: [ -20037508.34, 20037508 ],
                tileSize: [ 256, 256 ]
            }
        ];
        expect(getTileGridFromLayerOptions({ projection: 'EPSG:3857', tileSize: 256, tileGrids })).toBe(tileGrids[1]);
        expect(getTileGridFromLayerOptions({ projection: 'EPSG:3857', tileSize: 512, tileGrids })).toBe(undefined);
        expect(getTileGridFromLayerOptions({ projection: 'EPSG:32122', tileSize: 512, tileGrids })).toBe(tileGrids[0]);
        expect(getTileGridFromLayerOptions({ projection: 'EPSG:4326', tileSize: 256, tileGrids })).toBe(undefined);
    });
});
