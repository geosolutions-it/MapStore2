/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const WMTSUtils = require('../WMTSUtils');

describe('Test the WMTSUtils', () => {
    it('get matrix ids with object', () => {
        const ids = WMTSUtils.getMatrixIds({
            "EPSG:4326": [{
                identifier: 'EPSG:4326'
            }]
        }, 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0]).toBe('EPSG:4326');
    });

    it('get matrix ids with array', () => {
        const ids = WMTSUtils.getMatrixIds([{
                identifier: 'EPSG:4326'
            }], 'EPSG:4326');
        expect(ids.length).toBe(1);
        expect(ids[0]).toBe('EPSG:4326');
    });
});
