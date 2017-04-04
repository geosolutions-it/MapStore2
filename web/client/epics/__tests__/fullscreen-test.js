
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {toggleFullscreen} = require('../../actions/fullscreen');
const {SET_CONTROL_PROPERTY} = require('../../actions/controls');
const screenfull = require('screenfull');

const {toggleFullscreenEpic } = require('../fullscreen');
const rootEpic = combineEpics(toggleFullscreenEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('search Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
        screenfull.exit();
    });

    it('produces the search epic', (done) => {
        let changed = false;
        let action = toggleFullscreen(true, "html");
        if ( screenfull.enabled ) {
            screenfull.onchange( () => {changed = true; });
        }
        store.dispatch( action );

        const actions = store.getActions();
        expect(actions.length).toBe(2);
        expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);

        setTimeout( () => {
            // emulate user exit by hitting esc
            if ( screenfull.enabled ) {
                screenfull.exit();
            }
            setTimeout( () => {
                const newActions = store.getActions();
                if ( screenfull.enabled ) {
                    expect(newActions.length).toBe(3);
                    expect(actions[2].type).toBe(SET_CONTROL_PROPERTY);
                    expect(changed).toBe(true);
                }
                done();
            }, 10);

        }, 10);

    });
});
