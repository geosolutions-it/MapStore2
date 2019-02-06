/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const expect = require('expect');

const {resetExtentOnInit} = require('../map');
const {configureMap} = require('../../actions/config');
const {CHANGE_MAP_EXTENTS} = require('../../actions/map');
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
        testEpic(resetExtentOnInit, 1, configureMap(), ([action]) => {
            const { restrictedExtent, type } = action;
            expect(restrictedExtent.length).toBe(4);
            expect(restrictedExtent).toEqual([1, 1, 1, 1]);
            expect(type).toBe(CHANGE_MAP_EXTENTS);
            done();
        }, state);
    });
});
