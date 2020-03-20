/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { testEpic } from './epicTestUtils';
import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

import {
    SET_FILTER_RELOAD_DELAY,
    TRIGGER_RELOAD,
    deleteMap,
    saveMap
} from '../../actions/mapcatalog';

import {
    SHOW_NOTIFICATION
} from '../../actions/notifications';

import {
    deleteMapEpic,
    saveMapEpic
} from '../mapcatalog';

const testMap = {
    id: 10,
    metadata: {
        name: 'testmap',
        description: 'testmap'
    }
};

describe('mapcatalog epics', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('deleteMapEpic', (done) => {
        mockAxios.onDelete().reply(200, {});
        mockAxios.onGet().reply(200, {
            AttributeList: {}
        });
        testEpic(deleteMapEpic, 3, deleteMap(testMap), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(SHOW_NOTIFICATION);
            expect(actions[0].level).toBe('success');
            expect(actions[1].type).toBe(SET_FILTER_RELOAD_DELAY);
            expect(actions[2].type).toBe(TRIGGER_RELOAD);
        }, {}, done);
    });

    it('saveMapEpic', (done) => {
        mockAxios.onPut().reply(200, {});
        testEpic(saveMapEpic, 3, saveMap(testMap), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(SHOW_NOTIFICATION);
            expect(actions[0].level).toBe('success');
            expect(actions[1].type).toBe(SET_FILTER_RELOAD_DELAY);
            expect(actions[2].type).toBe(TRIGGER_RELOAD);
        }, {}, done);
    });
});
