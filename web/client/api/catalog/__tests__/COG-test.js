/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getLayerFromRecord, getCatalogRecords, validate, COG_LAYER_TYPE, getProjectionFromGeoKeys} from '../COG';
import expect from 'expect';


const record = {sources: [{url: "some.tif"}], title: "some", options: []};
describe('COG (Abstraction) API', () => {
    beforeEach(done => {
        setTimeout(done);
    });

    afterEach(done => {
        setTimeout(done);
    });
    it('test getLayerFromRecord', () => {
        const layer = getLayerFromRecord(record, null);
        expect(layer.title).toBe(record.title);
        expect(layer.visibility).toBeTruthy();
        expect(layer.type).toBe(COG_LAYER_TYPE);
        expect(layer.sources).toEqual(record.sources);
        expect(layer.name).toBe(record.title);
    });
    it('test getLayerFromRecord as promise', () => {
        getLayerFromRecord(record, null, true).then((layer) => {
            expect(layer.title).toBe(record.title);
            expect(layer.visibility).toBeTruthy();
            expect(layer.type).toBe(COG_LAYER_TYPE);
            expect(layer.sources).toEqual(record.sources);
            expect(layer.name).toBe(record.title);
        });
    });
    it('test getCatalogRecords - empty records', () => {
        const catalogRecords = getCatalogRecords();
        expect(catalogRecords).toBeFalsy();
    });
    it('test getCatalogRecords', () => {
        const records = getCatalogRecords({records: [record]});
        const [{serviceType, isValid, title, sources, options }] = records;
        expect(serviceType).toBe(COG_LAYER_TYPE);
        expect(isValid).toBeFalsy();
        expect(title).toBe(record.title);
        expect(sources).toEqual(record.sources);
        expect(options).toEqual(record.options);
    });
    it('test validate with invalid url', () => {
        const service = {title: "some", url: "some.tif"};
        const error = new Error("catalog.config.notValidURLTemplate");
        try {
            validate(service);
        } catch (e) {
            expect(e).toEqual(error);
        }
    });
    it('test validate with valid url', () => {
        const service = {title: "some", records: [{url: "https://some.tif"}]};
        expect(validate(service)).toBeTruthy();
    });
    it('test getProjectionFromGeoKeys', () => {
        expect(getProjectionFromGeoKeys({geoKeys: {ProjectedCSTypeGeoKey: 4326}})).toBe('EPSG:4326');
        expect(getProjectionFromGeoKeys({geoKeys: {GeographicTypeGeoKey: 3857}})).toBe('EPSG:3857');
        expect(getProjectionFromGeoKeys({geoKeys: null})).toBe(null);
        expect(getProjectionFromGeoKeys({geoKeys: {ProjectedCSTypeGeoKey: 32767}})).toBe(null);
    });
});
