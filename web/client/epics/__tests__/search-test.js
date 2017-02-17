
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware } = require('redux-observable');
const { textSearch, TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_LOADING } = require('../../actions/search');
const {searchEpic} = require('../search');
const epicMiddleware = createEpicMiddleware(searchEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('searchEpic', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        // nock.cleanAll();
        epicMiddleware.replaceEpic(searchEpic);
    });

    it('produces the search epic', (done) => {
        let action = {
            ...textSearch("TEST"),
            services: [{
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming.json',
                    typeName: 'topp:states',
                    queriableAttributes: ['STATE_NAME']
                }
            }]
        };

        store.dispatch( action );

        setTimeout(() => {
            let actions = store.getActions();
            expect(actions.length).toBe(4);
            expect(actions[1].type).toBe(TEXT_SEARCH_LOADING);
            expect(actions[2].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
            expect(actions[3].type).toBe(TEXT_SEARCH_LOADING);
            done();
        }, 1000);
    });
});
