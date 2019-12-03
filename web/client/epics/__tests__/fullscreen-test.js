
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

const {toggleFullscreenEpic} = require('../fullscreen');
const rootEpic = combineEpics(toggleFullscreenEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('fullscreen Epics', () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach(() => {
        beforeEach((done) => {
            document.body.innerHTML = '';
            setTimeout(done);
        });
        epicMiddleware.replaceEpic(rootEpic);
        screenfull.exit();
    });

    it('produces the fullscreen epic', (done) => {
        // commented lines do not work on chrome. Only on Firefox
        // Uncomment them to better test this component
        // let changed = false;
        let action = toggleFullscreen(true, "html");
        if ( screenfull.enabled ) {
            // screenfull.onchange( () => {changed = true; });
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
                    expect(newActions.length >= 2).toBe(true);
                    expect(newActions[actions.length - 1].type).toBe(SET_CONTROL_PROPERTY);
                    // expect(changed).toBe(true);
                }
                done();
            }, 10);

        }, 10);

    });
});
