/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { checkPendingChanges } from '../../actions/pendingChanges';
import { SET_CONTROL_PROPERTY } from '../../actions/controls';
import { comparePendingChanges } from '../pendingChanges';
import { LOCATION_CHANGE } from 'connected-react-router';
import {logout} from '../../actions/security';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { set } from '../../utils/ImmutableUtils';

describe('comparePendingChanges', () => {
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

        testEpic(addTimeoutEpic(comparePendingChanges, 10), 1, checkPendingChanges(), epicResponse, state);
    });
    it('shouldn\'t do anything if map not editable', (done) => {
        const epicResponse = (actions) => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            done();
        };
        testEpic(addTimeoutEpic(comparePendingChanges, 10), 1, checkPendingChanges(), epicResponse, NOT_EDITABLE_STATE);
    });
    it('shouldn\'t do anything if map is same', (done) => {
        const epicResponse = (actions) => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            done();
        };

        testEpic(addTimeoutEpic(comparePendingChanges, 10), 1, checkPendingChanges(), epicResponse, SAME_MAP_STATE);
    });

    it('should show confirm prompt if anything changed on map', (done) => {

        const epicResponse = (actions) => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[0].property).toBe('enabled');
            expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[1].property).toBe('source');
            done();
        };
        testEpic(comparePendingChanges, 2, checkPendingChanges(), epicResponse, CHANGED_MAP_STATE);
    });
    it('should show confirm prompt if anything changed on geostory', (done) => {

        const epicResponse = (actions) => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[0].property).toBe('enabled');
            expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
            expect(actions[1].property).toBe('source');
            done();
        };
        testEpic(comparePendingChanges, 2, checkPendingChanges(), epicResponse, {
            ...SAME_MAP_STATE,
            geostory: {pendingChanges: true},
            feedbackMask: {
                currentPage: 'geostory'
            }
        });
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
        testEpic(comparePendingChanges, 4, [checkPendingChanges(), logout()], epicResponse, CHANGED_MAP_STATE);
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
        testEpic(comparePendingChanges, 4, [checkPendingChanges(), { type: LOCATION_CHANGE }], epicResponse, CHANGED_MAP_STATE);
    });
});
