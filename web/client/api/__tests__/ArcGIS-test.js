/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    getCapabilities,
    getLayerMetadata,
    getFeatureLayerSchema,
    fetchFeatureLayerCollection,
    queryFeatureLayerForClassification
} from '../ArcGIS';
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
        it('should include FeatureServer in services list', (done) => {
            mockAxios.onGet().reply(() => [200, {
                currentVersion: 10.91,
                services: [
                    { name: 'Features', type: 'FeatureServer' },
                    { name: 'Map', type: 'MapServer' }
                ]
            }]);
            getCapabilities('/arcgis/rest/services-fs/', 1, 30, '')
                .then((data) => {
                    expect(data.numberOfRecordsMatched).toBe(2);
                    expect(data.records.find(r => r.description === 'FeatureServer')).toBeTruthy();
                    expect(data.records.find(r => r.description === 'FeatureServer').url).toBe('/arcgis/rest/services-fs/Features/FeatureServer');
                    done();
                })
                .catch(done);
        });
        it('should parse FeatureServer sub-layers with geometry type and maxRecordCount', (done) => {
            mockAxios.onGet().reply(() => [200, {
                currentVersion: 10.91,
                capabilities: 'Query',
                maxRecordCount: 2000,
                layers: [
                    { id: 0, name: 'Points', geometryType: 'esriGeometryPoint' },
                    { id: 1, name: 'Polygons', geometryType: 'esriGeometryPolygon' }
                ],
                initialExtent: {
                    xmin: -10, ymin: -5, xmax: 10, ymax: 5,
                    spatialReference: { wkid: 4326 }
                }
            }]);
            getCapabilities('/arcgis/rest/services/Test/FeatureServer', 1, 30, '')
                .then((data) => {
                    expect(data.numberOfRecordsMatched).toBe(2);
                    const [pointLayer, polygonLayer] = data.records;
                    expect(pointLayer.geometryType).toBe('Point');
                    expect(pointLayer.queryable).toBe(true);
                    expect(pointLayer.maxRecordCount).toBe(2000);
                    expect(polygonLayer.geometryType).toBe('MultiPolygon');
                    expect(pointLayer.bbox).toBeTruthy();
                    expect(pointLayer.bbox.crs).toBe('EPSG:4326');
                    done();
                })
                .catch(done);
        });
        it('should prefer initialExtent over fullExtent for FeatureServer', (done) => {
            mockAxios.onGet().reply(() => [200, {
                capabilities: 'Query',
                layers: [{ id: 0, name: 'Layer0', geometryType: 'esriGeometryPoint' }],
                initialExtent: {
                    xmin: -10, ymin: -5, xmax: 10, ymax: 5,
                    spatialReference: { wkid: 4326 }
                },
                fullExtent: {
                    xmin: -180, ymin: -90, xmax: 180, ymax: 90,
                    spatialReference: { wkid: 4326 }
                }
            }]);
            getCapabilities('/arcgis/rest/services/ExtentPref/FeatureServer', 1, 30, '')
                .then((data) => {
                    expect(data.records[0].bbox.bounds.minx).toBe(-10);
                    expect(data.records[0].bbox.bounds.maxx).toBe(10);
                    done();
                })
                .catch(done);
        });
        it('should reproject non-4326 extent to EPSG:4326', (done) => {
            mockAxios.onGet().reply(() => [200, {
                capabilities: 'Query',
                layers: [{ id: 0, name: 'Layer0', geometryType: 'esriGeometryPoint' }],
                initialExtent: {
                    xmin: -8238310, ymin: 4969609, xmax: -8227517, ymax: 4981706,
                    spatialReference: { wkid: 3857 }
                }
            }]);
            getCapabilities('/arcgis/rest/services/Reprojected/FeatureServer', 1, 30, '')
                .then((data) => {
                    const { bounds, crs } = data.records[0].bbox;
                    expect(crs).toBe('EPSG:4326');
                    expect(bounds.minx).toBeLessThan(0);
                    expect(bounds.miny).toBeGreaterThan(0);
                    done();
                })
                .catch(done);
        });
    });
    describe('getFeatureLayerSchema', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });
        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should fetch schema and map ESRI field types to sample primitives', (done) => {
            mockAxios.onGet().reply(() => [200, {
                geometryType: 'esriGeometryPolygon',
                fields: [
                    { name: 'OBJECTID', alias: 'OID', type: 'esriFieldTypeOID' },
                    { name: 'pop', type: 'esriFieldTypeInteger' },
                    { name: 'name', type: 'esriFieldTypeString' },
                    { name: 'shape', type: 'esriFieldTypeGeometry' },
                    { name: 'updated', type: 'esriFieldTypeDate' }
                ]
            }]);
            getFeatureLayerSchema('/arcgis/rest/services/Schema1/FeatureServer', 0)
                .then((schema) => {
                    expect(schema.geometryType).toBe('MultiPolygon');
                    expect(schema.fields.length).toBe(5);
                    expect(schema.properties).toEqual({
                        OBJECTID: 0,
                        pop: 0,
                        name: ''
                    });
                    done();
                })
                .catch(done);
        });
        it('should cache schema and dedupe concurrent in-flight requests', (done) => {
            let callCount = 0;
            mockAxios.onGet().reply(() => {
                callCount++;
                return [200, { fields: [{ name: 'a', type: 'esriFieldTypeInteger' }] }];
            });
            const url = '/arcgis/rest/services/Schema2/FeatureServer';
            const p1 = getFeatureLayerSchema(url, 0);
            const p2 = getFeatureLayerSchema(url, 0);
            Promise.all([p1, p2])
                .then(([s1, s2]) => {
                    expect(callCount).toBe(1);
                    expect(s1).toBe(s2);
                    return getFeatureLayerSchema(url, 0);
                })
                .then(() => {
                    expect(callCount).toBe(1);
                    done();
                })
                .catch(done);
        });
        it('should reject and not cache on transport error', (done) => {
            // First attempt fails -> rejection should propagate AND cache must stay empty
            // so the second attempt re-issues the request
            mockAxios.onGet().replyOnce(() => [500, {}]);
            mockAxios.onGet().replyOnce(() => [200, { fields: [{ name: 'ok', type: 'esriFieldTypeInteger' }] }]);
            getFeatureLayerSchema('/arcgis/rest/services/Schema3/FeatureServer', 0)
                .then(() => done(new Error('expected rejection')))
                .catch(() => getFeatureLayerSchema('/arcgis/rest/services/Schema3/FeatureServer', 0))
                .then((schema) => {
                    expect(schema.fields[0].name).toBe('ok');
                    done();
                })
                .catch(done);
        });
        it('should default name to 0 when undefined', (done) => {
            let requestUrl;
            mockAxios.onGet().reply((config) => {
                requestUrl = config.url;
                return [200, { fields: [] }];
            });
            getFeatureLayerSchema('/arcgis/rest/services/Schema4/FeatureServer/', undefined)
                .then(() => {
                    expect(requestUrl).toBe('/arcgis/rest/services/Schema4/FeatureServer/0');
                    done();
                })
                .catch(done);
        });
    });
    describe('fetchFeatureLayerCollection', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });
        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should send canonical query params (where, outFields, outSR, f) plus extras', (done) => {
            let receivedParams;
            mockAxios.onGet().reply((config) => {
                receivedParams = config.params;
                return [200, { features: [] }];
            });
            fetchFeatureLayerCollection('/svc/Test/FeatureServer/', 0, {
                params: { geometry: '0,0,1,1', geometryType: 'esriGeometryEnvelope' },
                authSourceId: 'auth1'
            }).then(() => {
                expect(receivedParams.where).toBe('1=1');
                expect(receivedParams.outFields).toBe('*');
                expect(receivedParams.outSR).toBe(4326);
                expect(receivedParams.f).toBe('geojson');
                expect(receivedParams.geometry).toBe('0,0,1,1');
                expect(receivedParams.geometryType).toBe('esriGeometryEnvelope');
                done();
            }).catch(done);
        });
        it('should follow exceededTransferLimit pagination and de-dup by OBJECTID', (done) => {
            const pages = [
                {
                    exceededTransferLimit: true,
                    features: [
                        { id: 1, properties: { OBJECTID: 1, v: 'a' } },
                        { id: 2, properties: { OBJECTID: 2, v: 'b' } }
                    ]
                },
                {
                    exceededTransferLimit: true,
                    features: [
                        // duplicate of page 1; should be dropped
                        { id: 2, properties: { OBJECTID: 2, v: 'b' } },
                        { id: 3, properties: { OBJECTID: 3, v: 'c' } }
                    ]
                },
                { features: [] }
            ];
            let pageIdx = 0;
            mockAxios.onGet().reply(() => [200, pages[pageIdx++]]);
            fetchFeatureLayerCollection('/svc/Pag/FeatureServer/', 0)
                .then((collection) => {
                    expect(collection.type).toBe('FeatureCollection');
                    expect(collection.features.map((f) => f.properties.OBJECTID)).toEqual([1, 2, 3]);
                    done();
                })
                .catch(done);
        });
        it('should stop at maxFeatures cap and slice the result', (done) => {
            mockAxios.onGet().reply(() => [200, {
                exceededTransferLimit: true,
                features: [
                    { id: 1, properties: { OBJECTID: 1 } },
                    { id: 2, properties: { OBJECTID: 2 } },
                    { id: 3, properties: { OBJECTID: 3 } }
                ]
            }]);
            fetchFeatureLayerCollection('/svc/Cap/FeatureServer/', 0, { maxFeatures: 2 })
                .then((collection) => {
                    expect(collection.features.length).toBe(2);
                    expect(collection.features[0].properties.OBJECTID).toBe(1);
                    expect(collection.features[1].properties.OBJECTID).toBe(2);
                    done();
                })
                .catch(done);
        });
        it('should swallow request errors and resolve with what was accumulated', (done) => {
            let attempt = 0;
            mockAxios.onGet().reply(() => {
                attempt++;
                if (attempt === 1) {
                    return [200, {
                        exceededTransferLimit: true,
                        features: [{ id: 1, properties: { OBJECTID: 1 } }]
                    }];
                }
                return [500, {}];
            });
            fetchFeatureLayerCollection('/svc/Err/FeatureServer/', 0)
                .then((collection) => {
                    expect(collection.type).toBe('FeatureCollection');
                    expect(collection.features.length).toBe(1);
                    done();
                })
                .catch(done);
        });
        it('should use server maxRecordCount as page size (not silently capped at 1000)', (done) => {
            let receivedRecordCount;
            mockAxios.onGet().reply((config) => {
                receivedRecordCount = config.params.resultRecordCount;
                return [200, { features: [] }];
            });
            fetchFeatureLayerCollection('/svc/Big/FeatureServer/', 0, { maxRecordCount: 2000 })
                .then(() => {
                    expect(receivedRecordCount).toBe(2000);
                    done();
                })
                .catch(done);
        });
    });
    describe('queryFeatureLayerForClassification', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(axios);
            setTimeout(done);
        });
        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('should cap at sampleSize and cache the result for repeat calls', (done) => {
            let callCount = 0;
            mockAxios.onGet().reply(() => {
                callCount++;
                return [200, {
                    features: Array.from({ length: 3 }, (_, i) => ({
                        id: i + 1,
                        properties: { OBJECTID: i + 1, v: i }
                    }))
                }];
            });
            const layer = {
                url: '/svc/Cls1/FeatureServer/',
                name: 0
            };
            queryFeatureLayerForClassification(layer, { sampleSize: 2 })
                .then((c1) => {
                    expect(c1.features.length).toBe(2);
                    return queryFeatureLayerForClassification(layer, { sampleSize: 2 });
                })
                .then((c2) => {
                    expect(callCount).toBe(1);
                    expect(c2.features.length).toBe(2);
                    done();
                })
                .catch(done);
        });
        it('should invalidate cache when collection comes back empty', (done) => {
            let callCount = 0;
            mockAxios.onGet().reply(() => {
                callCount++;
                if (callCount === 1) return [200, { features: [] }];
                return [200, { features: [{ id: 1, properties: { OBJECTID: 1 } }] }];
            });
            const layer = { url: '/svc/Cls2/FeatureServer/', name: 0 };
            queryFeatureLayerForClassification(layer)
                .then((c1) => {
                    expect(c1.features.length).toBe(0);
                    return queryFeatureLayerForClassification(layer);
                })
                .then((c2) => {
                    expect(callCount).toBe(2);
                    expect(c2.features.length).toBe(1);
                    done();
                })
                .catch(done);
        });
    });
});
