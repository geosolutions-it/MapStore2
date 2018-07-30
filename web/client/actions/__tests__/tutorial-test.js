/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

var {
    START_TUTORIAL,
    SETUP_TUTORIAL,
    INIT_TUTORIAL,
    UPDATE_TUTORIAL,
    DISABLE_TUTORIAL,
    RESET_TUTORIAL,
    CLOSE_TUTORIAL,
    TOGGLE_TUTORIAL,
    startTutorial,
    initTutorial,
    setupTutorial,
    updateTutorial,
    disableTutorial,
    resetTutorial,
    closeTutorial,
    toggleTutorial
} = require('../tutorial');

describe('Test the tutorial actions', () => {

    it('startTutorial', () => {
        const retval = startTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(START_TUTORIAL);
    });

    it('initTutorial', () => {
        const id = 'id';
        const steps = 'steps';
        const style = 'style';
        const checkbox = 'checkbox';
        const defaultStep = 'defaultStep';
        const presetList = 'presetList';
        const retval = initTutorial(id, steps, style, checkbox, defaultStep, presetList);
        expect(retval).toExist();
        expect(retval.type).toBe(INIT_TUTORIAL);
        expect(retval.id).toBe(id);
        expect(retval.steps).toBe(steps);
        expect(retval.style).toBe(style);
        expect(retval.checkbox).toBe(checkbox);
        expect(retval.defaultStep).toBe(defaultStep);
        expect(retval.presetList).toBe(presetList);
    });

    it('setupTutorial', () => {
        const id = 'id';
        const steps = 'steps';
        const style = 'style';
        const checkbox = 'checkbox';
        const defaultStep = 'defaultStep';
        const stop = true;
        const retval = setupTutorial(id, steps, style, checkbox, defaultStep, stop);
        expect(retval).toExist();
        expect(retval.type).toBe(SETUP_TUTORIAL);
        expect(retval.id).toBe(id);
        expect(retval.steps).toBe(steps);
        expect(retval.style).toBe(style);
        expect(retval.checkbox).toBe(checkbox);
        expect(retval.defaultStep).toBe(defaultStep);
        expect(retval.stop).toBe(stop);
    });

    it('updateTutorial', () => {
        const tour = 'tour';
        const steps = 'steps';
        const retval = updateTutorial(tour, steps);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_TUTORIAL);
        expect(retval.tour).toBe(tour);
        expect(retval.steps).toBe(steps);
    });

    it('disableTutorial', () => {
        const retval = disableTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(DISABLE_TUTORIAL);
    });

    it('resetTutorial', () => {
        const retval = resetTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_TUTORIAL);
    });

    it('closeTutorial', () => {
        const retval = closeTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(CLOSE_TUTORIAL);
    });

    it('toggleTutorial', () => {
        const retval = toggleTutorial();
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_TUTORIAL);
    });

});
