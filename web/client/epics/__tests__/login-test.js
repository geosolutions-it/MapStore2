/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LOCATION_CHANGE } from 'connected-react-router';
import expect from 'expect';

import axios from '../../libs/ajax';

import { MAP_CONFIG_LOAD_ERROR } from '../../actions/config';
import { SET_CONTROL_PROPERTY, setControlProperty } from '../../actions/controls';
import { loginSuccess, logout, logoutWithReload, loginRequired, LOGIN_PROMPT_CLOSED, LOGIN_SUCCESS } from '../../actions/security';
import { setCookie, eraseCookie } from '../../utils/CookieUtils';

import MockAdapter from 'axios-mock-adapter';

import {
    initCatalogOnLoginOutEpic,
    promptLoginOnMapError,
    reloadMapConfig,
    redirectOnLogout,
    verifyOpenIdSessionCookie
} from '../login';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';

describe('login Epics', () => {
    describe('reloadMapConfig', () => {
        it('keeps map changes on login', (done) => {
            const epicResult = actions => {
                expect(actions.length).toBe(0);
                done();
            };
            testEpic(reloadMapConfig, 0, loginSuccess(), epicResult, {});
        });
        it('removes unsaved map changes on logout', (done) => {
            const epicResult = actions => {
                expect(actions.length).toBe(0);
                done();
            };
            testEpic(reloadMapConfig, 0, logoutWithReload(), epicResult, {});
        });

        it('show prompt login when users logs out from new map', (done) => {
            const NUM_ACTIONS = 1;
            const epicResult = actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [a] = actions;
                expect(a).toExist();
                expect(a.type).toBe(MAP_CONFIG_LOAD_ERROR);
                expect(a.error.status).toBe(403);
                done();
            };
            const state = {
                router: {
                    location: {
                        pathname: "/viewer/openlayers/new"
                    }
                }
            };
            testEpic(reloadMapConfig, NUM_ACTIONS, logout(null), epicResult, state);
        });

    });
    it('init catalog on login', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(undefined);
            done();
        };
        testEpic(initCatalogOnLoginOutEpic, 1, loginSuccess(), epicResult, {});
    });

    it('init catalog on logout', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(undefined);
            done();
        };
        testEpic(initCatalogOnLoginOutEpic, 1, logout(), epicResult, {});
    });
    // TODO: move these tests in feedback mask and/or on single plugins
    describe('prompt login on not-public resources', () => {
        it('not-public map', (done) => {

            const epicResult = actions => {
                expect(actions.length).toBe(1);
                const action = actions[0];
                expect(action.type).toBe(SET_CONTROL_PROPERTY);
                done();
            };
            testEpic(promptLoginOnMapError, 1, loginRequired(), epicResult, {});
        });
        it('not-public dashboard', (done) => {
            const epicResult = actions => {
                try {
                    const setControlAction = actions[0];
                    expect(setControlAction.type).toBe(SET_CONTROL_PROPERTY);
                    expect(setControlAction.control).toBe('LoginForm');
                    expect(setControlAction.property).toBe('enabled');
                    expect(setControlAction.value).toBe(true);
                    const feedbackAction = actions[1];
                    expect(feedbackAction.type).toBe(LOGIN_PROMPT_CLOSED);
                } catch (e) {
                    done(e);
                }
                done();
            };
            testEpic(promptLoginOnMapError, 2, [loginRequired(), setControlProperty('LoginForm', 'enabled', false)], epicResult, {});
        });
        it('not-public story', (done) => {
            const epicResult = actions => {
                try {
                    const setControlAction = actions[0];
                    expect(setControlAction.type).toBe(SET_CONTROL_PROPERTY);
                    expect(setControlAction.control).toBe('LoginForm');
                    expect(setControlAction.property).toBe('enabled');
                    expect(setControlAction.value).toBe(true);
                    const feedbackAction = actions[1];
                    expect(feedbackAction.type).toBe(LOGIN_PROMPT_CLOSED);
                } catch (e) {
                    done(e);
                }
                done();
            };
            testEpic(promptLoginOnMapError, 2, [loginRequired(), setControlProperty('LoginForm', 'enabled', false)], epicResult, {});
        });
    });
    it('redirectOnLogout', () => {
        testEpic(redirectOnLogout, 1, logout('/test'), (actions) => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe('@@router/CALL_HISTORY_METHOD');
        });
        testEpic(redirectOnLogout, 1, logout(), (actions) => {
            expect(actions.length).toBe(0);
        });
    });
    describe('verifyOpenIdSessionCookie', () => {
        let mockAxios;
        const testUserDetails = {
            "User": {
                "attribute": [
                    {
                        "name": "UUID",
                        "value": "test"
                    }
                ],
                "enabled": true,
                "groups": {},
                "id": 6,
                "name": "secured",
                "role": "USER"
            },
            "access_token": "1234567890",
            "expires": 86400,
            "refresh_token": "abcdef"
        };
        beforeEach(() => {
            eraseCookie('access_token');
            eraseCookie('refresh_token');
            eraseCookie('authProvider');
            mockAxios = new MockAdapter(axios);
        });
        afterEach(() => {
            eraseCookie('access_token');
            eraseCookie('refresh_token');
            eraseCookie('authProvider');
            mockAxios.restore();
        });
        it('no cookie, no action', (done) => {
            testEpic(addTimeoutEpic(verifyOpenIdSessionCookie, 20), 1, {type: LOCATION_CHANGE}, ([action]) => {
                expect(action.type).toEqual(TEST_TIMEOUT);
                done();
            });
        });
        it('use cookie to test userDetails and trigger login', (done) => {
            setCookie('access_token', "TEST_TOKEN");
            setCookie('refresh_token', "TEST_REFRESH_TOKEN");
            setCookie('authProvider', "TEST_PROVIDER");
            mockAxios.onGet().reply(config => {
                expect(config.url).toEqual(`users/user/details`);
                return [200, testUserDetails];
            });
            testEpic(verifyOpenIdSessionCookie, 1, {type: LOCATION_CHANGE}, ([action]) => {
                expect(action.type).toEqual(LOGIN_SUCCESS);
                expect(action.userDetails.access_token).toEqual("TEST_TOKEN");
                expect(action.userDetails.authProvider).toEqual("TEST_PROVIDER");
                expect(action.userDetails.refresh_token).toEqual("TEST_REFRESH_TOKEN");
                done();
            });
        });
    });
});
