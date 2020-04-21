/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {getActionsFromStepEpic, switchTutorialEpic} = require('../tutorial');
const {SETUP_TUTORIAL, updateTutorial, initTutorial} = require('../../actions/tutorial');
const {testEpic} = require('./epicTestUtils');
const { onLocationChanged } = require('connected-react-router');

describe('tutorial Epics', () => {
    it('getActionsFromStepEpic with object action', (done) => {

        const step = {
            action: {
                next: {
                    type: 'TUTORIAL_ACTION',
                    value: 'value'
                }
            }
        };

        testEpic(getActionsFromStepEpic, 1, updateTutorial({action: 'next', step}), (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case 'TUTORIAL_ACTION':
                    expect(action.value).toBe('value');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
            }
        });

    });

    it('getActionsFromStepEpic with array of actions', (done) => {

        const step = {
            action: {
                next: [{
                    type: 'TUTORIAL_ACTION',
                    value: 'value'
                }, {
                    type: 'TUTORIAL_ACTION_2',
                    value: 'value_2'
                }]
            }
        };

        testEpic(getActionsFromStepEpic, 2, updateTutorial({action: 'next', step}), (actions) => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case 'TUTORIAL_ACTION':
                    expect(action.value).toBe('value');
                    break;
                case 'TUTORIAL_ACTION_2':
                    expect(action.value).toBe('value_2');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
            }
        });

    });

    it('switchTutorialEpic with path', (done) => {

        testEpic(switchTutorialEpic, 1, [
            onLocationChanged({
                pathname: '/dashboard'
            }),
            initTutorial('id', [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('/dashboard');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    'dashboard_mobile_tutorial': [],
                    'dashboard_tutorial': [],
                    'default_tutorial': [],
                    'default_mobile_tutorial': []
                }
            }
        });

    });

    it('switchTutorialEpic with viewer path', (done) => {

        testEpic(switchTutorialEpic, 1, [
            onLocationChanged({
                pathname: '/viewer/cesium/001'
            }),
            initTutorial('id', [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('cesium');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    'cesium_mobile_tutorial': [],
                    'cesium_tutorial': [],
                    'default_tutorial': [],
                    'default_mobile_tutorial': []
                }
            }
        });

    });

    it('switchTutorialEpic with path and id', (done) => {

        testEpic(switchTutorialEpic, 1, [
            onLocationChanged({
                pathname: '/dashboard/001'
            }),
            initTutorial('id', [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('dashboard');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    'dashboard_mobile_tutorial': [],
                    'dashboard_tutorial': [],
                    'default_tutorial': [],
                    'default_mobile_tutorial': []
                }
            }
        });

    });

    it('switchTutorialEpic mobile', (done) => {

        testEpic(switchTutorialEpic, 1, [
            onLocationChanged({
                pathname: '/dashboard/001'
            }),
            initTutorial('id', [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('dashboard_mobile');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    'dashboard_mobile_tutorial': [],
                    'dashboard_tutorial': [],
                    'default_tutorial': [],
                    'default_mobile_tutorial': []
                }
            },
            browser: {
                mobile: true
            }
        });

    });

    it('switchTutorialEpic missing preset steps', (done) => {

        testEpic(switchTutorialEpic, 1, [
            onLocationChanged({
                pathname: '/dashboard/001'
            }),
            initTutorial('id', [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('default');
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    'default_tutorial': [],
                    'default_mobile_tutorial': []
                }
            }
        });

    });
});
