/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {onEpic} = require('../controls');
const rootEpic = combineEpics(onEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

const {TOGGLE_CONTROL, toggleControl, resetControls, RESET_CONTROLS, on} = require('../../actions/controls');

describe('controls Epics', () => {
    let store = mockStore({
        controls: {

        }
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('runs conditional actions', (done) => {
        store = mockStore({
            controls: {

            },
            test: true
        });
        let action = on(toggleControl('test'), (state) => state.test, {});

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(TOGGLE_CONTROL);
                done();
            }
        });

        store.dispatch(action);
    });

    it('runs conditional actions else', (done) => {
        store = mockStore({
            controls: {

            },
            test: false
        });
        let action = on(toggleControl('test'), (state) => state.test, resetControls);

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length >= 2) {
                expect(actions[1].type).toBe(RESET_CONTROLS);
                done();
            }
        });

        store.dispatch(action);
    });
});
