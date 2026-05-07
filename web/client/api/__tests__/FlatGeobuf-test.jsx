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
    getCapabilities,
    createFlatGeobufGeometryTypeResolver,
    sniffFlatGeobufFirstGeometryType
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
    describe('createFlatGeobufGeometryTypeResolver', () => {
        it('reports the type resolved from the FGB header', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver({}, (t) => calls.push(t));
            resolver.handleHeader({ geometryType: 3 });
            expect(calls).toEqual(['Polygon']);
            expect(resolver.reported).toBe(true);
        });
        it('ignores Unknown header so feature sniffing can take over', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver({}, (t) => calls.push(t));
            resolver.handleHeader({ geometryType: 0 });
            expect(calls).toEqual([]);
            expect(resolver.reported).toBe(false);
            resolver.sniffFromFeature('LineString');
            expect(calls).toEqual(['LineString']);
            expect(resolver.reported).toBe(true);
        });
        it('does not call onChange when config already provides a type (config wins)', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver(
                { geometryType: 'Polygon' },
                (t) => calls.push(t)
            );
            resolver.handleHeader({ geometryType: 1 }); // would otherwise report 'Point'
            expect(calls).toEqual([]);
            // marked reported so subsequent feature sniffing doesn't fire either
            expect(resolver.reported).toBe(true);
            resolver.sniffFromFeature('Point');
            expect(calls).toEqual([]);
        });
        it('does not call onChange when getCurrent already matches', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver(
                {},
                (t) => calls.push(t),
                () => 'Polygon'
            );
            resolver.handleHeader({ geometryType: 3 });
            expect(calls).toEqual([]);
        });
        it('only fires once across header + sniff', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver({}, (t) => calls.push(t));
            resolver.handleHeader({ geometryType: 1 });
            resolver.sniffFromFeature('LineString');
            resolver.sniffFromFeature('Polygon');
            expect(calls).toEqual(['Point']);
        });
        it('ignores empty / undefined sniff inputs', () => {
            const calls = [];
            const resolver = createFlatGeobufGeometryTypeResolver({}, (t) => calls.push(t));
            resolver.sniffFromFeature(undefined);
            resolver.sniffFromFeature('');
            expect(resolver.reported).toBe(false);
            resolver.sniffFromFeature('Point');
            expect(calls).toEqual(['Point']);
        });
    });
    describe('sniffFlatGeobufFirstGeometryType', () => {
        it('reads the first feature geometry type from a real FGB file', (done) => {
            // Guards against two real bugs surfaced during development:
            //  - flatgeobuf streamSearch crashes on undefined rect
            //    (FGB_MATCH_ALL_RECT covers that)
            //  - the iterator must yield at least one feature before being
            //    cancelled (the .next() resolution before iterator.return())
            // The fixture's header reports geometryType=3 (Polygon).
            sniffFlatGeobufFirstGeometryType(FGB_FILE).then((type) => {
                try {
                    expect(type).toBe('Polygon');
                } catch (e) {
                    done(e);
                    return;
                }
                done();
            }, done);
        });
    });
});
