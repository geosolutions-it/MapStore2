/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {
    wmsToOpenlayersOptions,
    generateTileGrid
} from '../WMSUtils';

describe('Test the WMSUtil for OpenLayers', () => {
    it('wmsToOpenlayersOptions', () => {
        const options = {
            type: 'wms',
            url: '/geoserver/wms',
            name: 'workspace:layer'
        };
        expect(wmsToOpenlayersOptions(options)).toEqual({
            LAYERS: 'workspace:layer',
            STYLES: '',
            FORMAT: 'image/png',
            TRANSPARENT: true,
            SRS: 'EPSG:3857',
            CRS: 'EPSG:3857',
            TILED: true,
            VERSION: '1.3.0'
        });
    });
    it('generateTileGrid', () => {
        const options = {
            url: '/geoserver/wms',
            name: 'workspace:layer',
            visibility: true,
            tileGridStrategy: 'custom',
            tileSize: 256,
            tileGrids: [
                {
                    id: 'EPSG:4326',
                    crs: 'EPSG:4326',
                    scales: [ 279541132.0143589, 139770566.00717944, 69885283.00358972 ],
                    origin: [ 90, -180 ],
                    tileSize: [ 256, 256 ]
                },
                {
                    id: 'EPSG:900913',
                    crs: 'EPSG:900913',
                    scales: [ 559082263.9508929, 279541131.97544646, 139770565.98772323 ],
                    origin: [ -20037508.34, 20037508 ],
                    tileSize: [ 256, 256 ]
                }
            ]
        };
        const tileGrid = generateTileGrid(options);
        expect(tileGrid.getResolutions().length).toBe(3);
        expect(tileGrid.getOrigin()).toEqual(options.tileGrids[1].origin);
        expect().toBe();
    });
});
