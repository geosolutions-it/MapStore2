/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import MockAdapter from 'axios-mock-adapter';
import { CALL_HISTORY_METHOD } from 'connected-react-router';
import expect from 'expect';

import { checkContextsOnMapLoad, createNewMapEpic } from '../createnewmap';
import { loadMaps } from '../../actions/maps';
import { testEpic } from './epicTestUtils';
import { createNewMap, HAS_CONTEXTS, LOADING, SHOW_NEW_MAP_DIALOG } from '../../actions/createnewmap';
import axios from '../../libs/ajax';

let mockAxios;

describe('CreateNewMap Epics', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('checkContextsOnMapLoad with context', (done) => {
        mockAxios.onGet().reply(() => ([ 200, {
            totalCount: 1
        }]));
        testEpic(checkContextsOnMapLoad, 3, loadMaps(), (actions) => {
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('newMapDialog');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(HAS_CONTEXTS);
            expect(actions[1].value).toBe(true);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe('newMapDialog');
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
    it('checkContextsOnMapLoad with no context', (done) => {
        mockAxios.onGet().reply(() => ([ 200, {
            totalCount: 0
        }]));
        testEpic(checkContextsOnMapLoad, 3, loadMaps(), (actions) => {
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe('newMapDialog');
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(HAS_CONTEXTS);
            expect(actions[1].value).toBe(false);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe('newMapDialog');
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
    it('createNewMapEpic on create new map with no context and target', (done) => {
        testEpic(createNewMapEpic, 2, createNewMap(), (actions) => {
            expect(actions[0].type).toBe(SHOW_NEW_MAP_DIALOG);
            expect(actions[0].show).toBe(false);
            expect(actions[1].type).toBe(CALL_HISTORY_METHOD);
            expect(actions[1].payload).toBeTruthy();
            expect(actions[1].payload.method).toBe('push');
            expect(actions[1].payload.args).toEqual(['viewer/new']);
            done();
        }, {});
    });
    it('createNewMapEpic with no target', (done) => {
        testEpic(createNewMapEpic, 2, createNewMap({id: "1"}), (actions) => {
            expect(actions[0].type).toBe(SHOW_NEW_MAP_DIALOG);
            expect(actions[0].show).toBe(false);
            expect(actions[1].type).toBe(CALL_HISTORY_METHOD);
            expect(actions[1].payload).toBeTruthy();
            expect(actions[1].payload.method).toBe('push');
            expect(actions[1].payload.args).toEqual(['viewer/new/context/1']);
            done();
        }, {});
    });
    it('createNewMapEpic with target', (done) => {
        testEpic(createNewMapEpic, 1, createNewMap({id: "1"}, true), (actions) => {
            expect(actions[0].type).toBe(SHOW_NEW_MAP_DIALOG);
            expect(actions[0].show).toBe(false);
            done();
        }, {});
    });
});
