/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { toggle3d } from '../../actions/globeswitcher';
import assign from 'object-assign';
import { updateRouteOn3dSwitch } from '../globeswitcher';
import { testEpic } from './epicTestUtils';
import { MAP_TYPE_CHANGED } from './../../actions/maptype';

describe('globeswitcher Epics', () => {

    it('toggle to 3d for context maps', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(updateRouteOn3dSwitch, NUM_ACTIONS, assign({}, toggle3d(true, "openlayers"), { hash: "/context/3dmap/123" }), actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case MAP_TYPE_CHANGED:
                    expect(action.mapType).toBe("cesium");
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        }, {
            globeswitcher: { last2dMapType: "openlayers" }
        });
    });
    it('toggle from 3d for context maps', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(updateRouteOn3dSwitch, NUM_ACTIONS, assign({ hash: "/context/3dmap/123" }, toggle3d(false, "cesium")), actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case MAP_TYPE_CHANGED:
                    expect(action.mapType).toBe("openlayers");
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        }, {
            mapType: { last2dMapType: null }
        });
    });
});
