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
const {refreshLayers, LAYERS_REFRESHED, LAYERS_REFRESH_ERROR, UPDATE_NODE} = require('../../actions/layers');

const {refresh } = require('../layers');
const rootEpic = combineEpics(refresh);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

describe('layers Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('refreshes layers', (done) => {
        let action = refreshLayers([{
            url: 'base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml',
            name: 'tasmania'
        }], {
            bbox: true,
            search: true,
            dimensions: true,
            title: true
        });

        store.dispatch( {
            ...action,
            debounceTime: 0
        } );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length === 3) {
                expect(actions[1].type).toBe(LAYERS_REFRESHED);
                expect(actions[2].type).toBe(UPDATE_NODE);
                done();
            }
        });
    });

    it('refreshes layers with error', (done) => {
        let action = refreshLayers([{
            url: 'base/web/client/test-resources/wms/GetCapabilities-1.1.1.xml',
            name: 'notworking'
        }], {
            bbox: true,
            search: true,
            dimensions: true,
            title: true
        });

        store.dispatch( {
            ...action,
            debounceTime: 0
        });

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length === 2) {
                expect(actions[1].type).toBe(LAYERS_REFRESH_ERROR);
                done();
            }
        });
    });
});
