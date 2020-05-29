/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { set } = require('../../utils/ImmutableUtils');
const { LOCATION_CHANGE } = require('connected-react-router');


const { resetLimitsOnInit, zoomToExtentEpic, checkMapPermissions, compareMapChanges, redirectUnauthorizedUserOnNewMap} = require('../map');
const { CHANGE_MAP_LIMITS, changeMapCrs } = require('../../actions/map');

const { LOAD_MAP_INFO, configureMap, configureError} = require('../../actions/config');

const { testEpic, addTimeoutEpic, TEST_TIMEOUT } = require('./epicTestUtils');
const MapUtils = require('../../utils/MapUtils');

const {
    CHANGE_MAP_VIEW,
    zoomToExtent,
    checkMapChanges
} = require('../../actions/map');


const { LOGIN_SUCCESS, logout } = require('../../actions/security');
const {SET_CONTROL_PROPERTY} = require('../../actions/controls');

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
const MAP_STATE_FULL = {
    MAP_STATE,
    projection: "EPSG:900913",
    bbox: {
        bounds: {
            minx: -118268262.13263306,
            miny: -70992265.88634938,
            maxx: 178067701.0931485,
            maxy: 75062384.76851285
        }
    }
};
const STATE_NORMAL = {
    map: {
        present: MAP_STATE
    },
    maplayout: LAYOUT_STATE
};

const STATE_FULL = {
    map: {
        present: MAP_STATE_FULL,
        maplayout: LAYOUT_STATE
    }
};
describe('map epics', () => {

    it('zoomToExtentEpic', (done) => {
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        testEpic(zoomToExtentEpic, 1, zoomToExtent([10, 44, 12, 46], "EPSG:4326"), ([a0]) => {
            expect(a0).toExist();
            expect(a0.type).toBe(CHANGE_MAP_VIEW);
            expect(a0.center.x).toBe(11);
            expect(a0.center.y).toBe(45);
            expect(a0.zoom).toBeGreaterThan(4);
            expect(a0.bbox).toExist();
            expect(a0.bbox.bounds).toExist();
            expect(a0.bbox.bounds.minx).toBe(10);
            expect(a0.bbox.bounds.miny).toBe(44);
            expect(a0.bbox.bounds.maxx).toBe(12);
            expect(a0.bbox.bounds.maxy).toBe(46);
            done();
        }, STATE_NORMAL);
    });
    it('zoomToExtentEpic clean up strings and convert object into array', (done) => {
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        testEpic(zoomToExtentEpic, 1, zoomToExtent({
            minx: "10",
            miny: "44",
            maxx: "12",
            maxy: "46"
        }, "EPSG:4326"), ([a0]) => {
            expect(a0).toExist();
            expect(a0.type).toBe(CHANGE_MAP_VIEW);
            expect(a0.center.x).toBe(11);
            expect(a0.center.y).toBe(45);
            expect(a0.zoom).toBeGreaterThan(4);
            expect(a0.bbox).toExist();
            expect(a0.bbox.bounds).toExist();
            expect(a0.bbox.bounds.minx).toBe(10);
            expect(a0.bbox.bounds.miny).toBe(44);
            expect(a0.bbox.bounds.maxx).toBe(12);
            expect(a0.bbox.bounds.maxy).toBe(46);
            done();
        }, STATE_NORMAL);
    });
    // state = mapConfig({ projection: "EPSG:900913" }, action2);
    it('zoomToExtentEpic with full extent', (done) => {
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        testEpic(zoomToExtentEpic, 1, zoomToExtent([-180, -90, 180, 90], "EPSG:4326"), ([a0]) => {
            expect(a0).toExist();
            expect(a0.type).toBe(CHANGE_MAP_VIEW);
            expect(a0.zoom).toBe(1);
            expect(a0.bbox).toExist();
            expect(a0.bbox.bounds).toExist();
            expect(a0.bbox.bounds.minx).toBe(-180);
            expect(a0.bbox.bounds.miny).toExist(-90);
            expect(a0.bbox.bounds.maxx).toExist(180);
            expect(a0.bbox.bounds.maxy).toExist(90);
            done();
        }, STATE_FULL);
    });
    it('zoomToExtentEpic with max zoom', (done) => {
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        testEpic(zoomToExtentEpic, 1, zoomToExtent([10, 44, 12, 46], "EPSG:4326", 4), ([a0]) => {
            expect(a0).toExist();
            expect(a0.type).toBe(CHANGE_MAP_VIEW);
            expect(a0.center.x).toBe(11);
            expect(a0.center.y).toBe(45);
            expect(a0.zoom).toBe(4);
            expect(a0.bbox).toExist();
            expect(a0.bbox.bounds).toExist();
            expect(a0.bbox.bounds.minx).toBe(10);
            expect(a0.bbox.bounds.miny).toBe(44);
            expect(a0.bbox.bounds.maxx).toBe(12);
            expect(a0.bbox.bounds.maxy).toBe(46);
            done();
        }, STATE_NORMAL);
    });

    it('zoomToExtentEpic with hook', (done) => {
        const handlers = {
            hook: () => {}
        };
        const spy = expect.spyOn(handlers, 'hook').andCall( () => {
            expect(spy.calls.length).toBe(1);
            expect(spy.calls[0].arguments[0]).toEqual([10, 44, 12, 46]);
            expect(spy.calls[0].arguments[1]).toEqual({
                crs: "EPSG:4326",
                padding: {
                    left: 200,
                    bottom: 140,
                    right: 0,
                    top: 0
                },
                maxZoom: 4
            });
            // unregister
            MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK);

        });
        MapUtils.registerHook(MapUtils.ZOOM_TO_EXTENT_HOOK, handlers.hook);
        testEpic(addTimeoutEpic(zoomToExtentEpic, 0), 1, zoomToExtent([10, 44, 12, 46], "EPSG:4326", 4), ([a]) => {
            expect(a.type).toBe(TEST_TIMEOUT);
            done();
        }, STATE_NORMAL);
    });
    it('checkMapPermissions after login', (done) => {
        const checkActions = ([a]) => {
            expect(a).toExist();
            expect(a.type).toBe(LOAD_MAP_INFO);
            done();
        };
        testEpic(checkMapPermissions, 1, {type: LOGIN_SUCCESS}, checkActions, STATE_NORMAL);
    });
    it('checkMapPermissions after login with no mapId', (done) => {
        testEpic(addTimeoutEpic(checkMapPermissions, 0), 1, {type: LOGIN_SUCCESS}, ([a]) => {
            expect(a.type).toBe(TEST_TIMEOUT);
            done();
        }, {});
    });
    it('test the re-configuration of the max extent after the initialization of the map', (done) => {
        const state = {
            map: {
                present: {
                    projection: "EPSG:3857"
                }
            },
            localConfig: {
                mapConstraints: {
                    crs: "EPSG:3857",
                    restrictedExtent: [1, 1, 1, 1]
                }
            }
        };
        testEpic(resetLimitsOnInit, 1, configureMap(), ([action]) => {
            const { restrictedExtent, type } = action;
            expect(restrictedExtent.length).toBe(4);
            expect(restrictedExtent).toEqual([1, 1, 1, 1]);
            expect(type).toBe(CHANGE_MAP_LIMITS);
            done();
        }, state);
    });
    it('test changeMapCrs causes limits change. ', (done) => {
        const state = {
            map: {
                present: {
                    projection: "EPSG:1234" // NOTE: this is fake, it should be changed by the reducer after the changeMapCrs action
                }
            },
            localConfig: {
                mapConstraints: {
                    crs: "EPSG:3857",
                    restrictedExtent: [1, 1, 1, 1],
                    projectionsConstraints: {
                        "EPSG:1234": { minZoom: 2 }
                    }
                }
            }
        };
        testEpic(resetLimitsOnInit, 1, changeMapCrs("EPSG:1234"), ([action]) => {
            const { restrictedExtent, type, minZoom } = action;
            expect(restrictedExtent.length).toBe(4);
            expect(restrictedExtent).toEqual([1, 1, 1, 1]);
            expect(type).toBe(CHANGE_MAP_LIMITS);
            expect(minZoom).toBe(2);
            done();
        }, state);
    });
    describe('compareMapChanges', () => {
        const SAME_MAP_STATE = {
            map: {
                present: {
                    mapId: '1',
                    info: {
                        canEdit: true
                    }
                }
            },
            feedbackMask: {
                currentPage: 'viewer'
            },
            layers: [
                {
                    allowedSRS: {},
                    bbox: {},
                    dimensions: [],
                    id: "layer001",
                    loading: true,
                    name: "layer001",
                    params: {},
                    search: {},
                    singleTile: false,
                    thumbURL: "THUMB_URL",
                    title: "layer001",
                    type: "wms",
                    url: "",
                    visibility: true,
                    catalogURL: "url"
                }
            ],
            backgroundSelector: {
                backgrounds: [
                    { id: 'layer005', thumbnail: 'data' },
                    { id: 'layer006', thumbnail: null }
                ]
            },
            mapConfigRawData: {
                "version": 2,
                "map": {
                    "mapOptions": {},
                    "layers": [
                        {
                            "id": "layer001",
                            "thumbURL": "THUMB_URL",
                            "search": {},
                            "name": "layer001",
                            "title": "layer001",
                            "type": "wms",
                            "url": "",
                            "bbox": {},
                            "visibility": true,
                            "singleTile": false,
                            "allowedSRS": {},
                            "dimensions": [],
                            "hideLoading": false,
                            "handleClickOnLayer": false,
                            "catalogURL": "url",
                            "useForElevation": false,
                            "hidden": false,
                            "params": {}
                        }
                    ],
                    "groups": [],
                    "backgrounds": [
                        {
                            "id": "layer005",
                            "thumbnail": "data"
                        }
                    ]
                },
                "catalogServices": {},
                "widgetsConfig": {},
                "mapInfoConfiguration": {}
            }
        };
        const CHANGED_MAP_STATE = set("map.present.zoom", 10, SAME_MAP_STATE);
        const NOT_EDITABLE_STATE = set("map.present.info.canEdit", false, SAME_MAP_STATE);
        it('shouldn\'t do anything if current view is different than map', (done) => {
            const state = {
                feedbackMask: {
                    currentPage: ''
                }
            };

            const epicResponse = (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(compareMapChanges, 10), 1, checkMapChanges(), epicResponse, state);
        });
        it('shouldn\'t do anything if map not editable', (done) => {
            const epicResponse = (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };
            testEpic(addTimeoutEpic(compareMapChanges, 10), 1, checkMapChanges(), epicResponse, NOT_EDITABLE_STATE);
        });
        it('shouldn\'t do anything if map is same', (done) => {
            const epicResponse = (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            };

            testEpic(addTimeoutEpic(compareMapChanges, 10), 1, checkMapChanges(), epicResponse, SAME_MAP_STATE);
        });

        it('should show confirm prompt if anything changed', (done) => {

            const epicResponse = (actions) => {
                expect(actions.length).toBe(2);
                expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[0].property).toBe('enabled');
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[1].property).toBe('source');
                done();
            };
            testEpic(compareMapChanges, 2, checkMapChanges(), epicResponse, CHANGED_MAP_STATE);
        });
        it('On logout the controls should be reset', (done) => {

            const epicResponse = (actions) => {
                expect(actions.length).toBe(4);
                expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[0].property).toBe('enabled');
                expect(actions[0].value).toBe(true);
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[1].property).toBe('source');
                expect(actions[2].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[2].property).toBe('enabled');
                expect(actions[2].value).toBe(false);
                expect(actions[3].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[3].property).toBe('source');
                done();
            };
            testEpic(compareMapChanges, 4, [checkMapChanges(), logout()], epicResponse, CHANGED_MAP_STATE);
        });
        it('On location change the controls should be reset', (done) => {

            const epicResponse = (actions) => {
                expect(actions.length).toBe(4);
                expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[0].property).toBe('enabled');
                expect(actions[0].value).toBe(true);
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[1].property).toBe('source');
                expect(actions[2].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[2].property).toBe('enabled');
                expect(actions[2].value).toBe(false);
                expect(actions[3].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[3].property).toBe('source');
                done();
            };
            testEpic(compareMapChanges, 4, [checkMapChanges(), {type: LOCATION_CHANGE}], epicResponse, CHANGED_MAP_STATE);
        });
    });

    describe('redirectUnauthorizedUserOnNewMap', () => {
        it('should navigate to homepage when user made some changes to map, and prompt appears', (done) => {
            const epicResponse = (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe('@@router/CALL_HISTORY_METHOD');
                done();
            };

            const initState = {
                router: {
                    location: {
                        pathname: '/viewer/openlayers/new'
                    }
                }
            };

            testEpic(redirectUnauthorizedUserOnNewMap, 1, configureError({status: 403}), epicResponse, initState);
        });
    });
});
