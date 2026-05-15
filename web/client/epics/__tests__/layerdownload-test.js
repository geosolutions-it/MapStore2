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
                    expect(action.searchUrl).toBe('myurl');
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
});
