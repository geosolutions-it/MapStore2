/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { localConfigLoaded } from '../../actions/localConfig';

import { onLocationChanged } from 'connected-react-router';

import { syncMapType, updateLast2dMapTypeOnChangeEvents, restore2DMapTypeOnLocationChange  } from '../maptype';
import { changeMapType, MAP_TYPE_CHANGED, UPDATE_LAST_2D_MAPTYPE } from '../../actions/maptype';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

const NUM_ACTIONS = 1;


describe('maptype epics', () => {

    it('test to switch to cesium when passing to 3d mode', (done) => {
        const STATE = {
            maptype: {
                mapType: "openlayers",
                last2dMapType: "openlayers"
            }
        };
        testEpic(syncMapType, NUM_ACTIONS, onLocationChanged({ pathname: "/viewer/cesium/10358" }, "PUSH"), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            expect(actions[0].type).toEqual(MAP_TYPE_CHANGED);
            expect(actions[0].mapType).toEqual("cesium");
            done();
        }, STATE);
    });
    it('no-op when the URL do not contain maptype', (done) => { // restore of last2d type delegated to another epic
        const STATE = {
            maptype: {
                mapType: "cesium",
                last2dMapType: "openlayers"
            }
        };
        testEpic(addTimeoutEpic(syncMapType, 20), NUM_ACTIONS, onLocationChanged({ pathname: "/viewer/10358" }, "PUSH"), (actions) => {
            expect(actions[0].type).toEqual(TEST_TIMEOUT);
            done();
        }, STATE);
    });

    it('restore last2d cesium when changing location from a 3d mode', (done) => {
        const STATE_3D = {
            maptype: {
                mapType: "cesium",
                last2dMapType: "openlayers"
            }
        };
        testEpic(restore2DMapTypeOnLocationChange, NUM_ACTIONS, onLocationChanged({pathname: "/"}, "PUSH" ), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            expect(actions[0].type).toEqual(MAP_TYPE_CHANGED);
            expect(actions[0].mapType).toEqual("openlayers");
            done();
        }, STATE_3D);
    });
    it('restore default last2d cesium when changing location from a 3d mode', (done) => {
        const STATE_3D = {
            maptype: {
                mapType: "cesium",
                last2dMapType: null
            }
        };
        testEpic(restore2DMapTypeOnLocationChange, NUM_ACTIONS, onLocationChanged({pathname: "/"}, "PUSH" ), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            expect(actions[0].type).toEqual(MAP_TYPE_CHANGED);
            expect(actions[0].mapType).toEqual("openlayers");
            done();
        }, STATE_3D);
    });
    it('update location when map type changes', (done) => {
        const STATE = {
            maptype: {
                mapType: "cesium",
                last2dMapType: "openlayers"
            }
        };
        // fake location.hash with hash in action
        testEpic(syncMapType, NUM_ACTIONS, {... changeMapType('cesium'), hash: '/viewer/openlayers/123'}, ([a1]) => {
            expect(a1.type).toBe("@@router/CALL_HISTORY_METHOD");
            expect(a1.payload.args[0]).toEqual("/viewer/cesium/123");
            expect(a1.payload.method).toEqual("push");
            done();
        }, STATE);
    });

    it('no-op when the URL is one with mapType', (done) => {
        const STATE = {
            maptype: {
                mapType: "cesium",
                last2dMapType: "openlayers"
            }
        };
        // fake location.hash with hash in action
        testEpic(addTimeoutEpic(syncMapType, 20), NUM_ACTIONS, { ...changeMapType('cesium'), hash: '/viewer/123' }, ([a1]) => {
            expect(a1.type).toBe(TEST_TIMEOUT);
            done();
        }, STATE);
    });
    it('updateLast2dMapTypeOnChangeEvents', (done) => {
        const STATE = {
            maptype: {
                mapType: "openlayers",
                last2dMapType: "openlayers"
            }
        };
        testEpic(updateLast2dMapTypeOnChangeEvents, 3, [localConfigLoaded(), changeMapType("cesium"), changeMapType("leaflet"), changeMapType("cesium"), changeMapType("openlayers")],
            ([a1, a2, a3]) => {
                [a1, a2, a3].map((action) => expect(action.type).toEqual(UPDATE_LAST_2D_MAPTYPE));
                expect(a1.mapType).toEqual('openlayers');
                expect(a2.mapType).toEqual('leaflet');
                expect(a3.mapType).toEqual('openlayers');
                done();
            }, STATE);

    });

});
