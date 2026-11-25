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
import { getCatalogRecords, getLayerFromRecord, textSearch, validate } from '../GeoJSON';
import { ServiceValidationError } from '../common';

const URL = 'https://example.com/data?format=json';
const FEATURE = {
    type: 'Feature',
    properties: { name: 'Test point' },
    geometry: { type: 'Point', coordinates: [12.123456789, 43] }
};
const GEOJSON = { type: 'FeatureCollection', features: [FEATURE] };

describe('GeoJSON catalog API', () => {
    let mock;
    beforeEach(() => {
        mock = new MockAdapter(axios);
    });
    afterEach(() => {
        mock.restore();
    });

    it('requires a title and a valid URL without restricting the file extension', () => {
        const service = { title: 'Points', url: URL };
        return validate(service).toPromise().then(result => expect(result).toBe(service));
    });

    [
        { url: URL },
        { title: '', url: URL },
        { title: '  ', url: URL },
        { title: 'Points' },
        { title: 'Points', url: '' },
        { title: 'Points', url: '  ' },
        { title: 'Points', url: 'not a URL' }
    ].forEach(service => {
        it(`rejects incomplete service ${JSON.stringify(service)}`, () => {
            return validate(service).toPromise().then(() => {
                throw new Error('Expected validation to fail');
            }, error => {
                expect(error instanceof ServiceValidationError).toBe(true);
                expect(error.notification).toBe('catalog.notification.warningAddCatalogService');
            });
        });
    });

    it('uses the configured title even when searching or data contains a different title', () => {
        mock.onGet(URL).reply(200, { ...GEOJSON, title: 'Data title', name: 'Data name', url: 'other URL' });
        return textSearch(URL, 1, 12, 'search', { options: { service: { title: 'Points' } } })
            .then(result => {
                expect(result.numberOfRecordsMatched).toBe(1);
                expect(result.numberOfRecordsReturned).toBe(1);
                expect(result.records[0].title).toBe('Points');
                expect(result.records[0].name).toBe('Points');
                expect(result.records[0].url).toBe(URL);
                expect(result.records[0].type).toBe('FeatureCollection');
                expect(result.records[0].features).toEqual(GEOJSON.features);
            });
    });

    it('preserves the title supplied by query parameters without a configured source title', () => {
        mock.onGet(URL).reply(200, GEOJSON);
        return textSearch(URL, 1, 4, 'Query title').then(result => {
            expect(getLayerFromRecord(getCatalogRecords(result)[0]).title).toBe('Query title');
        });
    });

    it('falls back to the URL when no title is provided', () => {
        mock.onGet(URL).reply(200, GEOJSON);
        return textSearch(URL).then(result => expect(result.records[0].title).toBe(URL));
    });

    [null, '<html>Not GeoJSON</html>', {}, { type: 'FeatureCollection' },
        { type: 'FeatureCollection', features: [null] },
        { type: 'Point', coordinates: ['invalid', 1] },
        { type: 'Feature', properties: {}, geometry: { type: 42 } }
    ].forEach(data => {
        it(`rejects invalid downloaded GeoJSON ${JSON.stringify(data)}`, () => {
            mock.onGet(URL).reply(200, data);
            return textSearch(URL).then(() => {
                throw new Error('Expected invalid GeoJSON to fail');
            }, error => expect(error.error).toBe('catalog.notification.invalidGeoJSON'));
        });
    });

    it('propagates request errors', () => {
        mock.onGet(URL).reply(404);
        return textSearch(URL).then(() => {
            throw new Error('Expected request to fail');
        }, error => expect(error.status).toBe(404));
    });

    it('uses the source URL without query parameters as a stable identifier, like FlatGeobuf', () => {
        const record = { ...GEOJSON, url: URL, title: 'Points', name: 'Points' };
        const [first] = getCatalogRecords({ records: [record] });
        const [renamed] = getCatalogRecords({ records: [{ ...record, title: 'Renamed', name: 'Renamed' }] });
        const [otherQuery] = getCatalogRecords({ records: [{ ...record, url: URL + '&other=1' }] });
        const [other] = getCatalogRecords({ records: [{ ...record, url: 'https://example.com/other-data' }] });
        expect(first.serviceType).toBe('geojson');
        expect(first.isValid).toBe(true);
        expect(first.identifier).toBe('https://example.com/data');
        expect(first.url).toBe(URL);
        expect(first.identifier).toBe(renamed.identifier);
        expect(first.identifier).toBe(otherQuery.identifier);
        expect(first.identifier).toNotBe(other.identifier);
        expect(getCatalogRecords()).toBe(null);
    });

    it('imports features, title, selected group and configured layer options without changing the record', () => {
        const [record] = getCatalogRecords({ records: [{ ...GEOJSON, url: URL, title: 'Points' }] }, {
            layerOptions: { opacity: 0.6 }
        });
        const original = JSON.stringify(record);
        const layer = getLayerFromRecord(record, {
            layerBaseConfig: { group: 'selected-group' },
            service: { layerOptions: { opacity: 0.5, visibility: false } }
        });
        expect(layer.type).toBe('vector');
        expect(layer.title).toBe('Points');
        expect(layer.name).toBe('Points');
        expect(layer.group).toBe('selected-group');
        expect(layer.opacity).toBe(0.6);
        expect(layer.visibility).toBe(false);
        expect(layer.features[0].properties).toEqual(FEATURE.properties);
        expect(layer.bbox.crs).toBe('EPSG:4326');
        expect(layer.bbox.bounds.minx).toBe(FEATURE.geometry.coordinates[0]);
        expect(JSON.stringify(record)).toBe(original);
    });

    [FEATURE, FEATURE.geometry, { type: 'GeometryCollection', geometries: [FEATURE.geometry] }, {
        type: 'GeometryCollection',
        geometries: [{ type: 'GeometryCollection', geometries: [FEATURE.geometry] }]
    }].forEach(data => {
        it(`imports a single ${data.type} as a vector feature`, () => {
            mock.onGet(URL).reply(200, data);
            return textSearch(URL, 1, 12, 'Single').then(result => {
                return getLayerFromRecord(getCatalogRecords(result)[0], {}, true);
            }).then(layer => {
                expect(layer.type).toBe('vector');
                expect(layer.features.length).toBe(1);
                expect(layer.features[0].type).toBe('Feature');
                expect(layer.features[0].geometry).toEqual(data.geometry || data);
                expect(layer.features[0].properties).toEqual(data.properties || {});
            });
        });
    });

    [
        { type: 'FeatureCollection', features: [] },
        { type: 'Feature', geometry: null, properties: { name: 'No location' } }
    ].forEach(data => {
        it(`imports ${data.type} without coordinates and omits the layer extent`, () => {
            mock.onGet(URL).reply(200, data);
            return textSearch(URL).then(result => {
                const layer = getLayerFromRecord(getCatalogRecords(result)[0]);
                expect(layer.bbox).toBe(undefined);
                expect(layer.features.length).toBe(data.features ? 0 : 1);
            });
        });
    });
});
