/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { addTimeoutEpic, testEpic, TEST_TIMEOUT } from './epicTestUtils';
import {disableGFIForShareEpic, onMapClickForShareEpic, readQueryParamsOnMapEpic} from '../queryparams';
import { changeMapView, ZOOM_TO_EXTENT, CHANGE_MAP_VIEW, clickOnMap } from '../../actions/map';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { onLocationChanged } from 'connected-react-router';
import {toggleControl} from "../../actions/controls";

describe('queryparam epics', () => {
    it('test readQueryParamsOnMapEpic without params in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: ''
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case TEST_TIMEOUT:
                        done();
                        break;
                    default:
                        done(new Error("Action not recognized"));
                    }
                });
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with bbox param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?bbox=9,45,10,46'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(ZOOM_TO_EXTENT);
                    expect(Math.floor(actions[0].extent[0])).toBe(9);
                    expect(Math.floor(actions[0].extent[1])).toBe(45);
                    expect(Math.floor(actions[0].extent[2])).toBe(10);
                    expect(Math.floor(actions[0].extent[3])).toBe(46);
                    expect(actions[0].crs).toBe('EPSG:4326');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test onMapClickForShareEpic', (done)=>{

        const point = {latlng: {lat: 39.01, lng: -89.97}};
        const layer = "layer01";
        const NUMBER_OF_ACTIONS = 2;
        const state = {
            controls: {
                share: {
                    settings: {
                        centerAndZoomEnabled: true
                    }
                }
            }
        };

        testEpic(
            addTimeoutEpic(onMapClickForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                clickOnMap(point, layer)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("TEXT_SEARCH_RESET");
                    expect(actions[1].type).toBe("FEATURE_INFO_CLICK");
                    expect(actions[1].point).toEqual({"latlng": {"lat": 39.01, "lng": -89.97}});
                    expect(actions[1].layer).toBe("layer01");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test disableGFIForShareEpic, on share panel open with mapInfo enabled', (done)=>{

        const NUMBER_OF_ACTIONS = 1;
        const state = {controls: {share: {enabled: true}}, mapInfo: {enabled: true}};

        testEpic(
            addTimeoutEpic(disableGFIForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('share', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("TOGGLE_MAPINFO_STATE");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
    it('test disableGFIForShareEpic, on share panel close', (done)=>{
        const state = {controls: {share: { enabled: false }}};
        const NUMBER_OF_ACTIONS = 4;
        testEpic(
            addTimeoutEpic(disableGFIForShareEpic, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('share', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe("HIDE_MAPINFO_MARKER");
                    expect(actions[1].type).toBe("PURGE_MAPINFO_RESULTS");
                    expect(actions[2].type).toBe("TOGGLE_MAPINFO_STATE");
                    expect(actions[3].type).toBe("SET_CONTROL_PROPERTY");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong bbox param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?bbox=a,46,10,45'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with center and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?center=-90,38&zoom=4'
                }
            },
            map: {
                size: {height: 726, width: 1536},
                projection: "EPSG:900913"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(-90);
                    expect(actions[0].center.y).toBe(38);
                    expect(actions[0].zoom).toBe(4);
                    expect(actions[0].size.height).toBe(726);
                    expect(actions[0].size.width).toBe(1536);
                    expect(actions[0].projection).toBe("EPSG:900913");
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with marker and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?marker=-90,38&zoom=4'
                }
            },
            map: {
                size: {height: 726, width: 1536},
                projection: "EPSG:900913"
            }
        };
        const NUMBER_OF_ACTIONS = 2;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(CHANGE_MAP_VIEW);
                    expect(actions[0].center).toExist();
                    expect(actions[0].center.x).toBe(-90);
                    expect(actions[0].center.y).toBe(38);
                    expect(actions[0].zoom).toBe(4);
                    expect(actions[1].type).toContain("ADD_MARKER");
                    expect(actions[1].markerPosition).toExist();
                    expect(actions[1].markerPosition.lat).toBe(38);
                    expect(actions[1].markerPosition.lng).toBe(-90);
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong center and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?center=-190,46&zoom=5'
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong marker and zoom param in url search', (done) => {
        const state = {
            router: {
                location: {
                    search: '?marker=-90,120&zoom=5'
                }
            },
            map: {
                size: {width: 100, height: 100},
                projection: "EPSG:4326"
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                onLocationChanged({}),
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch (e) {
                    done(e);
                }
                done();
            }, state);
    });
});
