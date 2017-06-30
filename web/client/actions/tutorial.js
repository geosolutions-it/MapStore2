/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const START_TUTORIAL = 'START_TUTORIAL';
const INIT_TUTORIAL = 'INIT_TUTORIAL';
const SETUP_TUTORIAL = 'SETUP_TUTORIAL';
const UPDATE_TUTORIAL = 'UPDATE_TUTORIAL';
const DISABLE_TUTORIAL = 'DISABLE_TUTORIAL';
const RESET_TUTORIAL = 'RESET_TUTORIAL';
const CLOSE_TUTORIAL = 'CLOSE_TUTORIAL';
const TOGGLE_TUTORIAL = 'TOGGLE_TUTORIAL';

function startTutorial() {
    return {
        type: START_TUTORIAL
    };
}

function initTutorial(id, steps, style, checkbox, defaultStep, presetList) {
    return {
        type: INIT_TUTORIAL,
        id,
        steps,
        style,
        checkbox,
        defaultStep,
        presetList
    };
}

function setupTutorial(id, steps, style, checkbox, defaultStep) {
    return {
        type: SETUP_TUTORIAL,
        id,
        steps,
        style,
        checkbox,
        defaultStep
    };
}

function updateTutorial(tour, steps) {
    return {
        type: UPDATE_TUTORIAL,
        tour,
        steps
    };
}

function disableTutorial() {
    return {
        type: DISABLE_TUTORIAL
    };
}


function resetTutorial() {
    return {
        type: RESET_TUTORIAL
    };
}

function closeTutorial() {
    return {
        type: CLOSE_TUTORIAL
    };
}

function toggleTutorial() {
    return {
        type: TOGGLE_TUTORIAL
    };
}

module.exports = {
    START_TUTORIAL,
    INIT_TUTORIAL,
    SETUP_TUTORIAL,
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
};
