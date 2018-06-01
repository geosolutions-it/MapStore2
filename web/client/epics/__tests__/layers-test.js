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
const {
    refreshLayers, LAYERS_REFRESHED, LAYERS_REFRESH_ERROR, UPDATE_NODE,
    updateLayerDimension, CHANGE_LAYER_PARAMS
} = require('../../actions/layers');
const {
    testEpic
} = require('./epicTestUtils');

const { refresh, updateDimension } = require('../layers');
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
    it('test update dimension', done => {
        const state = {
            layers: {
                flat: [{
                    group: 'test',
                    id: 'layer001',
                    visibility: true,
                    dimensions: [{
                        name: 'time'
                    }]
                },
                {
                    group: 'test',
                    id: 'layer002',
                    visibility: true,
                    dimensions: [{
                        name: 'time'
                    }, {
                        name: 'elevation'
                    }]
                }]
            }
        };
        testEpic(
            updateDimension,
            1,
            updateLayerDimension('time', "2016-02-24T03:00:00.000Z"),
            actions => {
                expect(actions.length).toBe(1);
                actions.map((action) => {
                    switch (action.type) {
                        case CHANGE_LAYER_PARAMS:
                            expect(action.layer.length).toBe(2);
                            expect(action.params.time).toBe("2016-02-24T03:00:00.000Z");
                            break;
                        default:
                            expect(true).toBe(false);

                    }
                });
                done();
            }, state);
    });
});
