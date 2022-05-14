/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic, TEST_TIMEOUT, addTimeoutEpic} from './epicTestUtils';
import { LOCATION_CHANGE } from 'connected-react-router';
import { cookiePolicyChecker } from '../cookies';
import { SET_COOKIE_VISIBILITY } from '../../actions/cookie';
import { setApi, getApi } from '../../api/userPersistedStorage';


describe('Cookies epics', () => {
    it('test cookiePolicyChecker and enable cookie msg', done => {
        const NUM_ACTIONS = 1;
        testEpic(cookiePolicyChecker, NUM_ACTIONS, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [action] = actions;
            expect(action.type).toBe(SET_COOKIE_VISIBILITY);
            expect(action.status).toBe(true);
            done();
        }, {});
    });
    it('test cookiePolicyChecker and trigger error for accessing localStorage', done => {
        setApi("memoryStorage");
        getApi().setAccessDenied(true);
        const NUM_ACTIONS = 1;
        testEpic(addTimeoutEpic(cookiePolicyChecker, 40), NUM_ACTIONS, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [action] = actions;
            expect(action.type).toBe(TEST_TIMEOUT);
            getApi().setAccessDenied(false);
            setApi("localStorage");
            done();
        }, {});
    });
});
