/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { testEpic } from './epicTestUtils';
import { MAPS_LOAD_MAP, MAPS_LIST_LOADED } from '../../actions/maps';
import { DASHBOARDS_LIST_LOADED } from '../../actions/dashboards';
import { GEOSTORIES_LIST_LOADED } from '../../actions/geostories';
import { updateMapsDashboardTabs } from '../contenttabs';

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
