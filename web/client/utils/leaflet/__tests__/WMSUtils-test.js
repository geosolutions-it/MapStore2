/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {
    filterWMSParamOptions,
    wmsToLeafletOptions,
    removeNulls,
    getWMSURLs
} from '../WMSUtils';

describe('Test the WMSUtil for Leaflet', () => {
    it('filterWMSParamOptions', () => {
        expect(filterWMSParamOptions({ layers: 'workspace:layer', styles: 'default', opacity: 1 }))
            .toEqual({ layers: 'workspace:layer', styles: 'default' });
    });
    it('wmsToLeafletOptions', () => {
        const options = {
            type: 'wms',
            url: '/geoserver/wms',
            name: 'workspace:layer'
        };
        expect(wmsToLeafletOptions(options)).toEqual({
            attribution: undefined,
            layers: 'workspace:layer',
            styles: '',
            format: 'image/png',
            transparent: true,
            TILED: true,
            opacity: 1,
            zIndex: undefined,
            version: '1.3.0',
            tileSize: 256,
            maxZoom: 23,
            maxNativeZoom: 18
        });
    });
    it('removeNulls', () => {
        const options = {
            attribution: undefined,
            layers: 'workspace:layer',
            styles: '',
            format: 'image/png',
            transparent: true,
            TILED: true,
            opacity: 1,
            zIndex: undefined,
            version: '1.3.0',
            tileSize: 256,
            maxZoom: 23,
            maxNativeZoom: 18,
            customProperty: null
        };
        expect(removeNulls(options)).toEqual({
            layers: 'workspace:layer',
            styles: '',
            format: 'image/png',
            transparent: true,
            TILED: true,
            opacity: 1,
            version: '1.3.0',
            tileSize: 256,
            maxZoom: 23,
            maxNativeZoom: 18
        });
    });
    it('getWMSURLs', () => {
        expect(getWMSURLs([
            '/a/geoserver/wms?version=1.3.0',
            '/b/geoserver/wms'
        ])).toEqual([
            '/a/geoserver/wms',
            '/b/geoserver/wms'
        ]);
    });
});
