/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import axios from '../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { load, getData } from '../geostore';

describe('GeoStore media api', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('should load new resources', (done) => {
        const params = {
            page: 1,
            pageSize: 10
        };
        mockAxios.onGet().reply(() => [200, {
            success: true,
            totalCount: 1,
            results: [
                {
                    canDelete: true,
                    canEdit: true,
                    canCopy: true,
                    creation: '2020-08-12 12:37:30.072',
                    lastUpdate: '2020-08-12 12:46:58.105',
                    description: 'Description',
                    id: 1,
                    name: 'name',
                    details: 'rest/geostore/data/1/raw?decode=datauri',
                    thumbnail: 'rest/geostore/data/1/raw?decode=datauri',
                    owner: 'admin'
                }
            ]
        }]);
        load({ params })
            .subscribe(
                (response) => {
                    expect(response.totalCount).toBe(1);
                    expect(response.resources.length).toBe(1);
                    expect(response.resources[0].type).toBe('map');
                    expect(response.resources[0].data).toEqual({
                        canDelete: true,
                        canEdit: true,
                        canCopy: true,
                        creation: '2020-08-12 12:37:30.072',
                        lastUpdate: '2020-08-12 12:46:58.105',
                        description: 'Description',
                        id: 1,
                        name: 'name',
                        details: 'rest/geostore/data/1/raw?decode=datauri',
                        thumbnail: 'rest/geostore/data/1/raw?decode=datauri',
                        owner: 'admin'
                    });
                    done();
                },
                e => done(e)
            );
    });
    it('should get data of the selected map resource', (done) => {
        mockAxios.onGet(/extjs\/resource/).reply(() =>
            [ 200,
                {
                    ShortResource: {
                        canDelete: true,
                        canEdit: true,
                        creation: '2020-08-12 12:37:30.072',
                        description: 'Description',
                        id: 1,
                        name: 'Name'
                    }
                }
            ]);
        mockAxios.onGet(/geostore\/data/).reply(() =>
            [ 200, {
                version: 2,
                map: {
                    center: {
                        x: 0,
                        y: 0,
                        crs: 'EPSG:4326'
                    },
                    maxExtent: [
                        -20037508.34,
                        -20037508.34,
                        20037508.34,
                        20037508.34
                    ],
                    projection: 'EPSG:900913',
                    units: 'm',
                    zoom: 4,
                    mapOptions: {},
                    layers: [],
                    groups: []
                },
                catalogServices: {},
                widgetsConfig: {},
                mapInfoConfiguration: {}
            }]);
        mockAxios.onGet(/attributes/).reply(() =>
            [ 200, {
                AttributeList: {
                    Attribute: [
                        {
                            name: 'details',
                            type: 'STRING',
                            value: 'rest\/geostore\/data\/1\/raw?decode=datauri'
                        },
                        {
                            name: "thumbnail",
                            type: "STRING",
                            value: 'rest\/geostore\/data\/1\/raw?decode=datauri'
                        },
                        {
                            name: 'owner',
                            type: 'STRING',
                            value: 'admin'
                        }
                    ]
                }
            }]);
        const selectedItem = {
            id: '0a12d-7894',
            type: 'map',
            data: {
                canDelete: true,
                canEdit: true,
                canCopy: true,
                creation: '2020-08-12 12:37:30.072',
                lastUpdate: '2020-08-12 12:46:58.105',
                description: 'Description',
                id: 1,
                name: 'Name',
                details: 'rest/geostore/data/1/raw?decode=datauri',
                thumbnail: 'rest/geostore/data/1/raw?decode=datauri',
                owner: 'admin'
            }
        };
        getData({ selectedItem })
            .subscribe(
                (data) => {
                    expect(data).toEqual({
                        center: { x: 0, y: 0, crs: 'EPSG:4326' },
                        maxExtent: [ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ],
                        projection: 'EPSG:900913',
                        units: 'm',
                        zoom: 4,
                        mapOptions: {},
                        id: 1,
                        groups: [],
                        layers: [],
                        details: 'rest/geostore/data/1/raw?decode=datauri',
                        thumbnail: 'rest/geostore/data/1/raw?decode=datauri',
                        owner: 'admin',
                        creation: '2020-08-12 12:37:30.072',
                        canCopy: undefined,
                        canDelete: true,
                        canEdit: true,
                        name: 'Name',
                        description: 'Description',
                        type: 'map'
                    });
                    done();
                },
                e => done(e)
            );
    });
});
