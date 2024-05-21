/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import arcgis from '../arcgis';
import axios from '../../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

let mockAxios;

describe('mapinfo arcgis utils', () => {
    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('should create a request with empty features', () => {
        const layer = {
            title: "Title",
            type: 'arcgis',
            url: "https://test.url",
            visibility: true,
            name: 0
        };
        const map = {
            "projection": "EPSG:900913",
            "zoom": 6,
            "resolution": 2445.98490512564
        };
        const point = {
            "latlng": {
                "lat": 34.81411782090338,
                "lng": -76.51422049947232
            },
            "intersectedFeatures": []
        };
        const request = arcgis.buildRequest(layer, { point, map, currentLocale: 'en-US' });
        expect(request).toEqual({
            request: {
                outputFormat: 'application/json',
                bounds: [
                    -76.69000174947232,
                    34.669673599384076,
                    -76.33843924947232,
                    34.95830926327919
                ]
            },
            metadata: {
                title: 'Title'
            },
            url: 'https://test.url'
        });
    });
    it('should return the response object from getIdentifyFlow', (done) => {
        const layer = {
            title: "Title",
            type: 'arcgis',
            url: "https://test.url",
            visibility: true,
            name: 0
        };
        const bounds = [
            -76.69000174947232,
            34.669673599384076,
            -76.33843924947232,
            34.95830926327919
        ];
        mockAxios.onGet().reply((req) => {
            try {
                const parts = req.url.split('?url=');
                expect(decodeURIComponent(parts[parts.length - 1]))
                    .toBe('https://test.url/0/query?f=json&geometry=-76.69000174947232%2C34.669673599384076%2C-76.33843924947232%2C34.95830926327919&inSR=4326&outSR=4326&outFields=*');
            } catch (e) {
                done(e);
            }
            return [200, { features: [{ attributes: { name: 'Feature01' }, geometry: { x: 0, y: 0 } }] }];
        });
        arcgis.getIdentifyFlow(layer, 'https://test.url', { bounds })
            .toPromise()
            .then((response) => {
                expect(response).toEqual({
                    data: {
                        crs: 'EPSG:4326',
                        features: [{
                            type: 'Feature',
                            properties: { name: 'Feature01' },
                            geometry: {
                                type: 'Point',
                                coordinates: [0, 0, 0]
                            }
                        }]
                    }
                });
                done();
            }).catch(done);
    });
    it('should return the response object from getIdentifyFlow with layer group', (done) => {
        const layer = {
            title: "Title",
            type: 'arcgis',
            url: "https://test.url",
            visibility: true,
            options: {
                layers: [
                    { id: 0 },
                    { id: 1 }
                ]
            }
        };
        const bounds = [
            -76.69000174947232,
            34.669673599384076,
            -76.33843924947232,
            34.95830926327919
        ];
        let count = 0;
        mockAxios.onGet().reply(() => {
            count++;
            return [200, { features: [{ attributes: { name: `Feature0${count}` }, geometry: { x: count, y: 0 } }] }];
        });
        arcgis.getIdentifyFlow(layer, 'https://test.url', { bounds })
            .toPromise()
            .then((response) => {
                expect(response).toEqual({
                    data: {
                        crs: 'EPSG:4326',
                        features: [{
                            type: 'Feature',
                            properties: { name: 'Feature01' },
                            geometry: {
                                type: 'Point',
                                coordinates: [1, 0, 0]
                            }
                        }, {
                            type: 'Feature',
                            properties: { name: 'Feature02' },
                            geometry: {
                                type: 'Point',
                                coordinates: [2, 0, 0]
                            }
                        }]
                    }
                });
                done();
            }).catch(done);
    });
});
