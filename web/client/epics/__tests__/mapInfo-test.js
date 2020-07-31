/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const { setMapTriggerEpic } = require('../mapInfo');
const { configureMap } = require('../../actions/config');
const { testEpic } = require('./epicTestUtils');

const { REGISTER_EVENT_LISTENER, UNREGISTER_EVENT_LISTENER } = require('../../actions/map');

describe('setMapTriggerEpic', () => {
    it('should register event if hover is trigger in mapInfo', (done) => {
        const epicResponse = actions => {
            expect(actions[0].type).toBe(REGISTER_EVENT_LISTENER);
            done();
        };
        testEpic(setMapTriggerEpic, 1, configureMap(), epicResponse, {mapInfo: {trigger: 'hover'}});
    });
    it('should unregister event if no mapInfo or no trigger is present in mapInfo', (done) => {
        const epicResponse = actions => {
            expect(actions[0].type).toBe(UNREGISTER_EVENT_LISTENER);
            done();
        };
        testEpic(setMapTriggerEpic, 1, configureMap(), epicResponse, {});
    });
});
