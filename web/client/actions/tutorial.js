/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const START_TUTORIAL = 'START_TUTORIAL';
export const INIT_TUTORIAL = 'INIT_TUTORIAL';
export const SETUP_TUTORIAL = 'SETUP_TUTORIAL';
export const UPDATE_TUTORIAL = 'UPDATE_TUTORIAL';
export const DISABLE_TUTORIAL = 'DISABLE_TUTORIAL';
export const RESET_TUTORIAL = 'RESET_TUTORIAL';
export const CLOSE_TUTORIAL = 'CLOSE_TUTORIAL';
export const TOGGLE_TUTORIAL = 'TOGGLE_TUTORIAL';
export const CHANGE_PRESET = 'CHANGE_PRESET';

export function startTutorial() {
    return {
        type: START_TUTORIAL
    };
}

export function initTutorial(id, steps, style, checkbox, defaultStep, presetList) {
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
export function setupTutorial(id, steps, style, checkbox, defaultStep, stop, presetGroup, ignoreDisabled) {
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

export function updateTutorial(tour, steps) {
    return {
        type: UPDATE_TUTORIAL,
        tour,
        steps
    };
}

export function disableTutorial() {
    return {
        type: DISABLE_TUTORIAL
    };
}


export function resetTutorial() {
    return {
        type: RESET_TUTORIAL
    };
}

export function closeTutorial() {
    return {
        type: CLOSE_TUTORIAL
    };
}

export function toggleTutorial() {
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
export const changePreset = (preset, presetGroup, ignoreDisabled) => ({
    type: CHANGE_PRESET,
    preset,
    presetGroup,
    ignoreDisabled
});
