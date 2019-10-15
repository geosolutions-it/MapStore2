/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const {testEpic} = require('./epicTestUtils');

const {MAPS_LOAD_MAP, MAPS_LIST_LOADED} = require("../../actions/maps");
const {DASHBOARDS_LIST_LOADED} = require("../../actions/dashboards");
const {GEOSTORIES_LIST_LOADED} = require("../../actions/geostories");
const {updateMapsDashboardTabs} = require("../contenttabs");

describe('Test Maps Dashboard Content Tabs', () => {
    it('test updateMapsDashboardTabs flow ', done => {
        const act = [
            {type: MAPS_LOAD_MAP},
            {type: MAPS_LIST_LOADED, maps: {totalCount: 0}},
            {type: DASHBOARDS_LIST_LOADED, totalCount: 1},
            {type: GEOSTORIES_LIST_LOADED, totalCount: 2}
        ];
        testEpic(updateMapsDashboardTabs, 1, act, (res) => {
            const action = res[0];
            expect(action).toExist();
            expect(action.id).toBe("dashboards");
            done();
        }, {contenttabs: {selected: "maps"}});
    });
});
