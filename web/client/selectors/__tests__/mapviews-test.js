/*
* Copyright 2022, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {
    isMapViewsActive,
    isMapViewsHidden,
    getSelectedMapViewId,
    getMapViews,
    getMapViewsResources,
    getResourceById,
    getPreviousView,
    getSelectedMapView,
    isMapViewsInitialized
} from '../mapviews';

describe('mapviews selectors', () => {
    it('isMapViewsActive', () => {
        const state = {
            mapviews: {
                active: true
            }
        };
        expect(isMapViewsActive(state)).toBe(true);
    });
    it('isMapViewsHidden', () => {
        const state = {
            mapviews: {
                hide: true
            }
        };
        expect(isMapViewsHidden(state)).toBe(true);
    });
    it('isMapViewsHidden', () => {
        let state = {
            mapviews: {
                selectedId: 'view.01',
                active: true
            }
        };
        expect(getSelectedMapViewId(state)).toBe('view.01');
        state = {
            mapviews: {
                ...state.mapviews,
                active: false
            }
        };
        expect(getSelectedMapViewId(state)).toBe(false);
        state = {
            mapviews: {
                ...state.mapviews,
                active: true,
                hide: true
            }
        };
        expect(getSelectedMapViewId(state)).toBe(false);
    });
    it('isMapViewsInitialized', () => {
        const state = {
            mapviews: {
                initialized: true
            }
        };
        expect(isMapViewsInitialized(state)).toBe(state.mapviews.initialized);
    });
    it('getMapViews', () => {
        const state = {
            mapviews: {
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
                        id: 'view.1',
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
                        ]
                    }
                ]
            }
        };
        expect(getMapViews(state)).toEqual(state.mapviews.views);
    });
    it('getMapViews remove missing layers and groups', () => {
        const state = {
            layers: {
                flat: [{ id: 'layer.01', group: 'group_01' }],
                groups: [{ id: 'group_01' }]
            },
            mapviews: {
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
                        id: 'view.1',
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
                        layers: [{ id: 'layer.01' }, { id: 'layer.02' }],
                        groups: [{ id: 'group_01' }, { id: 'group_02' }]
                    }
                ]
            }
        };
        const newMapViews = getMapViews(state);
        expect(newMapViews[0].layers).toEqual([{ id: 'layer.01' }]);
        expect(newMapViews[0].groups).toEqual([{ id: 'group_01' }]);
    });
    it('getMapViewsResources', () => {
        const state = {
            mapviews: {
                resources: [
                    {
                        id: 'resource.01',
                        data: {
                            type: 'vector',
                            name: 'mask.json',
                            title: {
                                'default': 'Mask'
                            },
                            id: 'layer.01'
                        }
                    }
                ]
            }
        };
        expect(getMapViewsResources(state)).toBe(state.mapviews.resources);
    });
    it('getResourceById', () => {
        const state = {
            mapviews: {
                resources: [
                    {
                        id: 'resource.01',
                        data: {
                            type: 'vector',
                            name: 'mask.json',
                            title: {
                                'default': 'Mask'
                            },
                            id: 'layer.01'
                        }
                    }
                ]
            }
        };
        expect(getResourceById(state, 'resource.01')).toBe(state.mapviews.resources[0]);
    });
    it('getPreviousView', () => {
        const state = {
            mapviews: {
                previousView: {
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
                    id: 'view.1',
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
                    ]
                }
            }
        };
        expect(getPreviousView(state)).toBe(state.mapviews.previousView);
    });
    it('getSelectedMapView', () => {
        let state = {
            mapviews: {
                selectedId: 'view.1',
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
                        id: 'view.1',
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
                        ]
                    }
                ],
                active: true
            }
        };
        expect(getSelectedMapView(state)).toEqual(state.mapviews.views[0]);
        state = {
            mapviews: {
                ...state.mapviews,
                active: false
            }
        };
        expect(getSelectedMapView(state)).toBe(undefined);
        state = {
            mapviews: {
                ...state.mapviews,
                hide: true
            }
        };
        expect(getSelectedMapView(state)).toBe(undefined);
    });
});
