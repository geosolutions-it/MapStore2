/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {setControlProperty} = require('./controls');
const assign = require('object-assign');
const START_TUTORIAL = 'START_TUTORIAL';
const CLOSE_TUTORIAL = 'CLOSE_TUTORIAL';
const REMOVE_INTRO_TUTORIAL = 'REMOVE_INTRO_TUTORIAL';
const SET_STEPS_TUTORIAL = 'SET_STEPS_TUTORIAL';
const TOGGLE_TUTORIAL = 'TOGGLE_TUTORIAL';
const CHANGE_STATUS_TUTORIAL = 'CHANGE_STATUS_TUTORIAL';

function startTutorial() {
    return {
        type: START_TUTORIAL
    };
}

function closeTutorial() {
    return {
        type: CLOSE_TUTORIAL
    };
}

function removeIntroTutorial(intro) {
    return {
        type: REMOVE_INTRO_TUTORIAL,
        intro: intro
    };
}

function setStepsTutorial(steps) {
    return {
        type: SET_STEPS_TUTORIAL,
        steps: steps
    };
}

function toggleTutorial() {
    return {
        type: TOGGLE_TUTORIAL
    };
}

function changeStatusTutorial(status) {
    return {
        type: CHANGE_STATUS_TUTORIAL,
        status: status
    };
}

function setupTutorial(introSteps) {
    return (dispatch, getState) => {
        var state = getState();
        var steps = assign([], introSteps);
        var hasIntro = false;
        var disabled = localStorage.getItem('mapstore.plugin.tutorial.disabled');
        if (state.controls && state.controls.tutorial) {
            dispatch(setControlProperty('tutorial', 'enabled', false));
        }
        steps.map((step) => {
            if (step.selector === '#intro-tutorial' || step.selector === 'intro') {
                hasIntro = true;
            }
        });
        if (disabled === 'true' || !hasIntro) {
            steps = steps.filter((step) => {
                return step.selector !== '#intro-tutorial' && step.selector !== 'intro';
            });
            dispatch(removeIntroTutorial(true));
            dispatch(setStepsTutorial(steps));
            dispatch(closeTutorial());
        } else {
            dispatch(setStepsTutorial(steps));
            if (state.tutorial.intro) {
                dispatch(startTutorial());
            }
        }
    };
}

function updateTutorial(tour, updateSteps) {
    return (dispatch, getState) => {
        var state = getState();
        if (tour.action !== 'start' && state.tutorial.intro) {
            dispatch(removeIntroTutorial(true));
            let steps = assign([], updateSteps);
            steps = steps.filter((step) => {
                return step.selector !== '#intro-tutorial' && step.selector !== 'intro';
            });
            dispatch(setStepsTutorial(steps));
            if (tour.action !== 'next') {
                dispatch(closeTutorial());
            }
        }else if (tour.action === 'skip' || tour.action === 'close' || tour.type === 'finished') {
            dispatch(closeTutorial());
            if (state.controls && state.controls.tutorial) {
                dispatch(setControlProperty('tutorial', 'enabled', false));
            }
        }else if (tour.type === 'error:target_not_found') {
            let steps = assign([], updateSteps);
            steps.splice(tour.index, 1);
            dispatch(setStepsTutorial(steps));
        }

        dispatch(changeStatusTutorial(tour.type));
    };
}

function disableTutorial() {
    return (dispatch, getState) => {
        dispatch(toggleTutorial());
        localStorage.setItem('mapstore.plugin.tutorial.disabled', getState().tutorial.disabled);
    };
}

function resetTutorial() {
    return (dispatch, getState) => {
        let state = getState();
        dispatch(setStepsTutorial([]));
        dispatch(removeIntroTutorial(false));
        dispatch(closeTutorial());
        if (state.controls && state.controls.tutorial) {
            dispatch(setControlProperty('tutorial', 'enabled', false));
        }
    };
}

module.exports = {
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
    updateTutorial,
    disableTutorial,
    resetTutorial
};
