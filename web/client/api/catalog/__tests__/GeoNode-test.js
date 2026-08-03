/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';
import {
    getCatalogRecords,
    getLayerFromRecord,
    processRecords
} from '../GeoNode';

describe('Test correctness of the GeoNode catalog APIs', () => {
    it('geonode catalog records mapping', () => {
        const records = getCatalogRecords({
            records: [{
                title: 'Title',
                description: 'Record description',
                alternate: 'geonode:layer',
                thumbnail_url: 'http://example.com/thumb.png',
                keywords: [],
                owner: { username: 'alice' },
                extra: 'keep-me',
                pk: 123
            }]
        });
        expect(records.length).toBe(1);
        expect(records[0].serviceType).toBe('geonode');
        expect(records[0].title).toBe('Title');
        expect(records[0].description).toBe('Record description');
        expect(records[0].thumbnail_url).toBe('http://example.com/thumb.png');
        expect(records[0].tags).toEqual([]);
        expect(records[0].creator).toBe('alice');
        expect(records[0].extra).toBe('keep-me');
        expect(records[0].pk).toBe(123);
    });

    it('geonode catalog records mapping uses category label for tags', () => {
        const records = getCatalogRecords({
            records: [{
                title: 'Title',
                category: {
                    identifier: 'boundaries',
                    gn_description: 'Boundaries'
                },
                pk: 123
            }]
        });
        expect(records[0].tags).toEqual([{
            identifier: 'boundaries',
            gn_description: 'Boundaries',
            label: 'Boundaries'
        }]);
    });

    it('geonode catalog records mapping falls back to category identifier for tag label', () => {
        const records = getCatalogRecords({
            records: [{
                title: 'Title',
                category: {
                    identifier: 'boundaries'
                },
                pk: 123
            }]
        });
        expect(records[0].tags).toEqual([{
            identifier: 'boundaries',
            label: 'boundaries'
        }]);
    });

    it('geonode catalog records returns null with no records', () => {
        expect(getCatalogRecords()).toBe(null);
        expect(getCatalogRecords({})).toBe(null);
    });

    it('geonode getLayerFromRecord to WMS', () => {
        const record = {
            title: 'Layer Title',
            alternate: 'layer1',
            links: [{
                link_type: 'OGC:WMS',
                url: 'http://sample?name=layer1'
            }],
            boundingBox: {
                crs: 'EPSG:4326',
                extent: [0, 0, 1, 1]
            }
        };
        const layer = getLayerFromRecord(record);
        expect(layer.type).toBe('wms');
        expect(layer.name).toBe('layer1');
        expect(layer.url).toBe('http://sample?name=layer1');
        expect(layer.format).toBe('image/png');
        expect(layer.params).toEqual({ name: 'layer1' });
    });

    it('geonode getLayerFromRecord supports promise mode', (done) => {
        const record = {
            title: 'Layer Title',
            alternate: 'layer1',
            links: [{
                link_type: 'OGC:WMS',
                url: 'http://sample?name=layer1'
            }],
            boundingBox: {
                crs: 'EPSG:4326',
                extent: [0, 0, 1, 1]
            }
        };
        getLayerFromRecord(record, {}, true).then((layer) => {
            try {
                expect(layer.type).toBe('wms');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});

describe('GeoNode catalog processRecords / documents', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });

    const mockDocuments = () => {
        mockAxios.onGet().reply((config) => {
            if (config.url.indexOf('/documents/10') !== -1) {
                return [200, { document: { pk: 10, title: 'Doc 10', subtype: 'image', detail_url: '/documents/10', extent: { coords: [0, 0, 10, 10] } } }];
            }
            if (config.url.indexOf('/documents/11') !== -1) {
                return [200, { document: { pk: 11, title: 'Doc 11', subtype: 'document', detail_url: '/documents/11' } }];
            }
            return [404];
        });
    };

    const datasetRecord = {
        resource_type: 'dataset',
        alternate: 'geonode:layer',
        links: [{ link_type: 'OGC:WMS', url: 'http://sample?name=layer1' }]
    };

    it('processRecords collapses documents and converts other records to layers', (done) => {
        mockDocuments();
        const records = [datasetRecord, { resource_type: 'document', pk: 10 }];
        processRecords(records, { service: { url: 'http://gn' } })
            .then(({ layers, groups }) => {
                try {
                    expect(groups).toEqual([]);
                    expect(layers.length).toBe(2);
                    const vector = layers.find(layer => layer.type === 'vector');
                    const wms = layers.find(layer => layer.type === 'wms');
                    expect(vector).toExist();
                    expect(wms).toExist();
                    expect(vector.features.length).toBe(1);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('processRecords applies protectedId security to dataset layers but not documents', (done) => {
        mockDocuments();
        const records = [datasetRecord, { resource_type: 'document', pk: 10 }];
        processRecords(records, { service: { url: 'http://gn', protectedId: 'svc-1' } })
            .then(({ layers }) => {
                try {
                    const vector = layers.find(layer => layer.type === 'vector');
                    const wms = layers.find(layer => layer.type === 'wms');
                    expect(wms.security).toEqual({ type: 'basic', sourceId: 'svc-1' });
                    expect(vector.security).toBe(undefined);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('processRecords returns empty layers for an empty selection', (done) => {
        processRecords([], { service: { url: 'http://gn' } })
            .then(({ layers, groups }) => {
                try {
                    expect(layers).toEqual([]);
                    expect(groups).toEqual([]);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('processRecords skips records that fail and keeps the rest', (done) => {
        mockAxios.onGet().reply((config) => {
            if (config.url.indexOf('/documents/10') !== -1) {
                return [200, { document: { pk: 10, subtype: 'image', extent: { coords: [0, 0, 10, 10] } } }];
            }
            return [500];
        });
        const records = [
            { resource_type: 'dataset', pk: 99, subtype: 'vector', alternate: 'geonode:layer', links: [{ link_type: 'OGC:WMS', url: 'http://sample?name=layer1' }] },
            { resource_type: 'document', pk: 10 }
        ];
        processRecords(records, { service: { url: 'http://gn' } })
            .then(({ layers }) => {
                try {
                    // dataset fetch (datasets/99) fails -> skipped; documents layer survives
                    expect(layers.find(layer => layer.type === 'vector')).toExist();
                    expect(layers.find(layer => layer.type === 'wms')).toNotExist();
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});
