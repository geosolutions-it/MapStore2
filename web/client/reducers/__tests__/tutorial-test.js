/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const expect = require('expect');
const tutorial = require('../tutorial');

const {
    START_TUTORIAL,
    INIT_TUTORIAL,
    SETUP_TUTORIAL,
    UPDATE_TUTORIAL,
    DISABLE_TUTORIAL,
    RESET_TUTORIAL,
    CLOSE_TUTORIAL,
    TOGGLE_TUTORIAL
} = require('../../actions/tutorial');

describe('Test the tutorial reducer', () => {

    it('default states tutorial', () => {
        const state = tutorial(undefined, {type: 'default'});
        expect(state.steps).toEqual([]);
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.enabled).toBe(false);
        expect(state.status).toBe('close');
        expect(state.stepIndex).toBe(0);
        expect(state.tourAction).toBe('next');
    });

    it('start the tutorial', () => {
        const state = tutorial({}, {
            type: START_TUTORIAL
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
        expect(state.status).toBe('run');
    });

    it('setup the tutorial with intro', () => {
        const state = tutorial({}, {
            type: INIT_TUTORIAL,
            style: 'style',
            defaultStep: 'defaultStep',
            checkbox: 'checkbox',
            presetList: 'presetList'
        });
        expect(state.style).toBe('style');
        expect(state.defaultStep).toBe('defaultStep');
        expect(state.checkbox).toBe('checkbox');
        expect(state.presetList).toBe('presetList');
    });

    it('setup the tutorial with intro', () => {
        const state = tutorial({}, {
            type: SETUP_TUTORIAL,
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            },
            {
                translation: 'test',
                selector: '.step-tutorial'
            },
            {
                translationHTML: 'test',
                selector: '#step-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: 'step-tutorial'
            }],
            checkbox: 'checkbox',
            style: {},
            defaultStep: {}
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
        expect(state.status).toBe('run');
    });

    it('setup the tutorial without intro', () => {
        const state = tutorial({}, {
            type: SETUP_TUTORIAL,
            steps: [{
                translation: 'test',
                selector: '.step-tutorial'
            },
            {
                translationHTML: 'test',
                selector: '#step-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: 'step-tutorial'
            }],
            checkbox: 'checkbox',
            style: {},
            defaultStep: {}
        });

        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
    });

    it('update the tutorial without tour', () => {
        const state = tutorial({}, {
            type: UPDATE_TUTORIAL,
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            }]
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
        expect(state.status).toBe('run');
    });

    it('update the tutorial with tour action close', () => {
        const state = tutorial({}, {
            type: UPDATE_TUTORIAL,
            tour: {
                index: 0,
                action: 'close',
                type: 'next'
            },
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            }]
        });
        expect(state.steps).toEqual([]);
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
    });

    it('update the tutorial with tour type finished', () => {
        const state = tutorial({}, {
            type: UPDATE_TUTORIAL,
            tour: {
                index: 0,
                action: 'next',
                type: 'finished'
            },
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: '#step-tutorial'
            }]
        });
        expect(state.steps).toEqual([{
            index: 0,
            selector: '#step-tutorial',
            text: 'test',
            title: 'test'
        }]);
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
    });

    it('update the tutorial with tour type error', () => {
        const state = tutorial({}, {
            type: UPDATE_TUTORIAL,
            tour: {
                index: 2,
                action: 'next',
                type: 'error:target_not_found'
            },
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            }]
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
        expect(state.status).toBe('error');
        expect(state.stepIndex).toBe(2);
        expect(state.tourAction).toBe('next');
    });

    it('update the tutorial with tour action next', () => {
        const state = tutorial({}, {
            type: UPDATE_TUTORIAL,
            tour: {
                index: 2,
                action: 'next',
                type: 'test'
            },
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            }]
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
        expect(state.status).toBe('run');
    });

    it('disable the tutorial', () => {
        const state = tutorial({
            disabled: true
        }, {
            type: DISABLE_TUTORIAL
        });
        expect(state.disabled).toBe(false);
    });

    it('reset the tutorial', () => {
        const state = tutorial({}, {
            type: RESET_TUTORIAL
        });
        expect(state.steps).toEqual([]);
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
    });

    it('close the tutorial', () => {
        const state = tutorial({}, {
            type: CLOSE_TUTORIAL
        });
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
        expect(state.enabled).toBe(false);
    });

    it('toggle the tutorial', () => {
        const state = tutorial({
            enabled: false
        }, {
            type: TOGGLE_TUTORIAL
        });

        expect(state.enabled).toBe(true);
    });

    it('setup the tutorial with intro but stop flag', () => {
        const state = tutorial({}, {
            type: SETUP_TUTORIAL,
            steps: [{
                title: 'test',
                text: 'test',
                selector: '#intro-tutorial'
            },
            {
                translation: 'test',
                selector: '.step-tutorial'
            },
            {
                translationHTML: 'test',
                selector: '#step-tutorial'
            },
            {
                title: 'test',
                text: 'test',
                selector: 'step-tutorial'
            }],
            checkbox: 'checkbox',
            style: {},
            defaultStep: {},
            stop: true
        });
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
        expect(state.status).toBe('close');
    });

});
