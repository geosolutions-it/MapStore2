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
const {configureMap, mapInfoLoaded} = require('../../actions/config');
const {SHOW_NOTIFICATION} = require('../../actions/notifications');

const {manageAutoMapUpdate} = require('../automapupdate');
const rootEpic = combineEpics(manageAutoMapUpdate);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('autorefresh Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('refreshes map', (done) => {

        let configuration = configureMap({}, "id");

        let information = mapInfoLoaded({
            canEdit: true
        }, "id");

        store.dispatch(configuration);
        store.dispatch(information);

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(3);
                expect(actions[2].type).toBe(SHOW_NOTIFICATION);
            } catch (e) {
                return done(e);
            }
            done();
        }, 500);

    });

    it('refreshes map without login', (done) => {

        let configuration = configureMap({
            version: 2
        }, "id");

        let information = mapInfoLoaded({
            canEdit: true
        }, "id");

        store.dispatch(configuration);
        store.dispatch(information);

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(2);
            } catch (e) {
                return done(e);
            }
            done();
        }, 500);

    });
});
