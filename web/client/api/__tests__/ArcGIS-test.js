/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { getCapabilities, getLayerMetadata } from '../ArcGIS';
import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

let mockAxios;

describe('Test ArcGIS API', () => {
    const _url = 'base/web/client/test-resources/arcgis/arcgis-test-data.json';
    it('should extract capabilities from arcgis service data', (done) => {
        getCapabilities(_url, 1, 30, '').then((data) => {
            const { numberOfRecordsMatched, numberOfRecordsReturned, records } = data;
            const { type, url, name, version, defaultVisibility } = records[1];
            try {
                expect(numberOfRecordsMatched).toBeTruthy();
                expect(numberOfRecordsMatched).toBe(25);

                expect(numberOfRecordsReturned).toBeTruthy();
                expect(numberOfRecordsReturned).toBe(25);

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
        getLayerMetadata(layerPath, layerName).then(({ data }) => {
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
    it('should retrieve arcgis layer metadata from root path', (done) => {
        getLayerMetadata(_url)
            .then(({ data, ...properties }) => {
                expect(properties.version).toBe(10.81);
                expect(properties.queryable).toBe(true);
                expect(properties.format).toBe('PNG32');
                expect(properties.bbox).toEqual({
                    bounds: {
                        minx: -19851965.9761,
                        miny: -1643352.0163999982,
                        maxx: 16269834.825400002,
                        maxy: 10537038.417599998
                    },
                    crs: 'EPSG:3857'
                });
                expect(properties.description).toBe('');
                expect(properties.options.layers).toBeTruthy();
                done();
            })
            .catch(done);
    });
    describe('getCapabilities', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });
        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should get capabilities from the arcgis/rest/services path', (done) => {
            mockAxios.onGet().reply(() => [200, {
                currentVersion: 10.91,
                folders: ['Folder'],
                services: [
                    {
                        name: 'Map',
                        type: 'MapServer'
                    },
                    {
                        name: 'GPS',
                        type: 'GPServer'
                    },
                    {
                        name: 'Image',
                        type: 'ImageServer'
                    }
                ]
            }]);
            getCapabilities('/arcgis/rest/services/', 1, 30, '')
                .then((data) => {
                    expect(data).toEqual({
                        numberOfRecordsMatched: 2,
                        numberOfRecordsReturned: 2,
                        records: [
                            {
                                url: '/arcgis/rest/services/Map/MapServer',
                                version: 10.91,
                                name: 'Map',
                                description: 'MapServer'
                            },
                            {
                                url: '/arcgis/rest/services/Image/ImageServer',
                                version: 10.91,
                                name: 'Image',
                                description: 'ImageServer'
                            }
                        ]
                    });
                    done();
                })
                .catch(done);
        });
    });
});
