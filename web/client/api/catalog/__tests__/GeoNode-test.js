/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    getCatalogRecords,
    getLayerFromRecord
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
