
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
import {LOAD_MAP_CONFIG} from "../../actions/config";
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
});
