/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { onEpic } from '../controls';
const rootEpic = combineEpics(onEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

import { TOGGLE_CONTROL, toggleControl, resetControls, RESET_CONTROLS, on } from '../../actions/controls';

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
