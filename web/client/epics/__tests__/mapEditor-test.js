/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {testEpic} from './epicTestUtils';

import {
    mapEditorConfigureMapState
} from '../mapEditor';
import {
    show
} from '../../actions/mapEditor';

import { LOAD_MAP_CONFIG, MAP_CONFIG_LOADED } from '../../actions/config';
import {REMOVE_ALL_ADDITIONAL_LAYERS} from '../../actions/additionallayers';
import {RESET_CONTROLS} from '../../actions/controls';
import {CLEAR_LAYERS} from '../../actions/layers';


describe('MapEditor Epics', () => {
    it('mapEditorConfigureMapState show editor to load new map', (done) => {
        const NUM_ACTIONS = 4;

        testEpic(mapEditorConfigureMapState, NUM_ACTIONS, show('mediaEditor'), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case REMOVE_ALL_ADDITIONAL_LAYERS:
                case RESET_CONTROLS:
                case CLEAR_LAYERS:
                    break;
                case LOAD_MAP_CONFIG:
                    expect(a.configName).toBe('new.json');
                    expect(a.mapId).toBe(null);
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {});
    });
    it('mapEditorConfigureMapState show editor to configure passed map', (done) => {
        const NUM_ACTIONS = 4;
        const map = {data: {}, id: 10};
        testEpic(mapEditorConfigureMapState, NUM_ACTIONS, show('mediaEditor', map), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case REMOVE_ALL_ADDITIONAL_LAYERS:
                case RESET_CONTROLS:
                case CLEAR_LAYERS:
                    break;
                case MAP_CONFIG_LOADED:
                    expect(a.config).toEqual({map: map.data, version: 2});
                    expect(a.mapId).toBe(10);
                    expect(a.legacy).toBe(true);
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
            done();
        }, {});
    });
});
