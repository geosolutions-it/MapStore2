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
import { DOWNLOAD_OPTIONS_CHANGE, downloadFeatures, checkWPSAvailability, SET_SERVICE, SET_WPS_AVAILABILITY, CHECKING_WPS_AVAILABILITY } from '../../actions/layerdownload';
import { QUERY_CREATE } from '../../actions/wfsquery';
import { closeExportDownload, openDownloadTool, startFeatureExportDownload } from '../layerdownload';
import { testEpic } from './epicTestUtils';
import { xmlData } from "./data/download-estimation.xml";
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

});
