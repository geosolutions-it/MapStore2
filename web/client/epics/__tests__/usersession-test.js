/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { testEpic } from './epicTestUtils';
import { saveUserSessionEpicCreator, autoSaveSessionEpicCreator, loadUserSessionEpicCreator, removeUserSessionEpicCreator, clearSessionIfPluginMissingEpic } from "../usersession";
import { saveUserSession, loadUserSession,
    USER_SESSION_SAVED, USER_SESSION_LOADING, SAVE_USER_SESSION, USER_SESSION_LOADED, USER_SESSION_REMOVED, userSessionStartSaving, userSessionStopSaving, removeUserSession, clearSessionIfPluginMissing
} from "../../actions/usersession";
import { CLOSE_FEATURE_GRID } from '../../actions/featuregrid';
import { TEXT_SEARCH_RESET } from '../../actions/search';
import expect from "expect";
import {Providers} from  "../../api/usersession";
import {Observable} from "rxjs";
import ConfigUtils from  "../../utils/ConfigUtils";
import { LOAD_MAP_CONFIG } from '../../actions/config';

describe('usersession Epics', () => {
    const initialState = {
        sample1: "sample1",
        sample2: "sample2",
        id: "1",
        usersession: {
            autoSave: true
        },
        security: {
            user: {
                name: "myuser"
            }
        }
    };
    const sessionSelector = (state) => ({
        sample1: state.sample1,
        sample2: state.sample2
    });
    const idSelector = (state) => state.id;
    const nameSelector = () => "myname";
    beforeEach(() => {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: true,
            provider: "test"
        });
        Providers.test = {
            getSession: () => Observable.of(["1", {}]),
            writeSession: (id) => Observable.of(id),
            removeSession: (id) => Observable.of(id)
        };
    });
    afterEach(() =>  {
        ConfigUtils.setConfigProp("userSessions", {
            enabled: false
        });
        delete Providers.test;
    });
    it('user session is saved using data from sessionSelector', (done) => {
        testEpic(saveUserSessionEpicCreator(sessionSelector, nameSelector, idSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(actions[1].session.sample1).toBe("sample1");
            expect(actions[1].session.sample2).toBe("sample2");
        }, initialState, done);
    });
    it('user session id is taken from idSelector during save', (done) => {
        testEpic(saveUserSessionEpicCreator(sessionSelector, () => null, idSelector), 2, saveUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_SAVED);
            expect(actions[1].id).toBe("1");
        }, initialState, done);
    });
    it('start and stop user session save', (done) => {
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({type: 'END'})),
            (action) => action.type !== "END",
            userSessionStartSaving(), (actions) => {
                expect(actions[0].type).toBe(SAVE_USER_SESSION);
                expect(actions[actions.length - 1].type).toBe("EPIC_COMPLETED");
            }, initialState, done, true);
        setTimeout(() => {
            store.dispatch(userSessionStopSaving());
        }, 100);
    });
    it('disable autoSave do not allow session saving', (done) => {
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({ type: 'END' })),
            (action) => action.type !== "END", [userSessionStartSaving(), userSessionStopSaving()],
            (actions) => {
                expect(actions[0].type).toBe("EPIC_COMPLETED");
            }, { ...initialState, usersession: { autoSave: false } }, done, true);
        setTimeout(() => {
            store.dispatch({ type: 'STOP' });
        }, 100);
    });
    it('start, stop and restart user session save', (done) => {
        let count = 0;
        const store = testEpic(
            autoSaveSessionEpicCreator(10, () => ({type: 'END' + (count++)})),
            (action) => action.type !== "END1",
            userSessionStartSaving(), (actions) => {
                expect(actions[0].type).toBe(SAVE_USER_SESSION);
                expect(actions[actions.length - 1].type).toBe("EPIC_COMPLETED");
            }, initialState, done, true);
        setTimeout(() => {
            store.dispatch(userSessionStopSaving());
            setTimeout(() => {
                store.dispatch(userSessionStartSaving());
                setTimeout(() => {
                    store.dispatch(userSessionStopSaving());
                }, 100);
            }, 50);
        }, 100);
    });
    it('user session name is taken from idSelector when loading', (done) => {
        testEpic(loadUserSessionEpicCreator(idSelector), 2, loadUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_LOADED);
            expect(actions[1].id).toBe("1");
            expect(actions[1].session).toExist();
        }, initialState, done);
    });

    it('user session is removed', (done) => {
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            expect(actions[0].type).toBe(USER_SESSION_LOADING);
            expect(actions[1].type).toBe(USER_SESSION_REMOVED);
            expect(actions[1].newSession).toBeTruthy();
        }, {...initialState,
            map: {
                present: {
                    center: {
                        x: -71.88845339541245,
                        y: 37.25911173702324,
                        crs: 'EPSG:4326'
                    },
                    maxExtent: [
                        -20037508.34,
                        -20037508.34,
                        20037508.34,
                        20037508.34
                    ]
                }
            }
        }, done);
    });

    it("user Session Update on Partial Session Remove - Background Layers", (done) => {
        const states = {
            ...initialState,
            map: {
                present: {
                    center: {
                        x: 118.91601562499996,
                        y: 42.617791432823395,
                        crs: 'EPSG:4326'
                    },
                    zoom: 16
                }
            },
            layers: [{id: "layer1", group: 'background'}, {id: "layer2"}, {id: "layer3]"}],
            toc: {test: false},
            usersession: {
                checkedSessionToClear: ['background_layers'],
                config: {
                    map: {
                        layers: []
                    }
                }
            }
        };

        // remove background layers
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            // only background layers are removed
            expect(actions[1].newSession.map.zoom).toBe(16);
            expect(actions[1].newSession.map.center).toEqual({
                x: 118.91601562499996,
                y: 42.617791432823395,
                crs: 'EPSG:4326'
            });
            expect(actions[1].newSession.map.layers.some(l => l.group === 'background')).toBe(false);
        }, states, done);
    });

    it("user Session Update on Partial Session Remove - Annotation Layers", (done) => {
        const states = {
            ...initialState,
            map: {
                present: {
                    center: {
                        x: 118.91601562499996,
                        y: 42.617791432823395,
                        crs: 'EPSG:4326'
                    },
                    zoom: 16
                }
            },
            layers: [{id: "annotations-1", group: 'background'}, {id: "layer2"}, {id: "layer3]"}],
            toc: {test: false},
            usersession: {
                checkedSessionToClear: ['annotations_layer'],
                config: {
                    map: {
                        layers: [{
                            id: "annotations-from-original"
                        }]
                    }
                }
            }
        };
        // remove annotation layers
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            // removed from session
            expect(actions[1].newSession.map.layers.some(l => l.id === 'annotations-1')).toBe(false);
            // retrieved from original Config
            expect(actions[1].newSession.map.layers.some(l => l.id === 'annotations-from-original')).toBe(true);
        }, states, done);
    });

    it("Check background layers after reset: find background layer of original config after reset", (done) => {
        const states = {
            ...initialState,
            map: {
            },
            layers: [{id: "layer1", group: 'background'}, {id: "layer2"}, {id: "layer3]"}],
            toc: {test: false},
            usersession: {
                checkedSessionToClear: ['background_layers'],
                config: {
                    map: {
                        layers: [{id: "background_from_original_config", group: 'background'}]
                    }
                }
            }
        };

        // reset background layers
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            expect(actions[1].newSession.map.layers.some(l => l.id === 'layer1')).toBe(false);
            expect(actions[1].newSession.map.layers.some(l => l.id === 'background_from_original_config')).toBe(true);
        }, states, done);
    });


    it("user Session Update on Partial Session Remove - Map Positions", (done) => {
        const states = {
            ...initialState,
            map: {
                present: {
                    center: {
                        x: 118.91601562499996,
                        y: 42.617791432823395,
                        crs: 'EPSG:4326'
                    },
                    zoom: 16
                }
            },
            layers: [{id: "layer1", group: 'background'}, {id: "layer2"}, {id: "layer3"}],
            toc: {test: false},
            usersession: {
                checkedSessionToClear: ['map_pos'],
                config: {
                    map: {
                        layers: [],
                        center: {
                            "x": 11.26,
                            "y": 43.77,
                            "crs": "EPSG:4326"
                        },
                        zoom: 12
                    }
                }
            }
        };
        // remove map positions
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            // console.log(actions[1].newSession, "newSessionTest");
            expect(actions[1].newSession.map.center.x).toBe(11.26);
            expect(actions[1].newSession.map.center.y).toBe(43.77);
            expect(actions[1].newSession.map.zoom).toBe(12);
            // check others session is same
            expect(actions[1].newSession.map.layers.length).toEqual([3]);

        }, states, done);
    });


    it('CLOSE_FEATURE_GRID and TEXT_SEARCH_RESET actions are triggered', (done) => {
        testEpic(removeUserSessionEpicCreator(idSelector), 6, removeUserSession(), (actions) => {
            expect(actions[2].type).toBe(CLOSE_FEATURE_GRID);
            expect(actions[3].type).toBe(TEXT_SEARCH_RESET);
        }, {...initialState, map: {
            present: {
                center: {
                    x: -71.88845339541245,
                    y: 37.25911173702324,
                    crs: 'EPSG:4326'
                },
                maxExtent: [
                    -20037508.34,
                    -20037508.34,
                    20037508.34,
                    20037508.34
                ]
            }
        }}, done);
    });

    it("clearSessionIfPluginMissingEpic: re-update mapConfig with default Config ", (done) => {
        testEpic(clearSessionIfPluginMissingEpic, 1, clearSessionIfPluginMissing("sessionId", {dummySession: "yes"} ), (actions) =>{
            // after removing session removes session and updates with default config(LOAD_MAP_CONFIG)
            expect(actions[0].type).toBe(LOAD_MAP_CONFIG);
            expect(actions[0].overrideConfig).toEqual({});
            expect(actions[0].config.map.layers.length).toBe(2);
        },
        {
            ...initialState,
            usersession: {
                // this indicates userSession plugin is missing
                autoSave: false,
                config: {map: {layers: [{id: "1"}, {id: "2"}]}}
            }
        }, done);

    });

});
