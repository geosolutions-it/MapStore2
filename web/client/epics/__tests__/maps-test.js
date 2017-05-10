
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {attributeUpdated, ATTRIBUTE_UPDATED} = require('../../actions/maps');
const {mapsEpic } = require('../maps');
const rootEpic = combineEpics(mapsEpic);
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

    it('produces the maps epic', (done) => {
        store.dispatch( attributeUpdated(3, "name", "value", "STRING", "success"));

        setTimeout(() => {
            let actions = store.getActions();
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe(ATTRIBUTE_UPDATED);
            done();
        }, 400);
    });
});
