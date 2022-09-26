/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import { wmsToCesiumOptionsBIL } from '../WMSUtils';

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
        let config = wmsToCesiumOptionsBIL(testLayerConfig);
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
});
