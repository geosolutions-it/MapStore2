/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    START_TUTORIAL,
    INIT_TUTORIAL,
    SETUP_TUTORIAL,
    UPDATE_TUTORIAL,
    DISABLE_TUTORIAL,
    RESET_TUTORIAL,
    CLOSE_TUTORIAL,
    TOGGLE_TUTORIAL
} = require('../actions/tutorial');

const assign = require('object-assign');
const React = require('react');
const I18N = require('../components/I18N/I18N');

const initialState = {
    run: false,
    start: false,
    steps: [],
    enabled: false,
    disabled: false,
    status: 'close',
    stepIndex: 0,
    tourAction: 'next',
    id: '',
    presetList: {}
};

function tutorial(state = initialState, action) {
    switch (action.type) {
    case START_TUTORIAL:
        return assign({}, state, {
            run: true,
            start: true,
            status: 'run'
        });
    case INIT_TUTORIAL:
        return assign({}, state, {
            style: action.style,
            defaultStep: action.defaultStep,
            checkbox: action.checkbox,
            presetList: action.presetList
        });
    case SETUP_TUTORIAL:
        let setup = {};
        setup.steps = [].concat(action.steps);
        setup.id = action.id;
        setup.checkbox = action.checkbox ? action.checkbox : assign({}, state.checkbox);
        setup.style = action.style ? action.style : assign({}, state.style);
        setup.defaultStep = action.defaultStep ? action.defaultStep : assign({}, state.defaultStep);
        setup.disabled = false;
        setup.presetGroup = action.presetGroup;

        const isActuallyDisabled = localStorage.getItem('mapstore.plugin.tutorial.' + action.id + '.disabled') === 'true';

        setup.steps = setup.steps.filter((step) => {
            return step?.selector?.substring(0, 1) === '#' || step?.selector?.substring(0, 1) === '.';
        }).map((step, index) => {
            let title = step.title ? step.title : '';
            title = step.translation ? <I18N.Message msgId = {"tutorial." + step.translation + ".title"}/> : title;
            title = step.translationHTML ? <I18N.HTML msgId = {"tutorial." + step.translationHTML + ".title"}/> : title;
            let text = step.text ? step.text : '';
            text = step.translation ? <I18N.Message msgId = {"tutorial." + step.translation + ".text"}/> : text;
            text = step.translationHTML ? <I18N.HTML msgId = {"tutorial." + step.translationHTML + ".text"}/> : text;
            text = (step.selector === '#intro-tutorial') && !isActuallyDisabled ? <div><div>{text}</div>{setup.checkbox}</div> : text;
            let style = (step.selector === '#intro-tutorial') ? setup.style : {};
            let isFixed = (step.selector === '#intro-tutorial') ? true : step.isFixed || false;
            assign(style, step.style);
            return assign({}, setup.defaultStep, step, {
                index,
                title,
                text,
                style,
                isFixed
            });
        });

        const isDisabled = isActuallyDisabled && !action.ignoreDisabled;
        let hasIntro = false;
        setup.steps.forEach((step) => {
            if (step.selector === '#intro-tutorial') {
                hasIntro = true;
            }
        });

        setup.run = true;
        setup.start = true;
        setup.status = 'run';

        if (isDisabled || !hasIntro || action.stop) {
            setup.steps = setup.steps.filter((step) => {
                return step.selector !== '#intro-tutorial';
            }).map((step, index) => {
                return assign({}, step, {index});
            });

            setup.run = false;
            setup.start = false;
            setup.status = 'close';
        }

        return assign({}, state, setup);
    case UPDATE_TUTORIAL:
        let update = {};
        update.steps = [].concat(action.steps);
        update.run = true;
        update.start = true;
        update.status = 'run';
        update.stepIndex = state.stepIndex;
        update.tourAction = state.tourAction;

        if (action.tour) {
            if (action.tour.action === 'close' || action.tour.type === 'finished') {
                update.run = false;
                update.start = false;
                update.status = 'close';
                update.steps = update.steps.filter((step) => {
                    return step.selector !== '#intro-tutorial';
                }).map((step, index) => {
                    return assign({}, step, {index});
                });
            } else if (action.tour.type === 'error:target_not_found') {
                update.status = 'error';
                update.stepIndex = action.tour.index;
                update.tourAction = action.tour.action;
            }
        }
        return assign({}, state, update);
    case DISABLE_TUTORIAL:
        let disabled = !state.disabled;
        const presetGroup = state.presetGroup || [state.id];

        presetGroup.forEach(curId => {
            localStorage.setItem('mapstore.plugin.tutorial.' + curId + '.disabled', disabled);
        });

        return assign({}, state, {
            disabled
        });
    case RESET_TUTORIAL:
        return assign({}, state, {
            steps: [],
            run: false,
            start: false,
            status: 'close',
            enabled: false
        });
    case CLOSE_TUTORIAL:
        return assign({}, state, {
            run: false,
            start: false,
            status: 'close',
            enabled: false
        });
    case TOGGLE_TUTORIAL:
        return assign({}, state, { enabled: !state.enabled });
    default:
        return state;
    }
}

module.exports = tutorial;
