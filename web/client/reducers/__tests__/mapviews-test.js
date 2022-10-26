/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import mapviews from '../mapviews';
import {
    setupViews,
    activateViews,
    hideViews,
    selectView,
    updateViews,
    updateResources,
    setPreviousView
} from '../../actions/mapviews';

describe('mapviews reducer', () => {
    it('setup views', () => {
        const config = {
            active: true,
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
            resources: [],
            mapId: 'map.01'
        };
        const state = mapviews(undefined, setupViews(config));
        expect(state.active).toBe(config.active);
        expect(state.selectedId).toBe(config.selectedId);
        expect(state.views).toBe(config.views);
        expect(state.mapId).toBe(config.mapId);
        expect(state.initialized).toBe(true);
        expect(state.updateUUID).toBeTruthy();
    });
    it('setup views with undefined config', () => {
        const state = mapviews(undefined, setupViews());
        expect(state.initialized).toBe(true);
        expect(state.updateUUID).toBeTruthy();
    });
    it('activate views', () => {
        const state = mapviews(undefined, activateViews(true));
        expect(state.active).toBe(true);
    });
    it('hide views', () => {
        const state = mapviews(undefined, hideViews(true));
        expect(state.hide).toBe(true);
    });
    it('select view', () => {
        const state = mapviews(undefined, selectView('view.01'));
        expect(state.selectedId).toBe('view.01');
    });
    it('update views', () => {
        const views = [
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
        ];
        const state = mapviews(undefined, updateViews(views));
        expect(state.views).toEqual(views);
    });
    it('update resources', () => {
        const resources = [
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
        ];
        const state = mapviews(undefined, updateResources(resources));
        expect(state.resources).toEqual(resources);
    });
    it('set previous view', () => {
        const view = {
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
        };
        const state = mapviews(undefined, setPreviousView(view));
        expect(state.previousView).toBe(view);
    });
});
