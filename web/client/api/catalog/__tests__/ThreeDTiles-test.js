/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    textSearch,
    getLayerFromRecord,
    getCatalogRecords,
    validate
} from '../ThreeDTiles';

import axios from '../../../libs/ajax';
import MockAdapter from "axios-mock-adapter";
let mockAxios;

const TILSET_JSON = {
    "asset": {
        "version": "1.0"
    },
    "geometricError": 100,
    "root": {
        "boundingVolume": {
            "region": [
                -1.3197004795898053,
                0.6988582109,
                -1.3196595204101946,
                0.6988897891,
                0,
                20
            ]
        },
        "geometricError": 10,
        "refine": "REPLACE",
        "content": {
            "uri": "file.i3dm"
        },
        "children": [
            {
                "boundingVolume": {
                    "region": [
                        -1.3197004795898053,
                        0.6988582109,
                        -1.3196595204101946,
                        0.6988897891,
                        0,
                        20
                    ]
                },
                "geometricError": 0,
                "content": {
                    "uri": "tree.i3dm"
                }
            }
        ]
    },
    "properties": {
        "Height": {
            "minimum": 20,
            "maximum": 20
        }
    }
};

describe('Test 3D tiles catalog API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('should return a single record for tileset.json', (done) => {
        mockAxios.onGet().reply(200, TILSET_JSON);
        textSearch('http://service.org/tileset.json')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('service.org');
                done();
            });
    });
    it('should always return a single record even if  title not match the filter', (done) => {
        mockAxios.onGet().reply(200, TILSET_JSON);
        textSearch('http://service.org/tileset.json', undefined, undefined, 'filter')
            .then((response) => {
                expect(response.records.length).toBe(1);
                done();
            });
    });
    it('should return a single record if  title match the filter', (done) => {
        mockAxios.onGet().reply(200, TILSET_JSON);
        textSearch('http://service.org/tileset.json', undefined, undefined, 'service')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('service.org');
                done();
            });
    });
    it('should return a single record with title equal to the last path fragment', (done) => {
        mockAxios.onGet().reply(200, TILSET_JSON);
        textSearch('http://service.org/path/title/tileset.json')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('title');
                done();
            });
    });
    it('should return a single record with title from info service if available', (done) => {
        mockAxios.onGet().reply(200, TILSET_JSON);
        textSearch('http://service.org/path/title/tileset.json', undefined, undefined, '', { options: { service: { title: 'Tileset' } } })
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('Tileset');
                done();
            });
    });
    it('should map the tileset record to a catalog record', () => {
        const records = getCatalogRecords({ records: [{
            title: 'Title',
            url: 'http://service.org/tileset.json',
            type: '3dtiles',
            version: '1.0',
            tileset: TILSET_JSON,
            bbox: {
                bounds: { minx: -180, miny: -90, maxx: 180, maxy: 90 },
                crs: 'EPSG:4326'
            }
        }] });
        expect(records.length).toBe(1);
        const {
            serviceType,
            isValid,
            description,
            title,
            identifier,
            url,
            bbox
        } = records[0];

        expect(serviceType).toBe('3dtiles');
        expect(isValid).toBe(true);
        expect(description).toBe('v. 1.0');
        expect(title).toBe('Title');
        expect(identifier).toBe('http://service.org/tileset.json');
        expect(url).toBe('http://service.org/tileset.json');
        expect(bbox).toBeTruthy();
    });

    it('should extract the layer config from a catalog record', () => {
        const catalogRecord = {
            serviceType: '3dtiles',
            isValid: true,
            description: 'v. 1.0',
            title: 'Title',
            identifier: 'http://service.org/tileset.json',
            url: 'http://service.org/tileset.json',
            thumbnail: null,
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -180,
                    miny: -90,
                    maxx: 180,
                    maxy: 90
                }
            },
            references: []
        };
        const layer = getLayerFromRecord(catalogRecord);
        expect(layer).toEqual({
            type: '3dtiles',
            url: 'http://service.org/tileset.json',
            title: 'Title',
            visibility: true,
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: -180,
                    miny: -90,
                    maxx: 180,
                    maxy: 90
                }
            }
        });
    });
    it('should validate if the service url ends with .json', (done) => {
        const service = { title: '3D Tile Service', url: 'http://service.org/tileset.json' };
        validate(service)
            .toPromise()
            .then((response) => {
                expect(response).toBeTruthy(true);
                done();
            })
            .catch(e => {
                done(e);
            });
    });
    it('should throw an error on validation if service does not ends with .json', (done) => {
        const service = { title: '3D Tile Service', url: 'http://service.org/tileset' };
        try {
            validate(service);
        } catch (e) {
            expect(e.message).toBe('catalog.config.notValidURLTemplate');
            done();
        }
    });
});
