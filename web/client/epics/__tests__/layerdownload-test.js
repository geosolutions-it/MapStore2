/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";
import expect from 'expect';

import { toggleControl, TOGGLE_CONTROL } from '../../actions/controls';
import { download } from '../../actions/layers';
import { DOWNLOAD_OPTIONS_CHANGE, downloadFeatures } from '../../actions/layerdownload';
import { QUERY_CREATE } from '../../actions/wfsquery';
import { closeExportDownload, openDownloadTool, startFeatureExportDownload, downloadVectorLayerAsGeoJSON } from '../layerdownload';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import FileSaver from 'file-saver';
import { NETCDF_FORMAT } from '../../utils/FileFormatUtils';

describe('layerdownload Epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });

    it('close export panel', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                expect(action.type).toBe(TOGGLE_CONTROL);
                expect(action.control).toBe('layerdownload');
            });
            done();
        };

        const state = {controls: { queryPanel: {enabled: false}, layerdownload: {enabled: true}}};
        testEpic(closeExportDownload, 1, toggleControl("queryPanel"), epicResult, state);
    });
    it('downloads a layer', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(3);
            actions.map((action) => {
                switch (action.type) {
                case TOGGLE_CONTROL:
                    expect(action.control).toBe('layerdownload');
                    break;
                case DOWNLOAD_OPTIONS_CHANGE:
                    expect(action.key).toBe('singlePage');
                    expect(action.value).toBe(false);
                    break;
                case QUERY_CREATE:
                    expect(action.searchUrl).toBe('http://search');
                    expect(action.filterObj.featureTypeName).toBe('mylayer');
                    break;
                default:
                    break;
                }
            });
            done();
        };

        const state = { controls: { layerdownload: { enabled: false, downloadOptions: {}} } };
        testEpic(openDownloadTool, 3, download({name: 'mylayer', url: 'myurl', search: {url: 'http://search'}}), epicResult, state);
    });
    it('startFeatureExportDownload triggers on downloadFeatures', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            // remove duplicated question marks
            expect(actions[0].error.config.url.indexOf('??') < 0).toBe(true);

            // forwards outputFormat in the URL
            expect(actions[0].error.config.url.indexOf("test-format") > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            featuregrid: {},
            layers: {
                flat: [{ id: 'test layer', layerFilter: { featureTypeName: 'test' } }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/wrong/path?', { featureTypeName: 'test' }, { selectedFormat: "test-format"}),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload uses the linked WFS URL', (done) => {
        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            featuregrid: {},
            layers: {
                flat: [{
                    id: 'test layer',
                    type: 'wms',
                    name: 'workspace:rendered',
                    url: 'wms-url',
                    search: {
                        type: 'wfs',
                        url: 'linked-wfs-url',
                        typeName: 'workspace:linked'
                    }
                }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('wms-url', { featureTypeName: 'workspace:linked' }, { selectedFormat: 'test-format' }),
            (actions) => {
                expect(actions[0].error.config.url).toContain('linked-wfs-url');
                done();
            },
            state
        );
    });
    it('startFeatureExportDownload adds viewport filter to WFS export when cropDataSet is enabled', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.url.indexOf("test-format") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<ogc:Intersects>") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<ogc:PropertyName>the_geom</ogc:PropertyName>") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<gml:Polygon srsName="EPSG:3857">') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<gml:posList>0 0 0 1 1 1 1 0 0 0</gml:posList>") > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            featuregrid: {},
            layers: {
                flat: [{ id: 'test layer', name: 'test', layerFilter: { featureTypeName: 'test' } }],
                selected: ['test layer']
            },
            map: {
                present: {
                    bbox: {
                        bounds: { minx: 0, miny: 0, maxx: 1, maxy: 1 },
                        crs: 'EPSG:3857'
                    }
                }
            },
            query: {
                featureTypes: {
                    test: {
                        original: {
                            featureTypes: [{
                                properties: [{
                                    name: 'the_geom',
                                    type: 'gml:MultiPolygon'
                                }]
                            }]
                        }
                    }
                }
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/wrong/path?', { featureTypeName: 'test' }, { selectedFormat: "test-format", cropDataSet: true}),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload adds viewport BBOX filter when cropDataSet is enabled without describe metadata', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.url.indexOf("test-format") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<ogc:BBOX>") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<gml:Envelope srsName="EPSG:3857">') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<gml:lowerCorner>0 0</gml:lowerCorner>") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<gml:upperCorner>1 1</gml:upperCorner>") > 0).toBe(true);
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            featuregrid: {},
            layers: {
                flat: [{ id: 'test layer', name: 'test', layerFilter: { featureTypeName: 'test' } }],
                selected: ['test layer']
            },
            map: {
                present: {
                    bbox: {
                        bounds: { minx: 0, miny: 0, maxx: 1, maxy: 1 },
                        crs: 'EPSG:3857'
                    }
                }
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/wrong/path?', { featureTypeName: 'test' }, { selectedFormat: "test-format", cropDataSet: true}),
            epicResult,
            state,
            done
        );
    });
    it('startFeatureExportDownload cql_filter support', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            // remove duplicated question marks
            expect(actions[0].error.config.url.indexOf('??') < 0).toBe(true);

            // forwards outputFormat in the URL
            expect(actions[0].error.config.url.indexOf("test-format") > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf("<ogc:PropertyIsEqualTo><ogc:PropertyName>name</ogc:PropertyName><ogc:Literal>test</ogc:Literal></ogc:PropertyIsEqualTo>") > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            featuregrid: {},
            layers: {
                flat: [{ id: 'test layer', layerFilter: { featureTypeName: 'test' }, params: { cql_filter: "name = 'test'"} }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/wrong/path?', { featureTypeName: 'test' }, { selectedFormat: "test-format"}),
            epicResult,
            state
        );
    });
    it('downloadVectorLayerAsGeoJSON - downloads a vector layer as GeoJSON and emits no actions', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const layer = {
            type: 'vector',
            name: 'my-vector-layer',
            features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} }]
        };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                expect(saveAsSpy.calls.length).toBe(1);
                const [blob, filename] = saveAsSpy.calls[0].arguments;
                expect(filename).toBe('my-vector-layer.geojson');
                expect(blob.type).toBe('application/geo+json;charset=utf-8');
                saveAsSpy.restore();
                done();
            }
        );
    });
    it('downloadVectorLayerAsGeoJSON - uses layer title as filename when name is missing', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const layer = { type: 'vector', title: 'My Title Layer', features: [] };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                const [, filename] = saveAsSpy.calls[0].arguments;
                expect(filename).toBe('My Title Layer.geojson');
                saveAsSpy.restore();
                done();
            }
        );
    });
    it('downloadVectorLayerAsGeoJSON - uses layer id as filename when name and title are missing', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const layer = { type: 'vector', id: 'layer-123', features: [] };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                const [, filename] = saveAsSpy.calls[0].arguments;
                expect(filename).toBe('layer-123.geojson');
                saveAsSpy.restore();
                done();
            }
        );
    });
    it('downloadVectorLayerAsGeoJSON - falls back to vector-layer.geojson when no identifier is present', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const layer = { type: 'vector', features: [] };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                const [, filename] = saveAsSpy.calls[0].arguments;
                expect(filename).toBe('vector-layer.geojson');
                saveAsSpy.restore();
                done();
            }
        );
    });
    it('downloadVectorLayerAsGeoJSON - includes features in the GeoJSON blob', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const feature = { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2] }, properties: { foo: 'bar' } };
        const layer = { type: 'vector', name: 'test', features: [feature] };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                const [blob] = saveAsSpy.calls[0].arguments;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const parsed = JSON.parse(e.target.result);
                    expect(parsed.type).toBe('FeatureCollection');
                    expect(parsed.features.length).toBe(1);
                    expect(parsed.features[0].properties.foo).toBe('bar');
                    saveAsSpy.restore();
                    done();
                };
                reader.readAsText(blob);
            }
        );
    });
    it('downloadVectorLayerAsGeoJSON - does NOT trigger for non-vector layers', (done) => {
        const saveAsSpy = expect.spyOn(FileSaver, 'saveAs').andCallThrough();
        const layer = { type: 'wms', name: 'wms-layer', url: 'http://geoserver/wms' };
        testEpic(
            addTimeoutEpic(downloadVectorLayerAsGeoJSON, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                expect(saveAsSpy.calls.length).toBe(0);
                saveAsSpy.restore();
                done();
            }
        );
    });
    it('openDownloadTool - does NOT open the export tool for a vector layer', (done) => {
        const layer = { type: 'vector', name: 'my-vector', features: [] };
        testEpic(
            addTimeoutEpic(openDownloadTool, 100),
            1,
            download(layer),
            (actions) => {
                expect(actions.length).toBe(1);
                expect(actions[0].type).toBe(TEST_TIMEOUT);
                done();
            }
        );
    });
    it('startFeatureExportDownload includes temporal filter when timeAttribute and currentTime are set', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyIsEqualTo>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyName>timestamp</ogc:PropertyName>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('2024-01-01T00:00:00.000Z') > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            dimension: {
                currentTime: '2024-01-01T00:00:00.000Z'
            },
            featuregrid: {},
            layers: {
                flat: [{
                    id: 'test layer',
                    name: 'test',
                    layerFilter: { featureTypeName: 'test' },
                    dimensions: [{ name: 'time' }],
                    search: { url: '/geoserver/wfs' }
                }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/geoserver/wfs', { featureTypeName: 'test' }, { selectedFormat: 'test-format', timeAttribute: 'timestamp' }),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload includes temporal range filter (PropertyIsBetween) and time parameter when range is active', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyIsBetween>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyName>timestamp</ogc:PropertyName>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:LowerBoundary><ogc:Literal>2024-01-01T00:00:00.000Z</ogc:Literal></ogc:LowerBoundary>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:UpperBoundary><ogc:Literal>2024-01-05T00:00:00.000Z</ogc:Literal></ogc:UpperBoundary>') > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            dimension: {
                currentTime: '2024-01-01T00:00:00.000Z',
                offsetTime: '2024-01-05T00:00:00.000Z'
            },
            featuregrid: {},
            layers: {
                flat: [{
                    id: 'test layer',
                    name: 'test',
                    layerFilter: { featureTypeName: 'test' },
                    dimensions: [{ name: 'time' }],
                    search: { url: '/geoserver/wfs' }
                }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/geoserver/wfs', { featureTypeName: 'test' }, { selectedFormat: 'test-format', timeAttribute: 'timestamp' }),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload falls back to time attribute "time" when timeAttribute is not specified', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyIsEqualTo>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyName>time</ogc:PropertyName>') > 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('2024-01-01T00:00:00.000Z') > 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            dimension: {
                currentTime: '2024-01-01T00:00:00.000Z'
            },
            featuregrid: {},
            layers: {
                flat: [{
                    id: 'test layer',
                    name: 'test',
                    layerFilter: { featureTypeName: 'test' },
                    dimensions: [{ name: 'time' }],
                    search: { url: '/geoserver/wfs' }
                }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/geoserver/wfs', { featureTypeName: 'test' }, { selectedFormat: 'test-format' }),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload does not include temporal filter when layer has no time dimension', (done) => {
        const epicResult = actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].error.config.url).toExist();
            expect(actions[0].error.config.url.indexOf('time=') < 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyIsEqualTo>') < 0).toBe(true);
            expect(actions[0].error.config.data.indexOf('<ogc:PropertyIsBetween>') < 0).toBe(true);
            done();
        };

        mockAxios.onGet().reply(404);
        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            dimension: {
                currentTime: '2024-01-01T00:00:00.000Z'
            },
            featuregrid: {},
            layers: {
                flat: [{
                    id: 'test layer',
                    name: 'test',
                    layerFilter: { featureTypeName: 'test' },
                    search: { url: '/geoserver/wfs' }
                }],
                selected: ['test layer']
            }
        };
        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/geoserver/wfs', { featureTypeName: 'test' }, { selectedFormat: 'test-format', timeAttribute: 'timestamp' }),
            epicResult,
            state
        );
    });
    it('startFeatureExportDownload wps flow omits writeParameters when format is NetCDF', (done) => {
        const postedPayloads = [];
        mockAxios.onPost().reply((config) => {
            postedPayloads.push(config.data);
            if (config.data && config.data.indexOf('gs:DownloadEstimator') > 0) {
                return [200,
                    `<?xml version="1.0" encoding="UTF-8"?>
                        <wps:ExecuteResponse xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wps:Status>
                            <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
                        </wps:Status>
                        <wps:ProcessOutputs>
                            <wps:Output>
                                <ows:Identifier>result</ows:Identifier>
                                <wps:Data><wps:LiteralData>true</wps:LiteralData></wps:Data>
                            </wps:Output>
                        </wps:ProcessOutputs>
                    </wps:ExecuteResponse>`,
                    { 'content-type': 'application/xml' }
                ];
            }
            if (config.data && config.data.indexOf('gs:Download') > 0) {
                return [200,
                    `<?xml version="1.0" encoding="UTF-8"?>
                        <wps:ExecuteResponse xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wps:Status>
                            <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
                        </wps:Status>
                        <wps:ProcessOutputs>
                            <wps:Output>
                                <ows:Identifier>result</ows:Identifier>
                                <wps:Reference href="http://geoserver/wps/result.zip"/>
                            </wps:Output>
                        </wps:ProcessOutputs>
                    </wps:ExecuteResponse>`,
                    { 'content-type': 'application/xml' }
                ];
            }
            return [404];
        });

        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            layerdownload: {
                service: 'wps'
            },
            layers: {
                flat: [{
                    id: 'raster-layer',
                    name: 'workspace:raster',
                    url: '/geoserver/wps'
                }],
                selected: ['raster-layer']
            }
        };

        testEpic(
            startFeatureExportDownload,
            5,
            downloadFeatures('/geoserver/wps', { featureTypeName: 'workspace:raster' }, {
                selectedFormat: NETCDF_FORMAT,
                tileWidth: 512,
                tileHeight: 512,
                compression: 'DEFLATE'
            }),
            () => {
                expect(postedPayloads.length).toBeGreaterThan(1);
                const downloadPayload = postedPayloads.find(p => p.indexOf('gs:Download') > 0 && p.indexOf('gs:DownloadEstimator') < 0);
                expect(downloadPayload).toExist();
                expect(downloadPayload.indexOf(NETCDF_FORMAT) > 0).toBe(true);
                expect(downloadPayload.indexOf('writeParameters') < 0).toBe(true);
                expect(downloadPayload.indexOf('tilewidth') < 0).toBe(true);
                done();
            },
            state
        );
    });
    it('startFeatureExportDownload wps flow includes writeParameters for non-NetCDF raster format', (done) => {
        const postedPayloads = [];
        mockAxios.onPost().reply((config) => {
            postedPayloads.push(config.data);
            if (config.data && config.data.indexOf('gs:DownloadEstimator') > 0) {
                return [200,
                    `<?xml version="1.0" encoding="UTF-8"?>
                        <wps:ExecuteResponse xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wps:Status>
                            <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
                        </wps:Status>
                        <wps:ProcessOutputs>
                            <wps:Output>
                                <ows:Identifier>result</ows:Identifier>
                                <wps:Data><wps:LiteralData>true</wps:LiteralData></wps:Data>
                            </wps:Output>
                        </wps:ProcessOutputs>
                    </wps:ExecuteResponse>`,
                    { 'content-type': 'application/xml' }
                ];
            }
            if (config.data && config.data.indexOf('gs:Download') > 0) {
                return [200,
                    `<?xml version="1.0" encoding="UTF-8"?>
                        <wps:ExecuteResponse xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1">
                        <wps:Status>
                            <wps:ProcessSucceeded>Process succeeded.</wps:ProcessSucceeded>
                        </wps:Status>
                        <wps:ProcessOutputs>
                            <wps:Output>
                                <ows:Identifier>result</ows:Identifier>
                                <wps:Reference href="http://geoserver/wps/result.zip"/>
                            </wps:Output>
                        </wps:ProcessOutputs>
                    </wps:ExecuteResponse>`,
                    { 'content-type': 'application/xml' }
                ];
            }
            return [404];
        });

        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            layerdownload: {
                service: 'wps'
            },
            layers: {
                flat: [{
                    id: 'raster-layer',
                    name: 'workspace:raster',
                    url: '/geoserver/wps'
                }],
                selected: ['raster-layer']
            }
        };

        testEpic(
            startFeatureExportDownload,
            5,
            downloadFeatures('/geoserver/wps', { featureTypeName: 'workspace:raster' }, {
                selectedFormat: 'image/tiff',
                tileWidth: 256,
                tileHeight: 256,
                compression: 'DEFLATE',
                quality: 75
            }),
            () => {
                expect(postedPayloads.length).toBeGreaterThan(1);
                const downloadPayload = postedPayloads.find(p => p.indexOf('gs:Download') > 0 && p.indexOf('gs:DownloadEstimator') < 0);
                expect(downloadPayload).toExist();
                expect(downloadPayload.indexOf('writeParameters') > 0).toBe(true);
                expect(downloadPayload.indexOf('tilewidth') > 0).toBe(true);
                expect(downloadPayload.indexOf('256') > 0).toBe(true);
                expect(downloadPayload.indexOf('compression') > 0).toBe(true);
                expect(downloadPayload.indexOf('DEFLATE') > 0).toBe(true);
                done();
            },
            state
        );
    });
    it('startFeatureExportDownload wps flow includes temporal filter in dataFilter when time dimension is present', (done) => {
        const postedPayloads = [];
        mockAxios.onPost().reply((config) => {
            postedPayloads.push(config.data);
            return [404];
        });

        const state = {
            controls: {
                queryPanel: { enabled: false },
                layerdownload: { enabled: true }
            },
            layerdownload: {
                service: 'wps'
            },
            dimension: {
                currentTime: '2024-01-01T00:00:00.000Z',
                offsetTime: '2024-01-05T00:00:00.000Z'
            },
            layers: {
                flat: [{
                    id: 'raster-layer',
                    name: 'workspace:raster',
                    url: '/geoserver/wps',
                    dimensions: [{ name: 'time' }]
                }],
                selected: ['raster-layer']
            }
        };

        testEpic(
            startFeatureExportDownload,
            1,
            downloadFeatures('/geoserver/wps', { featureTypeName: 'workspace:raster' }, {
                selectedFormat: NETCDF_FORMAT,
                timeAttribute: 'time'
            }),
            () => {
                expect(postedPayloads.length).toBeGreaterThan(0);
                const estimatorPayload = postedPayloads[0];
                expect(estimatorPayload.indexOf('gs:DownloadEstimator') > 0).toBe(true);
                expect(estimatorPayload.indexOf('<ows:Identifier>filter</ows:Identifier>') > 0).toBe(true);
                expect(estimatorPayload.indexOf('PropertyIsBetween') > 0).toBe(true);
                expect(estimatorPayload.indexOf('2024-01-01T00:00:00.000Z') > 0).toBe(true);
                expect(estimatorPayload.indexOf('2024-01-05T00:00:00.000Z') > 0).toBe(true);
                done();
            },
            state
        );
    });
});
