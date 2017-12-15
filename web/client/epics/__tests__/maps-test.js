/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const {createEpicMiddleware, combineEpics } = require('redux-observable');
const {
    saveDetails, SET_DETAILS_CHANGED, mapCreated,
    CLOSE_DETAILS_PANEL, closeDetailsPanel
} = require('../../actions/maps');
const {clear, SHOW_NOTIFICATION} = require('../../actions/notifications');
const {TOGGLE_CONTROL} = require('../../actions/controls');
const {RESET_CURRENT_MAP} = require('../../actions/currentMap');

const {setDetailsChangedEpic, mapCreatedNotificationEpic, closeDetailsPanelEpic} = require('../maps');
const rootEpic = combineEpics(setDetailsChangedEpic, mapCreatedNotificationEpic, closeDetailsPanelEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('maps Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('test setDetailsChangedEpic', (done) => {

        store.dispatch(saveDetails("<p>some details</p>"));

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(2);
                expect(actions[1].type).toBe(SET_DETAILS_CHANGED);
            } catch (e) {
                return done(e);
            }
            done();
        }, 100);

    });
    it('test mapCreatedNotificationEpic', (done) => {

        store.dispatch(mapCreated(1, {name: "name", description: "description"}, "content", null));
        store.dispatch(clear());

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(3);
                expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            } catch (e) {
                return done(e);
            }
            done();
        }, 100);

    });
    it('test closeDetailsPanel', (done) => {

        store.dispatch(closeDetailsPanel());

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(3);
                expect(actions[0].type).toBe(CLOSE_DETAILS_PANEL);
                expect(actions[1].type).toBe(TOGGLE_CONTROL);
                expect(actions[2].type).toBe(RESET_CURRENT_MAP);
            } catch (e) {
                return done(e);
            }
            done();
        }, 100);

    });
});
