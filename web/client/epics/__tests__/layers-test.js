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
    updateLayerDimension, CHANGE_LAYER_PARAMS, updateSettingsParams, UPDATE_SETTINGS
} = require('../../actions/layers');
const { SET_CONTROL_PROPERTY } = require('../../actions/controls');
const {
    testEpic
} = require('./epicTestUtils');

const { refresh, updateDimension, updateSettingsParamsEpic } = require('../layers');
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

    it('test updateSettingsParamsEpic with update to false', done => {

        const state = {
            controls: {
                layersettings: {
                    initialSettings: {
                        id: 'layerid',
                        name: 'layerName',
                        style: ''
                    },
                    originalSettings: {

                    }
                }
            }
        };

        testEpic(
            updateSettingsParamsEpic,
            2,
            updateSettingsParams({style: 'generic'}),
            actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case SET_CONTROL_PROPERTY:
                        expect(action.control).toBe('layersettings');
                        expect(action.property).toBe('originalSettings');
                        expect(action.value).toEqual({ style: '' });
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.options).toEqual({style: 'generic'});
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it('test updateSettingsParamsEpic with update to true', done => {

        const state = {
            controls: {
                layersettings: {
                    initialSettings: {
                        id: 'layerId',
                        name: 'layerName',
                        style: ''
                    },
                    originalSettings: {

                    }
                }
            },
            layers: {
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: { opacity: 1 }
                }
            }
        };

        testEpic(
            updateSettingsParamsEpic,
            3,
            updateSettingsParams({style: 'generic'}, true),
            actions => {
                expect(actions.length).toBe(3);
                actions.map((action) => {
                    switch (action.type) {
                    case SET_CONTROL_PROPERTY:
                        expect(action.control).toBe('layersettings');
                        expect(action.property).toBe('originalSettings');
                        expect(action.value).toEqual({ style: '' });
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.options).toEqual({style: 'generic'});
                        break;
                    case UPDATE_NODE:
                        expect(action.node).toEqual('layerId');
                        expect(action.nodeType).toEqual('layers');
                        expect(action.options).toEqual({opacity: 1, style: 'generic'});
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
});
