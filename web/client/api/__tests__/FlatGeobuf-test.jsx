/*
 * Copyright 2025, GeoSolutions Sas.
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
        getCapabilities(FGB_FILE).then(({ bbox, format, version }) => {
            try {
                expect(format).toBeTruthy();
                expect(format).toBe(FGB);  // read from file extension
                expect(version).toBeTruthy();
                expect(version).toBe(FGB_VERSION);
                expect(bbox).toBeTruthy();
                expect(bbox.crs).toBe('EPSG:4326');
                // TODO add on flatgebouf upgrade > v4.4.5
                // expect(title).toBe('data');
                // expect(crs).toBe('EPSG:4326');
                // TODO get from test file
                // expect(Math.round(bbox.bounds.minx)).toBe(0);
                // expect(Math.round(bbox.bounds.miny)).toBe(0);
                // expect(Math.round(bbox.bounds.maxx)).toBe(0);
                // expect(Math.round(bbox.bounds.maxy)).toBe(0);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
