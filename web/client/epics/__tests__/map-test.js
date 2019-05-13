/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const { testEpic} = require('./epicTestUtils');

const {MAP_INFO_LOAD_START} = require('../../actions/config');
const {LOGIN_SUCCESS} = require('../../actions/security');

const {checkMapPermissions} = require('../map');
const LAYOUT_STATE = {
    layout: {
        left: 200,
        right: 0,
        bottom: '35%',
        dockSize: 35,
        transform: 'translate(0, -30px)',
        height: 'calc(100% - 30px)'
    },
    boundingMapRect: {
        bottom: '35%',
        dockSize: 35,
        left: 200,
        right: 0
    }
};
const MAP_STATE = {
    projection: "EPSG:4326",
    mapId: 10112,
    size: { width: 400, height: 400 },
    bbox: {
        bounds: {
            minx: -20,
            miny: -20,
            maxx: 0,
            maxy: 0
        },
        crs: 'EPSG:4326',
        rotation: 0
    }
};

const STATE_NORMAL = {
    map: {
        present: MAP_STATE
    },
    maplayout: LAYOUT_STATE
};


describe('map epics', () => {

    it('checkMapPermissions after login', (done) => {
        const dispatch = (a) => {
            expect(a).toExist();
            expect(a.type).toBe(MAP_INFO_LOAD_START);
            done();
        };
        testEpic(checkMapPermissions, 1, {type: LOGIN_SUCCESS}, ([a0]) => {
            expect(a0).toExist();
            expect(a0).toBeA('function');
            a0(dispatch);
        }, STATE_NORMAL);
    });
});
