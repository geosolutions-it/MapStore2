/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const tutorial = require('../tutorial');
const {START_TUTORIAL, CLOSE_TUTORIAL, REMOVE_INTRO_TUTORIAL, SET_STEPS_TUTORIAL, TOGGLE_TUTORIAL, CHANGE_STATUS_TUTORIAL} = require('../../actions/tutorial');

describe('Test the tutorial reducer', () => {

    it('start the tutorial', () => {
        const state = tutorial({}, {
            type: START_TUTORIAL
        });
        expect(state.run).toBe(true);
        expect(state.start).toBe(true);
    });

    it('close the tutorial', () => {
        const state = tutorial({}, {
            type: CLOSE_TUTORIAL
        });
        expect(state.run).toBe(false);
        expect(state.start).toBe(false);
    });

    it('remove intro tutorial', () => {
        const state = tutorial({}, {
            type: REMOVE_INTRO_TUTORIAL,
            intro: true
        });
        expect(state.intro).toBe(false);
        expect(state.progress).toBe(true);
        expect(state.skip).toBe(false);
        expect(state.nextLabel).toBe('next');
    });

    it('enable intro tutorial', () => {
        const state = tutorial({}, {
            type: REMOVE_INTRO_TUTORIAL,
            intro: false
        });
        expect(state.intro).toBe(true);
        expect(state.progress).toBe(false);
        expect(state.skip).toBe(true);
        expect(state.nextLabel).toBe('start');
    });

    it('set the steps of the tutorial', () => {
        const state = tutorial({}, {
            type: SET_STEPS_TUTORIAL,
            steps: 'steps'
        });
        expect(state.steps).toBe('steps');
    });

    it('toggle the tutorial checkbox first time', () => {
        const state = tutorial({}, {
            type: TOGGLE_TUTORIAL
        });
        expect(state.disabled).toBe(true);
    });

    it('toggle the tutorial checkbox', () => {
        const state = tutorial({
            disabled: true
        }, {
            type: TOGGLE_TUTORIAL
        });
        expect(state.disabled).toBe(false);
    });

    it('change the tutorial status to get errors', () => {
        const state = tutorial({}, {
            type: CHANGE_STATUS_TUTORIAL,
            status: 'status'
        });
        expect(state.status).toBe('status');
    });

});
