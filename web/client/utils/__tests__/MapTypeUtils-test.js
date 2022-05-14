/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { findMapType, replaceMapType } from '../MapTypeUtils';

const testHashes = [
    ["/viewer/openlayers/1234", "openlayers"],
    ["/viewer/openlayers/new", "openlayers"],
    ["/viewer/openlayers/1234/context/5678", "openlayers"],
    ["/viewer/leaflet/1234", "leaflet"],
    ["/viewer/leaflet/new", "leaflet"],
    ["/viewer/leaflet/1234/context/5678", "leaflet"],
    ["/viewer/cesium/1234", "cesium"],
    ["/viewer/cesium/new", "cesium"],
    ["/viewer/cesium/1234/context/5678", "cesium"],
    ["/viewer/new/", null],
    ["/viewer/1234/", null],
    ["/context/mycontext", null],
    ["/context/mycontext/new", null],
    ["/context/mycontext/1234", null],
    ["/dashboard", null],
    ["/dashboard/1234", null]
];
describe('MapTypeUtils', () => {

    it('findMapType', () => {
        testHashes.forEach(([hash, result]) => {
            expect(findMapType(hash)).toEqual(result);
        });
    });
    it('replaceMapType', () => {
        // some static checks
        expect(replaceMapType("/viewer/openlayers/1234", "leaflet") ).toEqual("/viewer/leaflet/1234");
        expect(replaceMapType("/viewer/cesium/new", "openlayers")).toEqual("/viewer/openlayers/new");
        // follow cases
        testHashes.forEach(([hash, result]) => {
            const mt = findMapType(hash);
            if (mt) {
                expect(replaceMapType(hash, "openlayers")).toEqual(hash.replace(result, "openlayers"));
                expect(replaceMapType(hash, "leaflet")).toEqual(hash.replace(result, "leaflet"));
                expect(replaceMapType(hash, "cesium")).toEqual(hash.replace(result, "cesium"));
            }
        });
    });
    it('testing replaceMapType with viewer regex', () => {
        const urls = [
            {
                url: "/viewer/openlayers/123",
                newMapType: "cesium",
                expected: "/viewer/cesium/123"
            },
            {
                url: "/viewer/openlayers/new/context/123",
                newMapType: "cesium",
                expected: "/viewer/cesium/new/context/123"
            },
            {
                url: "/viewer/cesium/123",
                newMapType: "openlayers",
                expected: "/viewer/openlayers/123"
            },
            {
                url: "/viewer/123",
                newMapType: "cesium",
                expected: "/viewer/123"
            },
            {
                url: "/viewer/123",
                newMapType: "openlayers",
                expected: "/viewer/123"
            },
            {
                url: "/context/ctxName/123",
                newMapType: "openlayers",
                expected: "/context/ctxName/123"
            }
        ];
        urls.forEach(({ url, newMapType, expected }) => {
            expect(replaceMapType(url, newMapType)).toBe(expected);
        });
    });

});
