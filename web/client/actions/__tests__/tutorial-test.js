/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    START_TUTORIAL,
    CLOSE_TUTORIAL,
    REMOVE_INTRO_TUTORIAL,
    SET_STEPS_TUTORIAL,
    TOGGLE_TUTORIAL,
    CHANGE_STATUS_TUTORIAL,
    startTutorial,
    closeTutorial,
    removeIntroTutorial,
    setStepsTutorial,
    toggleTutorial,
    changeStatusTutorial,
    setupTutorial,
    removeIntro,
    updateTutorial,
    disableTutorial,
    resetTutorial
} = require('../tutorial');

describe('Test the tutorial actions', () => {
    it('startTutorial', () => {
        var retval = startTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(START_TUTORIAL);
    });

    it('closeTutorial', () => {
        var retval = closeTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(CLOSE_TUTORIAL);
    });

    it('removeIntroTutorial', () => {
        var intro = 'intro';
        var retval = removeIntroTutorial(intro);
        expect(retval).toExist();
        expect(retval.type).toBe(REMOVE_INTRO_TUTORIAL);
        expect(retval.intro).toBe(intro);
    });

    it('setStepsTutorial', () => {
        var steps = 'steps';
        var retval = setStepsTutorial(steps);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_STEPS_TUTORIAL);
        expect(retval.steps).toBe(steps);
    });

    it('toggleTutorial', () => {
        var retval = toggleTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_TUTORIAL);
    });

    it('changeStatusTutorial', () => {
        var status = 'status';
        var retval = changeStatusTutorial(status);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_STATUS_TUTORIAL);
        expect(retval.status).toBe(status);
    });

    it('setupTutorial', () => {

        var steps = [{
            selector: '#intro-tutorial'
        }];

        function getState() {
            return {
                controls: {
                    tutorial: {}
                },
                tutorial: {
                    intro: true
                }
            };
        }

        setupTutorial(steps)((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(1);
                    break;
                case START_TUTORIAL:
                    expect(action.type).toBe('START_TUTORIAL');
                    break;
                default:
            }
        }, getState);

        steps = [{
            selector: '#selector'
        }];

        setupTutorial(steps)((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(1);
                    break;
                case REMOVE_INTRO_TUTORIAL:
                    expect(action.intro).toBe(true);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                default:
            }
        }, getState);

    });

    it('removeIntro', () => {
        var tour = {
            action: 'close'
        };

        const steps = [{
            selector: '#intro-tutorial'
        }];

        removeIntro((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(0);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                default:
            }
        }, steps, tour);
    });

    it('updateTutorial', () => {

        var tour = {
            action: 'next',
            type: 'after'
        };

        const steps = [{}];

        const error = {
            text: 'error',
            style: {}
        };

        function getStateIntro() {
            return {
                controls: {
                    tutorial: {}
                },
                tutorial: {
                    intro: true
                }
            };
        }

        updateTutorial(tour, steps, error)((action) => {
            switch (action.type) {
                case REMOVE_INTRO_TUTORIAL:
                    expect(action.intro).toBe(true);
                    break;
                case CHANGE_STATUS_TUTORIAL:
                    expect(action.status).toBe('after');
                    break;
                default:
            }
        }, getStateIntro);

        function getStateNoIntro() {
            return {
                controls: {
                    tutorial: {}
                },
                tutorial: {
                    intro: false
                }
            };
        }

        tour.action = 'close';

        updateTutorial(tour, steps, error)((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(1);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                case 'SET_CONTROL_PROPERTY':
                    expect(action.control).toBe('tutorial');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                case CHANGE_STATUS_TUTORIAL:
                    expect(action.status).toBe('after');
                    break;
                default:
            }
        }, getStateNoIntro);

        tour.action = 'skip';

        updateTutorial(tour, steps, error)((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(1);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                case 'SET_CONTROL_PROPERTY':
                    expect(action.control).toBe('tutorial');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                case CHANGE_STATUS_TUTORIAL:
                    expect(action.status).toBe('after');
                    break;
                default:
            }
        }, getStateNoIntro);

        tour.action = 'finished';

        updateTutorial(tour, steps, error)((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(1);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                case 'SET_CONTROL_PROPERTY':
                    expect(action.control).toBe('tutorial');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                case CHANGE_STATUS_TUTORIAL:
                    expect(action.status).toBe('after');
                    break;
                default:
            }
        }, getStateNoIntro);

        tour.action = 'next';
        tour.type = 'error:target_not_found';
        tour.index = 0;

        updateTutorial(tour, steps, error)((action) => {
            switch (action.type) {
                case CHANGE_STATUS_TUTORIAL:
                    expect(action.status).toBe('error:target_not_found');
                    break;
                default:
            }
        }, getStateNoIntro);
    });

    it('disableTutorial', () => {
        function getState() {
            return {};
        }

        disableTutorial()((action) => {
            switch (action.type) {
                case TOGGLE_TUTORIAL:
                    expect(action.type).toBe('TOGGLE_TUTORIAL');
                    break;
                default:
            }
        }, getState);
    });

    it('resetTutorial', () => {
        function getState() {
            return {
                controls: {
                    tutorial: {}
                }
            };
        }

        resetTutorial()((action) => {
            switch (action.type) {
                case SET_STEPS_TUTORIAL:
                    expect(action.steps.length).toBe(0);
                    break;
                case REMOVE_INTRO_TUTORIAL:
                    expect(action.intro).toBe(false);
                    break;
                case CLOSE_TUTORIAL:
                    expect(action.type).toBe('CLOSE_TUTORIAL');
                    break;
                case 'SET_CONTROL_PROPERTY':
                    expect(action.control).toBe('tutorial');
                    expect(action.property).toBe('enabled');
                    expect(action.value).toBe(false);
                    expect(action.toggle).toBe(undefined);
                    break;
                default:
            }
        }, getState);
    });
});
