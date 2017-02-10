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
            if (step.selector === '#intro-tutorial') {
                hasIntro = true;
            }
        });
        if (disabled === 'true' || !hasIntro) {
            steps = steps.filter((step) => {
                return step.selector !== '#intro-tutorial';
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

function removeIntro(dispatch, oldSteps, tour) {
    let steps = oldSteps.filter((step) => {
        return step.selector !== '#intro-tutorial';
    });
    dispatch(setStepsTutorial(steps));
    if (tour.action !== 'next') {
        dispatch(closeTutorial());
    }
}

function updateTutorial(tour, updateSteps, error) {
    return (dispatch, getState) => {
        var state;
        var steps;
        if (tour && updateSteps) {
            state = getState();
            steps = assign([], updateSteps);
            if (tour.action !== 'start' && state.tutorial.intro) {
                dispatch(removeIntroTutorial(true));
                removeIntro(dispatch, steps, tour);
            }else if (tour.action === 'skip' || tour.action === 'close' || tour.type === 'finished') {
                steps = steps.filter((step) => {
                    return step.selector !== '#error-tutorial';
                });
                dispatch(setStepsTutorial(steps));
                dispatch(closeTutorial());
                if (state.controls && state.controls.tutorial) {
                    dispatch(setControlProperty('tutorial', 'enabled', false));
                }
            }else if (tour.type === 'error:target_not_found') {
                let errorStep = steps[tour.index];
                let text = error && error.text || '';
                let style = error && error.style || {};
                steps = steps.filter((step) => {
                    return step.selector !== '#error-tutorial';
                });
                assign(errorStep, {
                    selector: '#error-tutorial',
                    text: text,
                    position: 'top',
                    style: style
                });
                removeIntro(dispatch, steps, tour);
            }
            dispatch(changeStatusTutorial(tour.type));
        }
    };
}

function disableTutorial() {
    return (dispatch, getState) => {
        dispatch(toggleTutorial());
        let state = getState();
        let disabled = state && state.tutorial && state.tutorial.disabled;
        localStorage.setItem('mapstore.plugin.tutorial.disabled', disabled);
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
    removeIntro,
    updateTutorial,
    disableTutorial,
    resetTutorial
};
