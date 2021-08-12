/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { getActionsFromStepEpic, switchTutorialEpic, switchGeostoryTutorialEpic, openDetailsPanelEpic } from '../tutorial';
import { SETUP_TUTORIAL, updateTutorial, closeTutorial } from '../../actions/tutorial';
import { geostoryLoaded, setEditing } from '../../actions/geostory';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { setApi, getApi } from '../../api/userPersistedStorage';
import { OPEN_DETAILS_PANEL } from './../../actions/details';
import { changeMapType } from './../../actions/maptype';
import { loadFinished } from './../../actions/contextcreator';
import { setEditorAvailable } from './../../actions/dashboard';

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

        testEpic(switchTutorialEpic, 1, setEditorAvailable(true), (actions) => {
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

    it('switchTutorialEpic with viewer path', (done) => {

        testEpic(switchTutorialEpic, 1, changeMapType("cesium"), (actions) => {
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

    it('switchTutorialEpic mobile', (done) => {

        testEpic(switchTutorialEpic, 1, setEditorAvailable(true), (actions) => {
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

        testEpic(switchTutorialEpic, 1, setEditorAvailable(true), (actions) => {
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
        testEpic(switchTutorialEpic, NUM_ACTIONS, geostoryLoaded('newgeostory'), (actions) => {
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
        testEpic(switchTutorialEpic, NUM_ACTIONS, geostoryLoaded('123'), (actions) => {
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
        testEpic(addTimeoutEpic(switchTutorialEpic, 50), NUM_ACTIONS,  geostoryLoaded('newgeostory'), (actions) => {
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
        testEpic(switchTutorialEpic, NUM_ACTIONS, loadFinished(), (actions) => {
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
            getApi().setItem("mapstore.plugin.tutorial.geostory.disabled", "false");
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
        it('tests the correct tutorial setup when passing from edit to view, intercepting throw', (done) => {
            const IS_GOING_TO_EDIT_MODE = true;
            setApi("memoryStorage");
            getApi().setAccessDenied(true);
            testEpic(switchGeostoryTutorialEpic, NUM_ACTIONS, [
                setEditing(IS_GOING_TO_EDIT_MODE)
            ], (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                actions.map((action) => {
                    switch (action.type) {
                    case SETUP_TUTORIAL:
                        expect(action.steps).toEqual(GEOSTORY_EDIT_STEPS);
                        expect(action.stop).toEqual(false);
                        expect(action.id).toBe(GEOSTORY_TUTORIAL_ID);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
                getApi().setAccessDenied(false);
                setApi("localStorage");
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
            getApi().setItem("mapstore.plugin.tutorial.geostory.disabled", "true");

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
                getApi().setItem("mapstore.plugin.tutorial.geostory.disabled", "false");
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
    describe('openDetailsPanelEpic tests', () => {
        it('should open the details panel if it has showAtStartup set to true', (done) => {
            const NUM_ACTIONS = 1;

            testEpic(openDetailsPanelEpic, NUM_ACTIONS, closeTutorial(), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [action] = actions;
                expect(action.type).toBe(OPEN_DETAILS_PANEL);
                done();
            }, {
                map: {
                    present: {
                        info: {
                            detailsSettings: {
                                showAtStartup: true
                            }
                        }
                    }
                }
            });
        });
        it('should open the details panel if it has showAtStartup set to false', (done) => {
            const NUM_ACTIONS = 1;

            testEpic(addTimeoutEpic(openDetailsPanelEpic, 100), NUM_ACTIONS, closeTutorial(), (actions) => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [action] = actions;
                expect(action.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                map: {
                    present: {
                        info: {
                            detailsSettings: {
                                showAtStartup: false
                            }
                        }
                    }
                }
            });
        });
    });
});
