/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const { updateMapVisibility, updateDashboardVisibility, updateGeoStoryFeedbackMaskVisibility, detectNewPage, feedbackMaskPromptLogin} = require('../feedbackMask');
const {FEEDBACK_MASK_LOADING, FEEDBACK_MASK_LOADED, FEEDBACK_MASK_ENABLED, DETECTED_NEW_PAGE} = require('../../actions/feedbackMask');
const {initMap} = require('../../actions/map');
const {configureMap, configureError} = require('../../actions/config');
const {loadDashboard, dashboardLoaded, dashboardLoadError} = require('../../actions/dashboard');
const { loadGeostory, geostoryLoaded, loadGeostoryError } = require('../../actions/geostory');
const {LOGIN_REQUIRED} = require('../../actions/security');
const { onLocationChanged } = require('connected-react-router');

const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');

describe('feedbackMask Epics', () => {

    it('test updateMapVisibility loaded', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(false);
            done();
        };
        testEpic(updateMapVisibility, 3, [initMap(), configureMap()], epicResult, {});
    });

    it('test updateMapVisibility error', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(true);
            done();
        };
        testEpic(updateMapVisibility, 3, [initMap(), configureError()], epicResult, {});
    });

    it('test updateDashboardVisibility loaded', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(false);
            done();
        };
        testEpic(updateDashboardVisibility, 3, [loadDashboard(), dashboardLoaded()], epicResult, {});
    });

    it('test updateDashboardVisibility error', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(true);
            done();
        };
        testEpic(updateDashboardVisibility, 3, [loadDashboard(), dashboardLoadError()], epicResult, {});
    });

    it('test updateGeoStoryFeedbackMaskVisibility loaded', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(false);
            done();
        };
        testEpic(updateGeoStoryFeedbackMaskVisibility, 3, [loadGeostory(), geostoryLoaded()], epicResult, {});
    });

    it('test updateGeoStoryFeedbackMaskVisibility error', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            const loadingAction = actions[0];
            expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADING);
            const loadedAction = actions[1];
            expect(loadedAction.type).toBe(FEEDBACK_MASK_LOADED);
            const enabledAction = actions[2];
            expect(enabledAction.type).toBe(FEEDBACK_MASK_ENABLED);
            expect(enabledAction.enabled).toBe(true);
            done();
        };
        testEpic(updateGeoStoryFeedbackMaskVisibility, 3, [loadGeostory(), loadGeostoryError()], epicResult, {});
    });
    it('test detectNewPage new page', (done) => {
        const epicResult = actions => {
            try {
                expect(actions.length).toBe(3);
                const loadingAction = actions[0];
                expect(loadingAction.type).toBe(FEEDBACK_MASK_LOADED);
                const loadedAction = actions[1];
                expect(loadedAction.type).toBe(FEEDBACK_MASK_ENABLED);
                const enabledAction = actions[2];
                expect(enabledAction.type).toBe(DETECTED_NEW_PAGE);
                expect(enabledAction.currentPage).toBe('viewer');
            } catch (e) {
                done(e);
            }
            done();
        };
        testEpic(detectNewPage, 3, [onLocationChanged({
            pathname: '/viewer'
        })], epicResult, {});
    });

    it('test detectNewPage same page', (done) => {
        testEpic(addTimeoutEpic(detectNewPage, 10), 1, onLocationChanged({
            pathname: '/viewer'
        }), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            feedbackMask: {
                currentPage: 'viewer'
            }
        });
    });

    it('test detectNewPage exclude number id path', (done) => {
        testEpic(addTimeoutEpic(detectNewPage, 10), 1, onLocationChanged({
            pathname: '/777'
        }), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {});
    });
    it('test feedbackMaskPromptLogin on geostory 403', done => {
        const ACTIONS_EMITTED = 1;
        const error = {status: 403, statusText: 'Forbidden'};
        testEpic(feedbackMaskPromptLogin, ACTIONS_EMITTED, loadGeostoryError(error), actions => {
            expect(actions.length).toBe(ACTIONS_EMITTED);
            actions.map((action) => {
                switch (action.type) {
                case LOGIN_REQUIRED:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        },
        {});
    });
    it('test feedbackMaskPromptLogin on geostory 403 with new story', done => {
        const ACTIONS_EMITTED = 1;
        const error = { status: 403, statusText: 'Forbidden' };
        testEpic(feedbackMaskPromptLogin, ACTIONS_EMITTED, loadGeostoryError(error), actions => {
            expect(actions.length).toBe(ACTIONS_EMITTED);
            actions.map((action) => {
                switch (action.type) {
                case LOGIN_REQUIRED:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        },
        {
            router: {
                location: {
                    pathname: '/geostory/newgeostory'
                }
            }
        });
    });
    it('test feedbackMaskPromptLogin on geostory 403 with shared story', done => {
        const ACTIONS_EMITTED = 1;
        const error = {status: 403, statusText: 'Forbidden'};
        testEpic(addTimeoutEpic(feedbackMaskPromptLogin, 10), ACTIONS_EMITTED, loadGeostoryError(error), actions => {
            expect(actions.length).toBe(ACTIONS_EMITTED);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        },
        {router: {
            location: {
                pathname: '/geostory/shared/17473'
            }
        }
        });
    });

});
