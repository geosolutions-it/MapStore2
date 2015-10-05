/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var {
    dpi2dpm,
    getSphericalMercatorScales,
    getSphericalMercatorScale,
    getGoogleMercatorScales,
    getGoogleMercatorScale,
    getZoomForExtent,
    getCenterForExtent
} = require('../MapUtils');

describe('Test the MapUtils', () => {
    it('dpi2dpm', () => {
        const inch2mm = 25.4;
        const testDPI = 96;
        const dpmm = testDPI / inch2mm;
        expect(dpi2dpm(testDPI).toFixed(6)).toBe((1000 * dpmm).toFixed(6));
    });
    it('getSphericalMercatorScale', () => {
        expect(getSphericalMercatorScale(1, 1, 1, 1, 1)).toBe(2 * Math.PI * dpi2dpm(1));
        expect(getSphericalMercatorScale(1, 1, 1, 1)).toBe(2 * Math.PI * dpi2dpm(96));
    });
    it('getGoogleMercatorScale', () => {
        expect(getGoogleMercatorScale(1, 1)).toBe(getSphericalMercatorScale(6378137, 256, 2, 1, 1));
        expect(getGoogleMercatorScale(1)).toBe(getSphericalMercatorScale(6378137, 256, 2, 1, 96));
    });
    it('getSphericalMercatorScales', () => {
        expect(getSphericalMercatorScales(1, 1, 1, 1, 1, 1).length).toBe(1);
    });
    it('getGoogleMercatorScales', () => {
        expect(getGoogleMercatorScales(1, 1, 1).length).toBe(1);
    });
    it('getZoomForExtent', () => {
        var extent = [1880758.3574092742, 6084533.340409827, 1291887.4915002766, 5606954.787684047];
        var mapSize = {height: 781, width: 963};
        expect(getZoomForExtent(extent, mapSize, 0, 21, 96)).toBe(8);
    });
    it('getCenterForExtent', () => {
        var extent = [934366.2338, -3055035.1465, 2872809.2711, -2099878.0411];
        var ctr = getCenterForExtent(extent, "EPSG:900913");
        expect(ctr.x.toFixed(4)).toBe('1903587.7525');
        expect(ctr.y.toFixed(4)).toBe('-2577456.5938');
        expect(ctr.crs).toBe("EPSG:900913");
    });
});
