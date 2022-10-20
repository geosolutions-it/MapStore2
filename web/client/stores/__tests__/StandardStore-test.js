
/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import createStore from "../StandardStore";
import { Observable } from 'rxjs';
import { standardRootReducerFunc } from "../defaultOptions";
import {LOAD_MAP_CONFIG} from "../../actions/config";
import mapInfoReducers from "../../reducers/mapInfo";
import browserReducers from "../../reducers/browser";
import { CHANGE_BROWSER_PROPERTIES } from '../../actions/browser';
import MapType from '../../product/plugins/MapType';


describe('Test StandardStore', () => {
    it('storeOpts notify is true by default', () => {
        const store = createStore({}, {}, /* storeOpts */{});
        expect(store.addActionListener).toBeTruthy();
    });
    it('addActionListener is not available if storeOpts notify is false', () => {
        const store = createStore({}, {}, /* storeOpts */{ notify: false });
        expect(store.addActionListener).toBeFalsy();
    });
    it('appEpics override standard epics', (done) => {

        const store = createStore({
            appEpics: {
                loadMapConfigAndConfigureMap: ($action) =>
                    $action.ofType(LOAD_MAP_CONFIG).switchMap(() => Observable.of({type: "PONG"}))
            }
        });
        let actions = 0;
        store.addActionListener((action) => {
            actions++;
            if (actions === 2) {
                expect(action.type).toBe("PONG");
                done();
            }
        });
        store.dispatch({
            type: LOAD_MAP_CONFIG
        });
    });
    it("tests applying the maptype reducer and an override from config", () => {
        // this tests is valid also for when in the url there is not maptype
        const store = createStore({
            initialState: {
                defaultState: {},
                mobile: {}
            }
        }, {
            MapTypePlugin: MapType
        }, {
            initialState: {
                defaultState: {
                    maptype: {
                        mapType: "openlayers"
                    }
                },
                mobile: {}
            }
        });
        const maptype = store.getState().maptype.mapType;
        expect(maptype).toBe("openlayers");
    });
    it("tests applying the maptype reducer and an override from config", () => {
        const oldHash = window.location.hash;
        window.location.hash = "#/viewer/leaflet/1";
        const store = createStore({
            initialState: {
                defaultState: {},
                mobile: {}
            }
        }, {
            MapTypePlugin: MapType
        }, {
            initialState: {
                defaultState: {
                    maptype: {
                        mapType: "openlayers"
                    }
                },
                mobile: {}
            }
        });
        const maptype = store.getState().maptype.mapType;
        expect(maptype).toBe("leaflet");
        window.location.hash = oldHash;
    });
    it("tests that mobile overrides don't merge on desktop", () => {
        const store = createStore({
            initialState: {
                defaultState: {
                    mapInfo: {
                        enabled: true,
                        highlight: true
                    }
                },
                mobile: { // This has been duplicated from product/appConfig.js
                    mapInfo: {enabled: true, infoFormat: 'application/json' },
                    mousePosition: {enabled: true, crs: "EPSG:4326", showCenter: true}
                }
            },
            appReducers: {
                mapInfo: mapInfoReducers,
                browser: browserReducers
            },
            rootReducerFunc: standardRootReducerFunc
        });

        store.dispatch({
            type: CHANGE_BROWSER_PROPERTIES,
            newProperties: {
                mobile: false
            }
        });

        const state = store.getState();
        expect(state.browser.mobile).toBe(false);
        expect(state.mapInfo.enabled).toBe(true);
        expect(state.mapInfo.highlight).toBe(true);
        expect(state.mapInfo.infoFormat).toBe(undefined);
    });
    it("tests that mobile-specific state overrides merge deeply", () => {
        const store = createStore({
            initialState: {
                defaultState: {
                    mapInfo: {
                        highlight: true
                    }
                },
                mobile: { // This has been duplicated from product/appConfig.js
                    mapInfo: {
                        enabled: true,
                        infoFormat: 'application/json'
                    },
                    mousePosition: {
                        enabled: true,
                        crs: "EPSG:4326",
                        showCenter: true
                    }
                }
            },
            appReducers: {
                mapInfo: mapInfoReducers,
                browser: browserReducers
            },
            rootReducerFunc: standardRootReducerFunc
        });

        store.dispatch({
            type: CHANGE_BROWSER_PROPERTIES,
            newProperties: {
                mobile: true
            }
        });

        const state = store.getState();
        expect(state.browser.mobile).toBe(true);
        expect(state.mapInfo.enabled).toBe(true);
        expect(state.mapInfo.highlight).toBe(true);
        expect(state.mapInfo.infoFormat).toBe("application/json");
    });
});
