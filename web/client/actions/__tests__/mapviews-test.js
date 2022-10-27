/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    SETUP_VIEWS,
    setupViews,
    ACTIVATE_VIEWS,
    activateViews,
    HIDE_VIEWS,
    hideViews,
    SELECT_VIEW,
    selectView,
    UPDATE_VIEWS,
    updateViews,
    UPDATE_RESOURCES,
    updateResources,
    SET_PREVIOUS_VIEW,
    setPreviousView
} from '../mapviews';

describe('mapviews actions', () => {
    it('setupViews', () => {
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
            resources: []
        };
        const retVal = setupViews(config);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(SETUP_VIEWS);
        expect(retVal.config).toBe(config);
    });
    it('activateViews', () => {
        const retVal = activateViews(true);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(ACTIVATE_VIEWS);
        expect(retVal.active).toBe(true);
    });
    it('hideViews', () => {
        const retVal = hideViews(true);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(HIDE_VIEWS);
        expect(retVal.hide).toBe(true);
    });
    it('selectView', () => {
        const retVal = selectView('view.1');
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(SELECT_VIEW);
        expect(retVal.id).toBe('view.1');
    });
    it('updateViews', () => {
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
        const retVal = updateViews(views);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(UPDATE_VIEWS);
        expect(retVal.views).toBe(views);
    });
    it('updateResources', () => {
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
        const retVal = updateResources(resources);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(UPDATE_RESOURCES);
        expect(retVal.resources).toBe(resources);
    });
    it('setPreviousView', () => {
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
        const retVal = setPreviousView(view);
        expect(retVal).toBeTruthy();
        expect(retVal.type).toBe(SET_PREVIOUS_VIEW);
        expect(retVal.view).toBe(view);
    });
});
