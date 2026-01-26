/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    FGB,
    FGB_VERSION,
    getCapabilities
} from '../FlatGeobuf';

const FGB_FILE = 'base/web/client/test-resources/flatgeobuf/UScounties_subset.fgb';

describe('Test FlatGeobuf API', () => {
    it('getCapabilities from FlatGeobuf file', (done) => {
        getCapabilities(FGB_FILE).then(({ bbox, format, version, title}) => {
            try {
                expect(format).toBeTruthy();
                expect(format).toBe(FGB);
                expect(version).toBeTruthy();
                expect(version).toBe(FGB_VERSION);
                expect(bbox.bounds).toEqual({
                    "minx": -106.195372,
                    "miny": 34.604670999999996,
                    "maxx": -95.945802,
                    "maxy": 42.009195
                });
                expect(bbox.crs).toBe('EPSG:4326');
                expect(title).toBe('UScounties_subset');
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
