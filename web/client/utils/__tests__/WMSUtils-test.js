/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    getTileGridFromLayerOptions
} from '../WMSUtils';

describe('Test the WMSUtils', () => {
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
