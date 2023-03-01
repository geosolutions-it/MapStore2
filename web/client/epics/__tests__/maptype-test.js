/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { onLocationChanged } from 'connected-react-router';

import { syncMapType, restore2DMapTypeOnLocationChange  } from '../maptype';
import { changeVisualizationMode, VISUALIZATION_MODE_CHANGED } from '../../actions/maptype';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

const NUM_ACTIONS = 1;


describe('maptype epics', () => {

    it('test to switch to cesium when passing to 3d mode', (done) => {
        const STATE = {
            maptype: {
                mapType: "openlayers"
            }
        };
        testEpic(syncMapType, NUM_ACTIONS, onLocationChanged({ pathname: "/viewer/cesium/10358" }, "PUSH"), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            expect(actions[0].type).toEqual(VISUALIZATION_MODE_CHANGED);
            expect(actions[0].visualizationMode).toEqual("3D");
            done();
        }, STATE);
    });
    it('no-op when the URL do not contain maptype', (done) => {
        const STATE = {
            maptype: {
                mapType: "cesium"
            }
        };
        testEpic(addTimeoutEpic(syncMapType, 20), NUM_ACTIONS, onLocationChanged({ pathname: "/viewer/10358" }, "PUSH"), (actions) => {
            expect(actions[0].type).toEqual(TEST_TIMEOUT);
            done();
        }, STATE);
    });

    it('restore 2D map when changing location from a 3d mode', (done) => {
        const STATE_3D = {
            maptype: {
                mapType: "cesium"
            }
        };
        testEpic(restore2DMapTypeOnLocationChange, NUM_ACTIONS, onLocationChanged({pathname: "/"}, "PUSH" ), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            expect(actions[0].type).toEqual(VISUALIZATION_MODE_CHANGED);
            expect(actions[0].visualizationMode).toEqual("2D");
            done();
        }, STATE_3D);
    });
    it('update location when visualization mode changes', (done) => {
        const STATE = {
            maptype: {
                mapType: "cesium"
            },
            router: {
                location: {
                    pathname: '/viewer/cesium/123'
                }
            }
        };
        testEpic(syncMapType, NUM_ACTIONS, changeVisualizationMode('3D'), ([a1]) => {
            expect(a1.type).toBe("@@router/CALL_HISTORY_METHOD");
            expect(a1.payload.args[0]).toEqual("/viewer/123");
            expect(a1.payload.method).toEqual("replace");
            done();
        }, STATE);
    });

    it('no-op when the URL is one with mapType', (done) => {
        const STATE = {
            maptype: {
                mapType: "cesium"
            },
            router: {
                location: {
                    pathname: '/viewer/123'
                }
            }
        };
        testEpic(addTimeoutEpic(syncMapType, 20), NUM_ACTIONS, changeVisualizationMode('3D'), ([a1]) => {
            expect(a1.type).toBe(TEST_TIMEOUT);
            done();
        }, STATE);
    });
});
