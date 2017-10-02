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

const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');
const {QUERY_RESULT, FEATURE_LOADING, query, updateQuery} = require('../../actions/wfsquery');
const {viewportSelectedEpic, wfsQueryEpic} = require('../wfsquery');


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
    it('wfsQueryEpic', (done) => {
        const expectedResult = require('json-loader!../../test-resources/wfs/museam.json');
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result).toEqual(expectedResult);
                        break;
                    case FEATURE_LOADING:
                        break;
                    default:
                        expect(false).toBe(true);
                }
            });
            done();
        }, {});
    });
    // this avoids race condition of state changes when update query is performed
    it('wfsQueryEpic stop on update query', (done) => {
        testEpic(addTimeoutEpic(wfsQueryEpic), 2, [
            query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }),
            updateQuery()
            ], actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                        case TEST_TIMEOUT:
                            break;
                        case FEATURE_LOADING:
                            break;
                        default:
                            expect(false).toBe(true);
                    }
                });
                done();
            }, {});
    });
});
