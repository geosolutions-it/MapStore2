/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { onLocationChanged } from 'connected-react-router';

import { syncMapType } from '../maptype';
import { MAP_TYPE_CHANGED } from '../../actions/maptype';
import { testEpic } from './epicTestUtils';

const NUM_ACTIONS = 1;


describe('maptype epics', () => {

    it('test to switch to cesium when passing to 3d mode', (done) => {
        const STATE = {
            maptype: {
                mapType: "openlayers"
            },
            globeswitcher: {
                last2dMapType: "openlayers"
            }
        };
        testEpic(syncMapType, NUM_ACTIONS, onLocationChanged({pathname: "/viewer/cesium/10358"}, "PUSH" ), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(MAP_TYPE_CHANGED);
            expect(actions[0].mapType).toBe("cesium");
            done();
        }, STATE);
    });
    it('test to switch to last2d cesium when passing to 3d mode', (done) => {
        const STATE_3D = {
            maptype: {
                mapType: "cesium"
            },
            globeswitcher: {
                last2dMapType: "openlayers"
            }
        };
        testEpic(syncMapType, NUM_ACTIONS, onLocationChanged({pathname: "/"}, "PUSH" ), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            expect(actions[0].type).toBe(MAP_TYPE_CHANGED);
            expect(actions[0].mapType).toBe("openlayers");
            done();
        }, STATE_3D);
    });

});
