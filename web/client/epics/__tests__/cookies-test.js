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
import { setApi, getApi, getItemKey } from '../../api/userPersistedStorage';


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
    it('shows the notice when storage access fails', done => {
        setApi("memoryStorage");
        getApi().setAccessDenied(true);
        const NUM_ACTIONS = 1;
        testEpic(cookiePolicyChecker, NUM_ACTIONS, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [action] = actions;
            expect(action.type).toBe(SET_COOKIE_VISIBILITY);
            expect(action.status).toBe(true);
            getApi().setAccessDenied(false);
            setApi("localStorage");
            done();
        }, {});
    });
    it('does not treat a stored string false as approval', done => {
        setApi("memoryStorage");
        getApi().setItem(getItemKey('cookie', 'approved'), 'false');
        testEpic(cookiePolicyChecker, 1, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions[0].status).toBe(true);
            getApi().removeItem(getItemKey('cookie', 'approved'));
            setApi("localStorage");
            done();
        }, {});
    });
    it('recognizes an existing string true approval', done => {
        setApi("memoryStorage");
        getApi().setItem(getItemKey('cookie', 'approved'), 'true');
        testEpic(addTimeoutEpic(cookiePolicyChecker, 40), 1, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions[0].type).toBe(TEST_TIMEOUT);
            getApi().removeItem(getItemKey('cookie', 'approved'));
            setApi("localStorage");
            done();
        }, {});
    });
});
