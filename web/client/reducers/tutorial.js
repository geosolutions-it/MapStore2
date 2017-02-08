/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    START_TUTORIAL,
    CLOSE_TUTORIAL,
    REMOVE_INTRO_TUTORIAL,
    SET_STEPS_TUTORIAL,
    TOGGLE_TUTORIAL,
    CHANGE_STATUS_TUTORIAL
} = require('../actions/tutorial');

const assign = require('object-assign');

const initialState = {
    run: false,
    start: false,
    steps: [],
    intro: true,
    progress: false,
    disabled: false,
    skip: true,
    nextLabel: 'start',
    status: ''
};

function tutorialReducer(state = initialState, action) {
    switch (action.type) {
        case START_TUTORIAL:
            return assign({}, state, {
                run: true,
                start: true
            });
        case CLOSE_TUTORIAL:
            return assign({}, state, {
                run: false,
                start: false
            });
        case REMOVE_INTRO_TUTORIAL:
            let label = action.intro ? 'next' : 'start';
            return assign({}, state, {
                intro: !action.intro,
                progress: action.intro,
                skip: !action.intro,
                nextLabel: label
            });
        case SET_STEPS_TUTORIAL:
            return assign({}, state, {
                steps: action.steps
            });
        case TOGGLE_TUTORIAL:
            return assign({}, state, {
                disabled: !state.disabled
            });
        case CHANGE_STATUS_TUTORIAL:
            return assign({}, state, {
                status: action.status
            });
        default:
            return state;
    }
}

module.exports = tutorialReducer;
