/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { INIT_CATALOG } = require('../../actions/catalog');
const { SET_CONTROL_PROPERTY, setControlProperty } = require('../../actions/controls');
const { loginSuccess, logout, logoutWithReload, loginRequired, LOGIN_PROMPT_CLOSED } = require('../../actions/security');
const { initCatalogOnLoginOutEpic, promptLoginOnMapError, reloadMapConfig } = require('../login');

const { testEpic } = require('./epicTestUtils');

describe('login Epics', () => {
    it('init catalog on login', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(INIT_CATALOG);
            done();
        };
        testEpic(initCatalogOnLoginOutEpic, 1, loginSuccess(), epicResult, {});
    });
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

    it('reload new map config on logout', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            done();
        };
        const state = {
            router: {
                location: {
                    pathname: "/viewer/openlayers/new"
                }
            }
        };
        testEpic(reloadMapConfig, 1, logout(null), epicResult, state);
    });

    it('init catalog on logout', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            const action = actions[0];
            expect(action.type).toBe(INIT_CATALOG);
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
});
