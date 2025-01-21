/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import {
    updateMapViewsLayers,
    removeMapViewsLayersWhenDeactivated,
    hideMapViewsBasedOnLayoutChanges,
    closePluginWhenMapViewsActivate
} from '../mapviews';

import {
    activateViews,
    SET_PREVIOUS_VIEW,
    HIDE_VIEWS,
    UPDATE_RESOURCES
} from '../../actions/mapviews';
import {
    REMOVE_ADDITIONAL_LAYER,
    UPDATE_ADDITIONAL_LAYER
} from '../../actions/additionallayers';
import { SET_CONTROL_PROPERTY, toggleControl } from '../../actions/controls';
import { MAP_VIEWS_LAYERS_OWNER } from '../../utils/MapViewsUtils';

describe('mapviews epics', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('updateMapViewsLayers', (done) => {

        const feature = {
            type: 'Feature',
            id: 'feature.01',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [
                            8.931329125577776,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40689401356852
                        ]
                    ]
                ]
            },
            properties: {}
        };
        mockAxios.onGet().reply(200, {
            type: 'FeatureCollection',
            features: [feature]
        });
        testEpic(updateMapViewsLayers, 5, activateViews(true), actions => {
            try {
                expect(actions.length).toBe(5);
                expect(actions.map(({ type }) => type)).toEqual([
                    UPDATE_RESOURCES,
                    SET_PREVIOUS_VIEW,
                    REMOVE_ADDITIONAL_LAYER,
                    UPDATE_ADDITIONAL_LAYER,
                    UPDATE_ADDITIONAL_LAYER
                ]);

                expect(actions[3].options.visibility).toBe(false);
                expect(actions[4].options.visibility).toBe(true);
                expect(actions[4].options.style).toBeTruthy();
                expect(actions[4].options.style).toEqual({
                    format: 'geostyler',
                    body: {
                        name: '',
                        rules: [
                            {
                                name: '',
                                symbolizers: [{
                                    kind: 'Fill',
                                    color: '#ffffff',
                                    fillOpacity: 0,
                                    msClampToGround: true,
                                    msClassificationType: '3d'
                                }]
                            }
                        ]
                    }
                });
            } catch (e) {
                done(e);
            }
        }, {
            layers: {
                groups: [
                    { id: 'group_01', visibility: false },
                    { id: 'group_02', visibility: false }
                ],
                flat: [
                    { id: 'layer.01', group: 'group_01', type: '3dtiles', visibility: true },
                    { id: 'layer.02', group: 'group_02', type: 'vector', visibility: true, features: [feature] }
                ]
            },
            maptype: {
                mapType: 'cesium'
            },
            mapviews: {
                selectedId: 'view.01',
                active: true,
                views: [
                    {
                        center: {
                            longitude: 8.936900,
                            latitude: 44.395224,
                            height: 0
                        },
                        cameraPosition: {
                            longitude: 8.939256,
                            latitude: 44.386982,
                            height: 655
                        },
                        mask: {
                            resourceId: 'resource.02',
                            inverse: true,
                            offset: 100
                        },
                        id: 'view.01',
                        title: 'Map view',
                        description: '',
                        duration: 10,
                        flyTo: true,
                        zoom: 16,
                        bbox: [
                            8.920925,
                            44.390840,
                            8.948118,
                            44.405544
                        ],
                        layers: [
                            {
                                id: 'layer.01',
                                clippingLayerResourceId: 'resource.01',
                                clippingPolygonFeatureId: 'feature.01'
                            }
                        ],
                        groups: [
                            {
                                id: 'group_02',
                                visibility: true
                            }
                        ]
                    }
                ],
                resources: [
                    {
                        id: 'resource.01',
                        data: {
                            type: 'wfs',
                            url: '/geoserver/wfs',
                            name: 'clip',
                            title: {
                                'default': 'Clip'
                            },
                            id: 'layer.01'
                        }
                    },
                    {
                        id: 'resource.02',
                        data: {
                            type: 'vector',
                            name: 'mask',
                            title: {
                                'default': 'mask'
                            },
                            id: 'layer.02'
                        }
                    }
                ]
            }
        }, done);
    });

    it('updateMapViewsLayers should not update if the previous and current views are the same', (done) => {
        testEpic(updateMapViewsLayers, 1, activateViews(true), actions => {
            try {
                expect(actions.length).toBe(1);
                expect(actions.map(({ type }) => type)).toEqual([
                    SET_PREVIOUS_VIEW
                ]);
            } catch (e) {
                done(e);
            }
        }, {
            mapviews: {
                active: true
            }
        }, done);
    });

    it('removeMapViewsLayersWhenDeactivated', (done) => {
        testEpic(removeMapViewsLayersWhenDeactivated, 2, activateViews(false), actions => {
            expect(actions.length).toBe(2);
            expect(actions[0].type).toBe(REMOVE_ADDITIONAL_LAYER);
            expect(actions[0].owner).toBe(MAP_VIEWS_LAYERS_OWNER);
            expect(actions[1].type).toBe(SET_PREVIOUS_VIEW);
            expect(actions[1].view).toBe(undefined);
        }, {}, done);
    });
    it('hideMapViewsBasedOnLayoutChanges', (done) => {
        testEpic(hideMapViewsBasedOnLayoutChanges, 3, toggleControl('drawer', 'enabled'), actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(REMOVE_ADDITIONAL_LAYER);
            expect(actions[0].owner).toBe(MAP_VIEWS_LAYERS_OWNER);
            expect(actions[1].type).toBe(SET_PREVIOUS_VIEW);
            expect(actions[1].view).toBe(undefined);
            expect(actions[2].type).toBe(HIDE_VIEWS);
            expect(actions[2].hide).toBe(true);
        }, {
            controls: {
                drawer: {
                    enabled: true
                }
            }
        }, done);
    });
    it('hideMapViewsBasedOnLayoutChanges when a panel is closed', (done) => {
        testEpic(hideMapViewsBasedOnLayoutChanges, 1, toggleControl('drawer', 'enabled'), actions => {
            expect(actions[0].type).toBe(HIDE_VIEWS);
            expect(actions[0].hide).toBe(false);
        }, {
            controls: {
                drawer: {
                    enabled: false
                }
            }
        }, done);
    });
    it('closePluginWhenMapViewsActivate', (done) => {
        testEpic(closePluginWhenMapViewsActivate, 4, activateViews(true), actions => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([
                    SET_CONTROL_PROPERTY,
                    SET_CONTROL_PROPERTY,
                    SET_CONTROL_PROPERTY,
                    SET_CONTROL_PROPERTY
                ]);
                expect(actions.map(({ control }) => control)).toEqual([
                    'drawer',
                    'metadataexplorer',
                    'print',
                    'queryPanel'
                ]);
            } catch (e) {
                done(e);
            }
        }, {
            controls: {
                drawer: {
                    enabled: true
                }
            }
        }, done);
    });

});

