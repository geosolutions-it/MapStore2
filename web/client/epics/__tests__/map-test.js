/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const {resetLimitsOnInit} = require('../map');
const {configureMap} = require('../../actions/config');
const {CHANGE_MAP_LIMITS, changeMapCrs} = require('../../actions/map');
const {testEpic} = require('./epicTestUtils');
describe('map Epics', () => {

    it('test the re-configuration of the max extent after the initialization of the map', (done) => {
        const state = {
                map: {
                    present: {
                        projection: "EPSG:3857"
                    }
                },
                localConfig: {
                    mapConstraints: {
                        crs: "EPSG:3857",
                        restrictedExtent: [1, 1, 1, 1]
                }
            }
        };
        testEpic(resetLimitsOnInit, 1, configureMap(), ([action]) => {
            const { restrictedExtent, type } = action;
            expect(restrictedExtent.length).toBe(4);
            expect(restrictedExtent).toEqual([1, 1, 1, 1]);
            expect(type).toBe(CHANGE_MAP_LIMITS);
            done();
        }, state);
    });
    it('test changeMapCrs causes limits change. ', (done) => {
        const state = {
            map: {
                present: {
                    projection: "EPSG:1234" // NOTE: this is fake, it should be changed by the reducer after the changeMapCrs action
                }
            },
            localConfig: {
                mapConstraints: {
                    crs: "EPSG:3857",
                    restrictedExtent: [1, 1, 1, 1],
                    projectionsConstraints: {
                        "EPSG:1234": {minZoom: 2}
                    }
                }
            }
        };
        testEpic(resetLimitsOnInit, 1, changeMapCrs("EPSG:1234"), ([action]) => {
            const { restrictedExtent, type, minZoom } = action;
            expect(restrictedExtent.length).toBe(4);
            expect(restrictedExtent).toEqual([1, 1, 1, 1]);
            expect(type).toBe(CHANGE_MAP_LIMITS);
            expect(minZoom).toBe(2);
            done();
        }, state);
    });
});
