/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {
    wmsToCesiumOptionsBIL,
    wmsToCesiumOptions,
    wmsToCesiumOptionsSingleTile
} from '../WMSUtils';

const testLayerConfig = {
    "type": "terrain",
    "provider": "wms",
    "url": "http://sample.com/geoserver/wms",
    "name": "workspace:layername",
    "littleendian": false,
    "visibility": true,
    "version": "1.3.0",
    "fixedHeight": null,
    "fixedWidth": null,
    "crs": "CRS:84",
    "styleName": null
};

describe('Test the WMSUtil for Cesium', () => {
    it('wmsToCesiumOptionsBIL with proxy', () => {
        let config = wmsToCesiumOptionsBIL({...testLayerConfig, forceProxy: true});
        expect(config.url).toBe(testLayerConfig.url);
        expect(config.proxy.getURL("test")).toBe("/mapstore/proxy/?url=test");
        expect(config.layerName).toBe(testLayerConfig.name);
        expect(config.littleEndian).toBe(testLayerConfig.littleendian);
        expect(config.version).toBe(testLayerConfig.version);
        expect(config.crs).toBe(testLayerConfig.crs);
    });
    it('wmsToCesiumOptionsBIL with no proxy', () => {
        const testConfig = {...testLayerConfig, url: [location.href], noCors: false};
        let config = wmsToCesiumOptionsBIL(testConfig);
        expect(config.url).toBe(testConfig.url);
        expect(config.proxy.getURL("test")).toBe("test");
        expect(config.layerName).toBe(testConfig.name);
        expect(config.crs).toBe(testConfig.crs);
    });
    it('wmsToCesiumOptions', () => {
        const options = {
            type: 'wms',
            url: '/geoserver/wms',
            name: 'workspace:layer'
        };
        const cesiumOptions = wmsToCesiumOptions(options);
        expect(cesiumOptions.url.url).toBe('{s}');
        expect(cesiumOptions.subdomains).toEqual([ '/geoserver/wms' ]);
        expect(cesiumOptions.layers).toBe('workspace:layer');
        expect(cesiumOptions.parameters).toEqual({
            styles: '',
            version: '1.1.1',
            format: 'image/png',
            transparent: true,
            opacity: 1,
            tiled: true,
            width: 256,
            height: 256
        });
    });
    it('wmsToCesiumOptions with version', () => {
        const options = {
            type: 'wms',
            version: '1.3.0',
            url: '/geoserver/wms',
            name: 'workspace:layer'
        };
        const cesiumOptions = wmsToCesiumOptions(options);
        expect(cesiumOptions.parameters.version).toBe('1.3.0');
    });
    it('wmsToCesiumOptionsSingleTile', () => {
        const options = {
            type: 'wms',
            url: '/geoserver/wms',
            name: 'workspace:layer',
            _v_: '0123456789'
        };
        const cesiumOptions = wmsToCesiumOptionsSingleTile(options);
        expect(cesiumOptions.url.url).toBe('/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&styles=&format=image%2Fpng&transparent=true&opacity=1&TILED=true&layers=workspace%3Alayer&width=2000&height=2000&bbox=-180.0%2C-90%2C180.0%2C90&srs=EPSG%3A4326&_v_=0123456789');
    });
});
