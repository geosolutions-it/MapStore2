/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    START_TUTORIAL,
    INIT_TUTORIAL,
    SETUP_TUTORIAL,
    UPDATE_TUTORIAL,
    DISABLE_TUTORIAL,
    RESET_TUTORIAL,
    CLOSE_TUTORIAL,
    TOGGLE_TUTORIAL
} from '../actions/tutorial';

import React from 'react';
import I18N from '../components/I18N/I18N';

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
import { getApi } from '../api/userPersistedStorage';

function tutorial(state = initialState, action) {
    switch (action.type) {
    case START_TUTORIAL:
        return Object.assign({}, state, {
            run: true,
            start: true,
            status: 'run'
        });
    case INIT_TUTORIAL:
        return Object.assign({}, state, {
            style: action.style,
            defaultStep: action.defaultStep,
            checkbox: action.checkbox,
            presetList: action.presetList
        });
    case SETUP_TUTORIAL:
        let setup = {};
        setup.steps = [].concat(action.steps);
        setup.id = action.id;
        setup.checkbox = action.checkbox ? action.checkbox : Object.assign({}, state.checkbox);
        setup.style = action.style ? action.style : Object.assign({}, state.style);
        setup.defaultStep = action.defaultStep ? action.defaultStep : Object.assign({}, state.defaultStep);
        setup.disabled = false;
        setup.presetGroup = action.presetGroup;
        let isActuallyDisabled = false;
        try {
            isActuallyDisabled = getApi().getItem('mapstore.plugin.tutorial.' + action.id + '.disabled') === 'true';
        } catch (e) {
            console.error(e);
        }

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
            Object.assign(style, step.style);
            return Object.assign({}, setup.defaultStep, step, {
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
                return Object.assign({}, step, {index});
            });

            setup.run = false;
            setup.start = false;
            setup.status = 'close';
        }

        return Object.assign({}, state, setup);
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
                    return Object.assign({}, step, {index});
                });
            } else if (action.tour.type === 'error:target_not_found') {
                update.status = 'error';
                update.stepIndex = action.tour.index;
                update.tourAction = action.tour.action;
            }
        }
        return Object.assign({}, state, update);
    case DISABLE_TUTORIAL:
        let disabled = !state.disabled;
        const presetGroup = state.presetGroup || [state.id];

        presetGroup.forEach(curId => {
            try {
                getApi().setItem('mapstore.plugin.tutorial.' + curId + '.disabled', disabled);
            } catch (e) {
                console.error(e);
            }
        });

        return Object.assign({}, state, {
            disabled
        });
    case RESET_TUTORIAL:
        return Object.assign({}, state, {
            steps: [],
            run: false,
            start: false,
            status: 'close',
            enabled: false
        });
    case CLOSE_TUTORIAL:
        return Object.assign({}, state, {
            run: false,
            start: false,
            status: 'close',
            enabled: false
        });
    case TOGGLE_TUTORIAL:
        return Object.assign({}, state, { enabled: !state.enabled });
    default:
        return state;
    }
}

export default tutorial;
