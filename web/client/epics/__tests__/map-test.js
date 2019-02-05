/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const {resetExtnentOnInit} = require('../map');
const {configureMap} = require('../../actions/config');
const {CHANGE_MAP_MAXEXTENT} = require('../../actions/map');
const {testEpic} = require('./epicTestUtils');
describe('map Epics', () => {

    it('test the re-configuration of the max extent after the initialization of the map', (done) => {
        const state = {
                map: {
                    present: {
                        projection: "EPSG:3857",
                        maxExtent: [100000, 10000, 10000, 10000]
                    }
                },
                localConfig: {
                    mapConstraints: {
                        crs: "EPSG:3857",
                        maxExtent: [1060334.456371965, 5228292.734706056, 1392988.403469052, 5503466.036532691]
                }
            }
        };
        testEpic(resetExtnentOnInit, 1, configureMap(), ([action]) => {
            const { extent, type } = action;
            expect(extent.length).toBe(4);
            expect(extent).toEqual([1060334.456371965, 5228292.734706056, 1392988.403469052, 5503466.036532691]);
            expect(type).toBe(CHANGE_MAP_MAXEXTENT);
            done();
        }, state);
    });
});
