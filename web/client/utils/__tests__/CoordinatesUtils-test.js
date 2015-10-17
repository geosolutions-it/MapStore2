/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var CoordinatesUtils = require('../CoordinatesUtils');
var Proj4js = require('proj4');

describe('CoordinatesUtils', () => {
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('convert lat lon to mercator', () => {
        var point = [45, 13];

        var transformed = CoordinatesUtils.reproject(point, 'EPSG:4326', 'EPSG:900913');

        expect(transformed).toExist();
        expect(transformed.x).toExist();
        expect(transformed.y).toExist();
        expect(transformed.srs).toExist();

        expect(transformed.x).toNotBe(45);
        expect(transformed.y).toNotBe(13);
        expect(transformed.srs).toBe('EPSG:900913');
    });
    it('convert lat lon bbox to marcator bbox', () => {
        var bbox = [44, 12, 45, 13];
        var projbbox = CoordinatesUtils.reprojectBbox(bbox, 'EPSG:4326', 'EPSG:900913');

        expect(projbbox).toExist();
        expect(projbbox.length).toBe(4);
        for (let i = 0; i < 4; i++) {
            expect(projbbox[i]).toNotBe(bbox[i]);
        }
    });
    it('test getAvailableCRS', () => {
        const defs = Object.keys(Proj4js.defs);
        const toCheck = Object.keys(CoordinatesUtils.getAvailableCRS());

        toCheck.forEach(item => {
            expect(defs.indexOf(item) !== -1);
        });
    });
    it('test calculateAzimuth', () => {
        var point1 = [0, 0];
        var point2 = [1, 1];
        var proj = 'EPSG:900913';
        var azimuth = CoordinatesUtils.calculateAzimuth(point1, point2, proj);

        expect(azimuth.toFixed(2)).toBe('45.00');
    });
});
