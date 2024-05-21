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
            const layer = getLayerFromRecord( testRecord );
            const { type, url, name, title, visibility } = layer;

            expect(type).toBeTruthy();
            expect(type).toBe('arcgis');

            expect(url).toBeTruthy();
            expect(url).toBe(testRecord.url);

            expect(name).toBeTruthy();
            expect(name).toBe(`${testRecord.name}`);

            expect(title).toBeTruthy();
            expect(title).toBe(testRecord.title);

            expect(visibility).toBeTruthy();
        } catch (e) {
            done(e);
        }
        done();
    });
});
