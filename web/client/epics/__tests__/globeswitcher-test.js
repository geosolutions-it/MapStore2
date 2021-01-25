/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { toggle3d, UPDATE_LAST_2D_MAPTYPE } from '../../actions/globeswitcher';
import { localConfigLoaded } from '../../actions/localConfig';
import assign from 'object-assign';
import { replaceMapType, updateRouteOn3dSwitch, updateLast2dMapTypeOnChangeEvents } from '../globeswitcher';
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
            globeswitcher: {last2dMapType: "openlayers"}
        });
    });
    it('toggle from 3d for context maps', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(updateRouteOn3dSwitch, NUM_ACTIONS, assign({ hash: "/context/3dmap/123" }, toggle3d(false, "cesium")), actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case MAP_TYPE_CHANGED:
                    expect(action.mapType).toBe("leaflet");
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        }, {
            globeswitcher: {last2dMapType: "leaflet"}
        });
    });
    it('updates maptype toggling to 3D', (done) => {
        testEpic(updateRouteOn3dSwitch, 1, assign({hash: "/viewer/leaflet/2"}, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case "@@router/CALL_HISTORY_METHOD":
                    expect(action.payload.method).toBe('push');
                    expect(action.payload.args.length).toBe(1);
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        });

    });
    it('updates maptype toggling from 3D', (done) => {
        testEpic(updateRouteOn3dSwitch, 1, assign({ hash: "/viewer/cesium/2" }, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case "@@router/CALL_HISTORY_METHOD":
                    expect(action.payload.method).toBe('push');
                    expect(action.payload.args.length).toBe(1);
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        });

    });

    it('updates maptype on newmap', (done) => {
        testEpic(updateRouteOn3dSwitch, 1, assign({hash: "/viewer/leaflet/new"}, toggle3d(true, "leaflet")), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case "@@router/CALL_HISTORY_METHOD":
                    expect(action.payload.method).toBe('push');
                    expect(action.payload.args.length).toBe(1);
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        });

    });
    it('updateLast2dMapTypeOnChangeEvents', (done) => {
        testEpic(updateLast2dMapTypeOnChangeEvents, 1, [localConfigLoaded(), assign({ hash: "/viewer/leaflet/new" }, toggle3d(true))], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case UPDATE_LAST_2D_MAPTYPE:
                    expect(action.mapType).toBe('leaflet');
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        });

    });
    it('updateLast2dMapTypeOnChangeEvents with custom mapType', (done) => {
        testEpic(updateLast2dMapTypeOnChangeEvents, 1, [localConfigLoaded(), assign({ hash: "/viewer/leaflet/new" }, toggle3d(true))], actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case UPDATE_LAST_2D_MAPTYPE:
                    expect(action.mapType).toBe('openlayers');
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        }, {
            maptype: {
                mapType: 'openlayers'
            }
        });

    });
    it('testing replaceMapType with viewer regex', () => {
        const urls = [
            {
                url: "/viewer/openlayers/123",
                newMapType: "cesium",
                expected: "/viewer/cesium/123"
            },
            {
                url: "/viewer/openlayers/new/context/123",
                newMapType: "cesium",
                expected: "/viewer/cesium/new/context/123"
            },
            {
                url: "/viewer/cesium/123",
                newMapType: "openlayers",
                expected: "/viewer/openlayers/123"
            },
            {
                url: "/viewer/123",
                newMapType: "cesium",
                expected: "/viewer/cesium/123"
            },
            {
                url: "/viewer/123",
                newMapType: "openlayers",
                expected: "/viewer/openlayers/123"
            },
            {
                url: "/context/ctxName/123",
                newMapType: "openlayers",
                expected: "/context/ctxName/123"
            }
        ];
        urls.forEach(({url, newMapType, expected}) => {
            expect(replaceMapType(url, newMapType)).toBe(expected);
        });

    });

});
