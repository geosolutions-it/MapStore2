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
    changeStatusTutorial
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

});
