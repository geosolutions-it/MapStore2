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
import ConfigUtils from '../../utils/ConfigUtils';


describe('Cookies epics', () => {
    const privacy = {enabled: true, policyVersion: 'epic-test', categories: []};
    beforeEach(() => {
        ConfigUtils.setConfigProp('privacy', privacy);
    });
    afterEach(() => {
        ConfigUtils.removeConfigProp('privacy');
        setApi("localStorage");
    });
    it('opens the privacy panel on the first visit', done => {
        setApi("memoryStorage");
        testEpic(cookiePolicyChecker, 1, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
            done();
        }, {});
    });
    it('opens the privacy panel when storage access fails', done => {
        setApi("memoryStorage");
        getApi().setAccessDenied(true);
        testEpic(cookiePolicyChecker, 1, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
            getApi().setAccessDenied(false);
            done();
        }, {});
    });
    it('opens the privacy panel and removes an approval of the old cookie notice', done => {
        setApi("memoryStorage");
        getApi().setItem(getItemKey('cookie', 'approved'), 'true');
        testEpic(cookiePolicyChecker, 1, {type: LOCATION_CHANGE}, (actions) => {
            expect(actions).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
            expect(getApi().getItem(getItemKey('cookie', 'approved'))).toBe(null);
            done();
        }, {});
    });
    it('shows nothing when the privacy configuration is disabled or missing', done => {
        setApi("memoryStorage");
        ConfigUtils.setConfigProp('privacy', {...privacy, enabled: false});
        testEpic(addTimeoutEpic(cookiePolicyChecker, 40), 1, {type: LOCATION_CHANGE}, (disabled) => {
            expect(disabled[0].type).toBe(TEST_TIMEOUT);
            ConfigUtils.removeConfigProp('privacy');
            testEpic(addTimeoutEpic(cookiePolicyChecker, 40), 1, {type: LOCATION_CHANGE}, (missing) => {
                expect(missing[0].type).toBe(TEST_TIMEOUT);
                done();
            }, {});
        }, {});
    });
});
