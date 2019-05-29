/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { addTimeoutEpic, testEpic, TEST_TIMEOUT } from './epicTestUtils';
import { readQueryParamsOnMapEpic } from '../share';
import { changeMapView, ZOOM_TO_EXTENT } from '../../actions/map';
import { SHOW_NOTIFICATION } from '../../actions/notifications';

describe('share epics', () => {
    it('test readQueryParamsOnMapEpic without params in url search', (done) => {
        const state = {
            routing: {
                location: {
                    search: ''
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                {
                    type: '@@router/LOCATION_CHANGE'
                },
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
            routing: {
                location: {
                    search: '?bbox=9,45,10,46'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                {
                    type: '@@router/LOCATION_CHANGE'
                },
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
                } catch(e) {
                    done(e);
                }
                done();
            }, state);
    });

    it('test readQueryParamsOnMapEpic with wrong bbox param in url search', (done) => {
        const state = {
            routing: {
                location: {
                    search: '?bbox=a,46,10,45'
                }
            }
        };
        const NUMBER_OF_ACTIONS = 1;

        testEpic(
            addTimeoutEpic(readQueryParamsOnMapEpic, 10),
            NUMBER_OF_ACTIONS, [
                {
                    type: '@@router/LOCATION_CHANGE'
                },
                changeMapView()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                try {
                    expect(actions[0].type).toBe(SHOW_NOTIFICATION);
                    expect(actions[0].level).toBe( 'warning');
                } catch(e) {
                    done(e);
                }
                done();
            }, state);
    });
});
