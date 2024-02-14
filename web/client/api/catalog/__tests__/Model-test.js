/**
 * Copyright 2024, GeoSolutions Sas.
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
} from '../Model';


describe('Test IFC Model catalog API', () => {
    it('should return a single record for ifcModel.ifc', (done) => {
        textSearch('base/web/client/test-resources/ifcModels/ifcModel.ifc')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('ifcModels');
                done();
            });
    });
    it('should always return a single record even if  title not match the filter', (done) => {
        textSearch('base/web/client/test-resources/ifcModels/ifcModel.ifc', undefined, undefined, 'filter')
            .then((response) => {
                expect(response.records.length).toBe(1);
                done();
            });
    });
    it('should return a single record if  title match the filter', (done) => {
        textSearch('base/web/client/test-resources/ifcModels/ifcModel.ifc', undefined, undefined, 'service')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('ifcModels');
                done();
            });
    });
    it('should return a single record with title equal to the last path fragment', (done) => {
        textSearch('base/web/client/test-resources/ifcModels/ifcModel.ifc')
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('ifcModels');
                done();
            });
    });
    it('should return a single record with title from info service if available', (done) => {
        textSearch('base/web/client/test-resources/ifcModels/ifcModel.ifc', undefined, undefined, '', { options: { service: { title: 'ifc model title' } } })
            .then((response) => {
                expect(response.records.length).toBe(1);
                expect(response.records[0].title).toBe('ifc model title');
                done();
            });
    });
    it('should map the tileset record to a catalog record', () => {
        const records = getCatalogRecords({ records: [{
            title: 'Title',
            url: 'base/web/client/test-resources/ifcModels/ifcModel.ifc',
            type: 'model',
            version: '1.0'
        }] });
        expect(records.length).toBe(1);
        const {
            serviceType,
            isValid,
            description,
            title,
            identifier,
            url
        } = records[0];

        expect(serviceType).toBe('model');
        expect(isValid).toBe(true);
        expect(description).toBe('v. 1.0');
        expect(title).toBe('Title');
        expect(identifier).toBe('base/web/client/test-resources/ifcModels/ifcModel.ifc');
        expect(url).toBe('base/web/client/test-resources/ifcModels/ifcModel.ifc');
    });

    it('should extract the layer config from a catalog record', () => {
        const catalogRecord = {
            serviceType: 'model',
            isValid: true,
            description: 'v. 1.0',
            title: 'Title',
            identifier: 'base/web/client/test-resources/ifcModels/ifcModel.ifc',
            url: 'base/web/client/test-resources/ifcModels/ifcModel.ifc',
            thumbnail: null,
            bbox: {
                crs: 'EPSG:4326',
                bounds: {
                    minx: 0,
                    miny: 0,
                    maxx: 0,
                    maxy: 0
                }
            },
            references: [],
            properties: {
                longitude: 0,
                latitude: 0,
                height: 0,
                scale: 1
            }
        };
        const layer = getLayerFromRecord(catalogRecord);
        expect(layer.type).toEqual("model");
        expect(layer.url).toEqual("base/web/client/test-resources/ifcModels/ifcModel.ifc");
        expect(layer.title).toEqual("Title");
        expect(layer.visibility).toEqual(true);
        expect(layer.bbox).toEqual({ crs: 'EPSG:4326', bounds: { minx: 0, miny: 0, maxx: 0, maxy: 0 } });
        expect(layer.features.length).toEqual(1);
        expect(layer.features[0]).toEqual({ type: 'Feature', id: 'model-origin', properties: { heading: 0, pitch: 0, roll: 0, scale: 1 }, geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } });
    });
    it('should validate if the service url ends with .ifc', (done) => {
        const service = { title: 'IFC Model', url: 'https://service.org/ifcModel.ifc' };
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
    it('should throw an error on validation if service does not ends with .ifc', (done) => {
        const service = { title: 'IFC Model', url: 'http://service.org/ifcmodel' };
        try {
            validate(service);
        } catch (e) {
            expect(e.message).toBe('catalog.config.notValidURLTemplate');
            done();
        }
    });
});
