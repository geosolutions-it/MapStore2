/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const {UPDATE_GEOMETRY} = require('../../actions/queryform');
const {changeMapView} = require('../../actions/map');

const {testEpic} = require('./epicTestUtils');
const {viewportSelectedEpic} = require('../wfsquery');

describe('wfsquery Epics', () => {

    it('viewport selected epic', (done) => {
        testEpic(viewportSelectedEpic, 1, changeMapView({x: 0, y: 0, crs: 'EPSG:4326'}, 10, {bounds: {
            minx: -170,
            miny: -50,
            maxx: 170,
            maxy: 50
        }, crs: 'EPSG:4326'}), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                    case UPDATE_GEOMETRY:
                        expect(action.geometry).toEqual({
                            center: [0, 0],
                            coordinates: [[[-170, -50], [-170, 50], [170, 50], [170, -50], [-170, -50]]],
                            extent: [-170, -50, 170, 50],
                            projection: 'EPSG:4326',
                            radius: 0,
                            type: 'Polygon' });
                        break;
                    default:
                        expect(false).toBe(true);
                }
            });
            done();
        }, {queryform: { spatialField: {method: 'Viewport'}}});
    });
});
