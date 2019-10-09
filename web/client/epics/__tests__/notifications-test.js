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
const {CLEAR_NOTIFICATIONS} = require('../../actions/notifications');

const {clearNotificationOnLocationChange} = require('../notifications');
const rootEpic = combineEpics(clearNotificationOnLocationChange);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);
const { onLocationChanged } = require('connected-react-router');

describe('notifications Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('test clear notifications on location change', (done) => {

        store.dispatch(onLocationChanged({}));

        setTimeout( () => {
            try {
                const actions = store.getActions();
                expect(actions.length).toBe(2);
                expect(actions[1].type).toBe(CLEAR_NOTIFICATIONS);
            } catch (e) {
                done(e);
            }
            done();
        }, 500);

    });
});
