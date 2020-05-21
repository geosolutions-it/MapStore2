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
const CHANGE_PRESET = 'CHANGE_PRESET';

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

/**
 * Setup a tutorial for showing
 * @param {any} id tutorial unique id
 * @param {array} steps tutorial steps
 * @param {any} style
 * @param {element} checkbox 'don't show this again' checkbox element
 * @param {object} defaultStep default step object
 * @param {boolean} stop if true stops the tutorial
 * @param {array} presetGroup array of tutorial ids that will all be disabled if the user checks the checkbox to
 * not show a tutorial again in any of the tutorials in the array
 * @param {boolean} ignoreDisabled setup the tutorial even if it is disabled
 */
function setupTutorial(id, steps, style, checkbox, defaultStep, stop, presetGroup, ignoreDisabled) {
    return {
        type: SETUP_TUTORIAL,
        id,
        steps,
        style,
        checkbox,
        defaultStep,
        stop,
        presetGroup,
        ignoreDisabled
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

/**
 * Programmaticaly change the current tutorial preset, setups it for showing
 * @param {string} preset tutorial id
 * @param {array} presetGroup array of tutorial ids that will all be disabled if the user checks the checkbox to
 * not show a tutorial again in any of the tutorials in the array
 * @param {boolean} ignoreDisabled if true will show the tutorial even if it is disabled
 */
const changePreset = (preset, presetGroup, ignoreDisabled) => ({
    type: CHANGE_PRESET,
    preset,
    presetGroup,
    ignoreDisabled
});

module.exports = {
    START_TUTORIAL,
    INIT_TUTORIAL,
    SETUP_TUTORIAL,
    UPDATE_TUTORIAL,
    DISABLE_TUTORIAL,
    RESET_TUTORIAL,
    CLOSE_TUTORIAL,
    TOGGLE_TUTORIAL,
    CHANGE_PRESET,
    startTutorial,
    initTutorial,
    setupTutorial,
    updateTutorial,
    disableTutorial,
    resetTutorial,
    closeTutorial,
    toggleTutorial,
    changePreset
};
