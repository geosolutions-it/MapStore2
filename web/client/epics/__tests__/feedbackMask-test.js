/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {updateMapVisibility, updateDashboardVisibility} = require('../feedbackMask');
const {LOADING_MASK_LOADING, LOADING_MASK_LOADED, LOADING_MASK_ENABLED} = require('../../actions/feedbackMask');
const {initMap} = require('../../actions/map');
const {configureMap, configureError} = require('../../actions/config');
const {loadDashboard, dashboardLoaded, dashboardLoadError} = require('../../actions/dashboard');

const {testEpic} = require('./epicTestUtils');

describe('feedbackMask Epics', () => {

    it('test updateMapVisibility loaded', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(LOADING_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(LOADING_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(LOADING_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(false);
            done();
        };
        testEpic(updateMapVisibility, 3, [initMap(), configureMap()], epicResult, {});
    });

    it('test updateMapVisibility error', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(LOADING_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(LOADING_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(LOADING_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(true);
            done();
        };
        testEpic(updateMapVisibility, 3, [initMap(), configureError()], epicResult, {});
    });

    it('test updateDashboardVisibility loaded', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(LOADING_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(LOADING_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(LOADING_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(false);
            done();
        };
        testEpic(updateDashboardVisibility, 3, [loadDashboard(), dashboardLoaded()], epicResult, {});
    });

    it('test updateDashboardVisibility error', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(LOADING_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(LOADING_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(LOADING_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(true);
            done();
        };
        testEpic(updateDashboardVisibility, 3, [loadDashboard(), dashboardLoadError()], epicResult, {});
    });

});
