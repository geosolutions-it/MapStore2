/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const ElevationUtils = require('../ElevationUtils');

describe('ElevationUtils', () => {
    beforeEach( () => {
        ElevationUtils.reset({
            max: 1
        });
    });
    afterEach(() => {
        ElevationUtils.reset();
    });
    it('loads and stores elevation', (done) => {
        ElevationUtils.loadTile('base/web/client/test-resources/elevation.bin', {}, 'mykey').then(() => {
            const elev = ElevationUtils.getElevation('mykey', { x: 0, y: 0 }, 256);
            expect(elev.available).toBe(true);
            expect(elev.value).toBe(24929);
            done();
        });
    });
    it('loads and stores max items', (done) => {
        ElevationUtils.loadTile('base/web/client/test-resources/elevation.bin', {}, 'mykey').then(() => {
            ElevationUtils.loadTile('base/web/client/test-resources/elevation.bin', {}, 'mykey2').then(() => {
                const elev = ElevationUtils.getElevation('mykey', { x: 0, y: 0 }, 256);
                expect(elev.available).toBe(false);
                const elev2 = ElevationUtils.getElevation('mykey2', { x: 0, y: 0 }, 256);
                expect(elev2.available).toBe(true);
                done();
            });
        });
    });
});
