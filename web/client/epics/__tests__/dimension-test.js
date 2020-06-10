/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import axios from "../../libs/ajax";
import MockAdapter from "axios-mock-adapter";

import { testEpic } from './epicTestUtils';

import { updateLayerDimensionDataOnMapLoad } from '../dimension';
import { configureMap } from '../../actions/config';
import {
    SELECT_LAYER,
    AUTOSELECT
} from '../../actions/timeline';
import {
    SET_CURRENT_TIME,
    SET_OFFSET_TIME,
    UPDATE_LAYER_DIMENSION_DATA
} from '../../actions/dimension';

const domainsTestResponse = `<?xml version="1.0" encoding="UTF-8"?><Domains xmlns="http://demo.geo-solutions.it/share/wmts-multidim/wmts_multi_dimensional.xsd" xmlns:ows="http://www.opengis.net/ows/1.1" version="1.1">
  <DimensionDomain>
    <ows:Identifier>time</ows:Identifier>
    <Domain>1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z</Domain>
    <Size>2</Size>
  </DimensionDomain>
</Domains>`;

describe('dimension epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('updateLayerDimensionDataOnMapLoad', (done) => {
        const testConfig = {
            map: {},
            timelineData: {
                selectedLayer: 'timelineLayer'
            },
            dimensionData: {
                currentTime: '1996-04-08T08:02:01.425Z',
                offsetTime: '2016-06-07T02:17:23.197Z'
            }
        };
        const startActions = [configureMap(testConfig, 10)];

        mockAxios.onGet('/sample/url').reply(200, domainsTestResponse);
        testEpic(updateLayerDimensionDataOnMapLoad, 5, startActions, actions => {
            expect(actions.length).toBe(5);
            expect(actions[0].type).toBe(SELECT_LAYER);
            expect(actions[0].layerId).toBe(testConfig.timelineData.selectedLayer);
            expect(actions[1].type).toBe(SET_CURRENT_TIME);
            expect(actions[1].time).toBe(testConfig.dimensionData.currentTime);
            expect(actions[2].type).toBe(SET_OFFSET_TIME);
            expect(actions[2].offsetTime).toBe(testConfig.dimensionData.offsetTime);
            expect(actions[3].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[3].dimension).toBe('time');
            expect(actions[3].layerId).toBe('timelineLayer2');
            expect(actions[3].data).toExist();
            expect(actions[3].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[3].data.name).toBe('time');
            expect(actions[4].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[4].dimension).toBe('time');
            expect(actions[4].layerId).toBe(testConfig.timelineData.selectedLayer);
            expect(actions[4].data).toExist();
            expect(actions[4].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[4].data.name).toBe('time');
        }, {
            layers: {
                flat: [{
                    id: 'timelineLayer2',
                    name: 'timelineLayer2',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }, {
                    id: 'timelineLayer',
                    name: 'timelineLayer',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }]
            }
        }, done);
    });
    it('updateLayerDimensionDataOnMapLoad no timeline and dimension data', (done) => {
        const testConfig = {
            map: {}
        };
        const startActions = [configureMap(testConfig, 10)];

        mockAxios.onGet('/sample/url').reply(200, domainsTestResponse);
        testEpic(updateLayerDimensionDataOnMapLoad, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[0].dimension).toBe('time');
            expect(actions[0].layerId).toBe('timelineLayer2');
            expect(actions[0].data).toExist();
            expect(actions[0].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[0].data.name).toBe('time');
            expect(actions[1].type).toBe(AUTOSELECT);
            expect(actions[2].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[2].dimension).toBe('time');
            expect(actions[2].layerId).toBe('timelineLayer');
            expect(actions[2].data).toExist();
            expect(actions[2].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[2].data.name).toBe('time');
            expect(actions[3].type).toBe(AUTOSELECT);
        }, {
            layers: {
                flat: [{
                    id: 'timelineLayer2',
                    name: 'timelineLayer2',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }, {
                    id: 'timelineLayer',
                    name: 'timelineLayer',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }]
            }
        }, done);
    });
    it('updateLayerDimensionDataOnMapLoad no timeline data', (done) => {
        const testConfig = {
            map: {},
            dimensionData: {
                currentTime: '1996-04-08T08:02:01.425Z',
                offsetTime: '2016-06-07T02:17:23.197Z'
            }
        };
        const startActions = [configureMap(testConfig, 10)];

        mockAxios.onGet('/sample/url').reply(200, domainsTestResponse);
        testEpic(updateLayerDimensionDataOnMapLoad, 4, startActions, actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(SET_CURRENT_TIME);
            expect(actions[0].time).toBe(testConfig.dimensionData.currentTime);
            expect(actions[1].type).toBe(SET_OFFSET_TIME);
            expect(actions[1].offsetTime).toBe(testConfig.dimensionData.offsetTime);
            expect(actions[2].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[2].dimension).toBe('time');
            expect(actions[2].layerId).toBe('timelineLayer2');
            expect(actions[2].data).toExist();
            expect(actions[2].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[2].data.name).toBe('time');
            expect(actions[3].type).toBe(UPDATE_LAYER_DIMENSION_DATA);
            expect(actions[3].dimension).toBe('time');
            expect(actions[3].layerId).toBe('timelineLayer');
            expect(actions[3].data).toExist();
            expect(actions[3].data.domain).toBe('1583-01-01T00:00:00.000Z--2101-01-01T00:00:00.000Z');
            expect(actions[3].data.name).toBe('time');
        }, {
            layers: {
                flat: [{
                    id: 'timelineLayer2',
                    name: 'timelineLayer2',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }, {
                    id: 'timelineLayer',
                    name: 'timelineLayer',
                    type: 'wms',
                    dimensions: [{
                        name: 'time',
                        source: {
                            type: 'multidim-extension',
                            url: 'sample/url'
                        }
                    }]
                }]
            }
        }, done);
    });
});
