/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCapabilities, getLayerMetadata } from '../ArcGIS';
import expect from 'expect';

describe('Test ArcGIS API', () => {
    const _url = 'base/web/client/test-resources/arcgis/arcgis-test-data.json';

    it('should extract capabilities from arcgis service data', (done) => {
        getCapabilities(_url, 1, 30, '').then((data) => {
            const { numberOfRecordsMatched, numberOfRecordsReturned, records } = data;
            const { type, url, name, version, defaultVisibility } = records[0];
            try {
                expect(numberOfRecordsMatched).toBeTruthy();
                expect(numberOfRecordsMatched).toBe(24);

                expect(numberOfRecordsReturned).toBeTruthy();
                expect(numberOfRecordsReturned).toBe(24);

                expect(type).toBeTruthy();
                expect(type).toBe('Group Layer');

                expect(url).toBeTruthy();
                expect(url).toBe(_url);

                expect(name).toBeTruthy();
                expect(name).toBe('Active Projects');

                expect(version).toBeTruthy();
                expect(version).toBe(10.81);

                expect(defaultVisibility).toEqual(true);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should search and paginate arcgis service data', (done) => {
        const startPosition = 1;
        const maxRecords = 4;
        const text = 'Outreach';
        getCapabilities(_url, startPosition, maxRecords, text).then((data) => {
            const { numberOfRecordsMatched, numberOfRecordsReturned, records } = data;
            try {
                expect(numberOfRecordsMatched).toBeTruthy();
                expect(numberOfRecordsMatched).toBe(4);

                expect(numberOfRecordsReturned).toBeTruthy();
                expect(numberOfRecordsReturned).toBe(4);

                records?.forEach(element => {
                    const { type, url, name, version, defaultVisibility } = element;

                    expect(type).toBeTruthy();
                    expect(type).toBe('Feature Layer');

                    expect(url).toBeTruthy();
                    expect(url).toBe(_url);

                    expect(name).toBeTruthy();
                    expect(String(name).includes(text)).toBeTruthy();

                    expect(version).toBeTruthy();
                    expect(version).toBe(10.81);

                    expect(defaultVisibility).toEqual(true);
                });
            } catch (e) {
                done(e);
            }
            done();
        });
    });
    it('should retrieve arcgis layer metadata', (done) => {
        const layerPath = 'base/web/client/test-resources/arcgis';
        const layerName = 'arcgis-layer-test-data.json';
        getLayerMetadata(layerPath, layerName).then((data) => {
            const { advancedQueryCapabilities, supportedQueryFormats, capabilities, extent, name, type } = data;
            try {
                expect(advancedQueryCapabilities).toBeTruthy();

                expect(supportedQueryFormats).toBeTruthy();
                expect(supportedQueryFormats).toBe('JSON, geoJSON, PBF');

                expect(capabilities).toBeTruthy();
                expect(capabilities).toBe('Map,Query');

                expect(extent).toBeTruthy();
                expect(extent.spatialReference).toBeTruthy();
                expect(extent.xmax).toBeTruthy();
                expect(extent.xmin).toBeTruthy();
                expect(extent.ymax).toBeTruthy();
                expect(extent.ymin).toBeTruthy();

                expect(name).toBeTruthy();
                expect(name).toBe('Active Projects');

                expect(type).toBeTruthy();
                expect(type).toBe('Group Layer');
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});
