/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCatalogRecords, getLayerFromRecord } from '../ArcGIS';
import expect from 'expect';

describe('Test ArcGIS Catalog API', () => {
    it('should get catalog records', (done) => {
        const testRecord = {
            id: 1,
            name: "Outreach",
            type: "Feature Layer",
            description: 'description',
            url: "base/web/client/test-resources/arcgis/arcgis-test-data.json"
        };
        try {
            const records = getCatalogRecords({ records: [ testRecord ] });
            const { serviceType, description, title, identifier, url, name } = records[0];

            expect(serviceType).toBeTruthy();
            expect(serviceType).toBe('arcgis');

            expect(description).toBeTruthy();
            expect(description).toBe(testRecord.description);

            expect(title).toBeTruthy();
            expect(title).toBe(testRecord.name);

            expect(url).toBeTruthy();
            expect(url).toBe(testRecord.url);

            expect(identifier).toBeTruthy();
            expect(identifier).toBe(`Layer:${testRecord.id}:${testRecord.name}`);

            expect(name).toBeTruthy();
            expect(name).toBe(testRecord.id);
        } catch (e) {
            done(e);
        }
        done();
    });
    it('should get layer from record', (done) => {
        const testRecord = {
            name: 1,
            title: "Outreach",
            url: "base/web/client/test-resources/arcgis/arcgis-test-data.json"
        };
        try {
            const layer = getLayerFromRecord( testRecord, { layerBaseConfig: { group: undefined } } );
            const { type, url, name, title, visibility, group } = layer;

            expect(type).toBeTruthy();
            expect(type).toBe('arcgis');

            expect(url).toBeTruthy();
            expect(url).toBe(testRecord.url);

            expect(name).toBeTruthy();
            expect(name).toBe(`${testRecord.name}`);

            expect(title).toBeTruthy();
            expect(title).toBe(testRecord.title);

            expect(visibility).toBeTruthy();

            expect(group).toBe(undefined);
        } catch (e) {
            done(e);
        }
        done();
    });
    it('should get layer from record while a group is selected', (done) => {
        const testRecord = {
            name: 1,
            title: "Outreach",
            url: "base/web/client/test-resources/arcgis/arcgis-test-data.json"
        };
        const _selectedGroup = 'test_group';
        try {
            const layer = getLayerFromRecord( testRecord, { layerBaseConfig: { group: _selectedGroup } } );
            const { type, url, name, title, visibility, group } = layer;

            expect(type).toBeTruthy();
            expect(type).toBe('arcgis');

            expect(url).toBeTruthy();
            expect(url).toBe(testRecord.url);

            expect(name).toBeTruthy();
            expect(name).toBe(`${testRecord.name}`);

            expect(title).toBeTruthy();
            expect(title).toBe(testRecord.title);

            expect(visibility).toBeTruthy();

            expect(group).toBe(_selectedGroup);
        } catch (e) {
            done(e);
        }
        done();
    });
    it('should get layer from FeatureServer record with arcgis-feature type', (done) => {
        const testRecord = {
            name: 0,
            title: 'Test FeatureServer Layer',
            url: 'https://test.arcgis.com/rest/services/Test/FeatureServer',
            geometryType: 'MultiPolygon',
            maxRecordCount: 2000
        };
        try {
            const layer = getLayerFromRecord(testRecord, { layerBaseConfig: {} });
            expect(layer.type).toBe('arcgis-feature');
            expect(layer.strategy).toBe('tile');
            expect(layer.geometryType).toBe('MultiPolygon');
            expect(layer.maxRecordCount).toBe(2000);
            expect(layer.name).toBe('0');
            expect(layer.visibility).toBe(true);
            expect(layer.options).toBeFalsy();
        } catch (e) {
            done(e);
        }
        done();
    });
    it('should get catalog records with FeatureServer fields', (done) => {
        const testRecord = {
            id: 0,
            name: 'PolygonLayer',
            url: 'https://test.arcgis.com/rest/services/Test/FeatureServer',
            geometryType: 'MultiPolygon',
            maxRecordCount: 1000
        };
        try {
            const records = getCatalogRecords({ records: [testRecord] });
            expect(records[0].geometryType).toBe('MultiPolygon');
            expect(records[0].maxRecordCount).toBe(1000);
        } catch (e) {
            done(e);
        }
        done();
    });
});
