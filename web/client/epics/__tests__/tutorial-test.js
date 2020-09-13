/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {getActionsFromStepEpic, switchTutorialEpic, switchGeostoryTutorialEpic} = require('../tutorial');
const {SETUP_TUTORIAL, updateTutorial, initTutorial} = require('../../actions/tutorial');
const {geostoryLoaded, setEditing} = require('../../actions/geostory');
const {testEpic, addTimeoutEpic, TEST_TIMEOUT} = require('./epicTestUtils');
const { onLocationChanged } = require('connected-react-router');

describe('tutorial Epics', () => {
    const GEOSTORY_EDIT_STEPS = [{
        translationHTML: "geostoryIntroEdit",
        selector: "#intro-tutorial"
    }];

    const GEOSTORY_VIEW_STEPS = [{
        translationHTML: "geostoryIntroView",
        selector: "#intro-tutorial"
    }];
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
    it('switchTutorialEpic selecting geostory_edit_tutorial preset for newgeostory page', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(switchTutorialEpic, NUM_ACTIONS, [
            onLocationChanged({
                pathname: '/geostory/newgeostory'
            }),
            initTutorial("", [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('geostory');
                    expect(action.steps).toBe(GEOSTORY_EDIT_STEPS);
                    expect(action.stop).toBe(false);
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
                    'default_mobile_tutorial': [],
                    'geostory_edit_tutorial': GEOSTORY_EDIT_STEPS,
                    'geostory_view_tutorial': GEOSTORY_VIEW_STEPS
                }
            },
            geostory: {mode: "edit"}
        });

    });
    it('switchTutorialEpic selecting geostory_view_tutorial preset for story viewer page', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(switchTutorialEpic, NUM_ACTIONS, [
            onLocationChanged({
                pathname: '/geostory/123'
            }),
            initTutorial("", [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe('geostory');
                    expect(action.steps).toBe(GEOSTORY_VIEW_STEPS);
                    expect(action.stop).toBe(true);
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
                    'default_mobile_tutorial': [],
                    'geostory_edit_tutorial': GEOSTORY_EDIT_STEPS,
                    'geostory_view_tutorial': GEOSTORY_VIEW_STEPS
                }
            },
            geostory: {mode: "view"}
        });

    });
    it('switchTutorialEpic selecting geostory_view_tutorial preset for story viewer page, missing presetList', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(addTimeoutEpic(switchTutorialEpic, 50), NUM_ACTIONS, [
            onLocationChanged({
                pathname: '/geostory/newgeostory'
            }),
            initTutorial("", [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                }
            },
            geostory: {mode: "view"}
        });

    });
    it('switchTutorialEpic loads correct tutorial for context', (done) => {
        const NUM_ACTIONS = 1;
        testEpic(switchTutorialEpic, NUM_ACTIONS, [
            onLocationChanged({
                pathname: '/context-creator/new'
            }),
            initTutorial("", [], {}, null, {}, {})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((action) => {
                switch (action.type) {
                case SETUP_TUTORIAL:
                    expect(action.id).toBe("contextcreator_generalsettings_tutorial");
                    expect(action.steps).toEqual({context: "steps"});
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, {
            tutorial: {
                presetList: {
                    "contextcreator_generalsettings_tutorial": {
                        context: "steps"
                    }
                }
            }
        });
    });

    describe("tests for switchGeostoryTutorialEpic", () => {
        beforeEach(() => {
            localStorage.setItem("mapstore.plugin.tutorial.geostory.disabled", "false");
        });
        const GEOSTORY_TUTORIAL_ID = "geostory";
        const ID_STORY = "1";
        const NUM_ACTIONS = 1;
        it('tests the correct tutorial setup when passing from view to edit (switchGeostoryTutorialEpic)', (done) => {
            const IS_GOING_TO_EDIT_MODE = true;

            testEpic(switchGeostoryTutorialEpic, NUM_ACTIONS, [
                geostoryLoaded(ID_STORY),
                setEditing(IS_GOING_TO_EDIT_MODE)
            ], (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case SETUP_TUTORIAL:
                        expect(action.id).toBe(GEOSTORY_TUTORIAL_ID);
                        expect(action.steps).toEqual(GEOSTORY_EDIT_STEPS);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                tutorial: {
                    presetList: {
                        'geostory_edit_tutorial': GEOSTORY_EDIT_STEPS,
                        'geostory_view_tutorial': GEOSTORY_VIEW_STEPS
                    }
                }
            });
        });
        it('tests the correct tutorial setup when passing from edit to view (switchGeostoryTutorialEpic)', (done) => {
            const IS_GOING_TO_EDIT_MODE = false;

            testEpic(switchGeostoryTutorialEpic, NUM_ACTIONS, [
                setEditing(IS_GOING_TO_EDIT_MODE)
            ], (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case SETUP_TUTORIAL:
                        expect(action.steps).toEqual(GEOSTORY_VIEW_STEPS);
                        expect(action.stop).toEqual(true);
                        expect(action.id).toBe(GEOSTORY_TUTORIAL_ID);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                tutorial: {
                    presetList: {
                        'geostory_edit_tutorial': GEOSTORY_EDIT_STEPS,
                        'geostory_view_tutorial': GEOSTORY_VIEW_STEPS
                    }
                }
            });
        });
        it('tests when steps are not correctly configured, back off to default (switchGeostoryTutorialEpic)', (done) => {
            const IS_GOING_TO_EDIT_MODE = false;

            testEpic(addTimeoutEpic(switchGeostoryTutorialEpic, 50), NUM_ACTIONS, [
                geostoryLoaded(ID_STORY),
                setEditing(IS_GOING_TO_EDIT_MODE)
            ], (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                tutorial: {
                    presetList: {
                        'default': [{
                            translationHTML: "default",
                            selector: "#intro-tutorial"
                        }]
                    }
                }
            });
        });
        it('does not setup tutorial if it has been disabled (switchGeostoryTutorialEpic)', (done) => {
            const IS_GOING_TO_EDIT_MODE = false;
            localStorage.setItem("mapstore.plugin.tutorial.geostory.disabled", "true");

            testEpic(addTimeoutEpic(switchGeostoryTutorialEpic, 50), NUM_ACTIONS, [
                geostoryLoaded(ID_STORY),
                setEditing(IS_GOING_TO_EDIT_MODE)
            ], (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case TEST_TIMEOUT:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                localStorage.setItem("mapstore.plugin.tutorial.geostory.disabled", "false");
                done();
            }, {
                tutorial: {
                    presetList: {
                        'default': [{
                            translationHTML: "default",
                            selector: "#intro-tutorial"
                        }]
                    }
                }
            });
        });
    });
});
