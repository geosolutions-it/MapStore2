/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

import {
    refreshLayers,
    LAYERS_REFRESHED,
    LAYERS_REFRESH_ERROR,
    UPDATE_NODE,
    updateLayerDimension,
    CHANGE_LAYER_PARAMS,
    updateSettingsParams,
    UPDATE_SETTINGS,
    layerLoad
} from '../../actions/layers';

import { SET_CONTROL_PROPERTY } from '../../actions/controls';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { testEpic } from './epicTestUtils';
import { refresh, updateDimension, updateSettingsParamsEpic } from '../layers';
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

    it('test updateSettingsParamsEpic with layer name', done => {
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
                },
                flat: [{
                    id: 'layerId',
                    name: 'layerName',
                    opacity: 1
                }]
            }
        };

        testEpic(
            updateSettingsParamsEpic,
            3,
            [updateSettingsParams({name: 'layerName_changed'}, true), layerLoad('layerId')],
            actions => {
                expect(actions.length).toBe(3);
                expect(actions[0].type).toBe(UPDATE_SETTINGS);
                expect(actions[0].options).toEqual({name: 'layerName_changed'});
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[1].control).toBe('layersettings');
                expect(actions[1].property).toBe('originalSettings');
                expect(actions[1].value).toEqual({name: 'layerName'});
                expect(actions[2].type).toBe(UPDATE_NODE);
                expect(actions[2].node).toEqual('layerId');
                expect(actions[2].nodeType).toEqual('layers');
                expect(actions[2].options).toEqual({opacity: 1, name: 'layerName_changed'});
            }, state, done);
    });

    it('test updateSettingsParamsEpic with layer name with layer load error', done => {
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
                },
                flat: [{
                    id: 'layerId',
                    name: 'layerName',
                    opacity: 1
                }]
            }
        };

        testEpic(
            updateSettingsParamsEpic,
            4,
            [updateSettingsParams({name: 'layerName_changed'}, true), layerLoad('layerId', true)],
            actions => {
                expect(actions.length).toBe(4);
                expect(actions[0].type).toBe(UPDATE_SETTINGS);
                expect(actions[0].options).toEqual({name: 'layerName_changed'});
                expect(actions[1].type).toBe(SET_CONTROL_PROPERTY);
                expect(actions[1].control).toBe('layersettings');
                expect(actions[1].property).toBe('originalSettings');
                expect(actions[1].value).toEqual({name: 'layerName'});
                expect(actions[2].type).toBe(UPDATE_NODE);
                expect(actions[2].node).toEqual('layerId');
                expect(actions[2].nodeType).toEqual('layers');
                expect(actions[2].options).toEqual({opacity: 1, name: 'layerName_changed'});
                expect(actions[3].type).toBe(SHOW_NOTIFICATION);
                expect(actions[3].level).toBe('error');
            }, state, done);
    });
});
