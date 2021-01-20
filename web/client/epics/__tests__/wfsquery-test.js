/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import { parse } from 'url';
import { head } from 'lodash';
import { UPDATE_GEOMETRY } from '../../actions/queryform';
import { changeMapView } from '../../actions/map';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { QUERY_RESULT, FEATURE_LOADING, query, updateQuery } from '../../actions/wfsquery';
import { viewportSelectedEpic, wfsQueryEpic } from '../wfsquery';


describe('wfsquery Epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });

    it('viewport selected epic', (done) => {
        testEpic(viewportSelectedEpic, 1, changeMapView({x: 0, y: 0, crs: 'EPSG:4326'}, 10, {bounds: {
            minx: -170,
            miny: -50,
            maxx: 170,
            maxy: 50
        }, crs: 'EPSG:4326'}), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case UPDATE_GEOMETRY:
                    expect(action.geometry).toEqual({
                        center: [0, 0],
                        coordinates: [[[-170, -50], [-170, 50], [170, 50], [170, -50], [-170, -50]]],
                        extent: [-170, -50, 170, 50],
                        projection: 'EPSG:4326',
                        radius: 0,
                        type: 'Polygon' });
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {queryform: { spatialField: {method: 'Viewport'}}});
    });
    it('wfsQueryEpic', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(() => {return [200, expectedResult];});
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                selected: ['layerId'],
                flat: [{id: 'layerId'}]
            }
        });
    });
    it('wfsQueryEpic passing query options and default sort', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>A</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {} }, {viewParams: "a:b"}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.queryOptions.viewParams).toEqual("a:b");
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            query: { typeName: 'layer1', featureTypes: {layer1: {attributes: [{attribute: 'NAME'}]}}},
            layers: {
                selected: ['layerId'],
                flat: [{id: 'layerId'}]
            }
        });
    });
    it('wfsQueryEpic passing filter object with valid sort options', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"} }, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                selected: ['layerId'],
                flat: [{id: 'layerId'}]
            }
        });
    });
    // required to load a featuretype when the layer to use is not the layer selected in TOC
    it('wfsQueryEpic passing filter object with no selected layers', (done) => {
        const expectedResult = require('../../test-resources/wfs/museam.json');
        mockAxios.onPost().reply(config => {
            expect(config.data).toContain('<ogc:PropertyName>NAME</ogc:PropertyName>');
            expect(config.data).toContain('<wfs:SortOrder>DESC</wfs:SortOrder>');
            return [200, expectedResult];
        });
        testEpic(wfsQueryEpic, 2, query("base/web/client/test-resources/wfs/museam.json", { pagination: {maxFeatures: 20, startIndex: 0}, sortOptions: {sortBy: "NAME", sortOrder: "DESC"}, featureTypeName: "layerId"}, {}), actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case QUERY_RESULT:
                    expect(action.result).toEqual(expectedResult);
                    expect(action.filterObj.pagination).toEqual({maxFeatures: 20, startIndex: 0});
                    expect(action.filterObj.sortOptions).toEqual({sortBy: "NAME", sortOrder: "DESC"});
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                flat: [{id: 'layerId'}]
            }
        });
    });
    describe('wfsQueryEpic timedimension', () => {
        const BASE_URL = "/WFS";
        const DATE = "20180101T00:00:00";
        const BASE_TIME_TEST_STATE = {
            layers: {
                selected: ['TEST_LAYER'],
                flat: [{
                    id: "TEST_LAYER",
                    title: "Test Layer",
                    name: 'editing:polygons',
                    params: {
                        viewParams: "a:b",
                        time: DATE
                    }
                }]
            },
            featuregrid: {
                timeSync: true,
                pagination: {
                    size: 10
                },
                open: true,
                selectedLayer: "TEST_LAYER",
                changes: []
            },
            dimension: {
                data: {
                    time: {
                        'TEST_LAYER': {
                            source: { // describes the source of dimension
                                type: 'multidim-extension',
                                url: 'http://domain.com:80/geoserver/wms'
                            },
                            name: 'time',
                            domain: '2016-09-01T00:00:00.000Z--2017-04-11T00:00:00.000Z'
                        }
                    }
                }
            }
        };
        const TIME_DISABLED_TEST_STATE = {
            ...BASE_TIME_TEST_STATE,
            featuregrid: {
                ...BASE_TIME_TEST_STATE.featuregrid,
                timeSync: false
            }
        };
        it('wfsQueryEpic manages time dimension, when enabled and present', (done) => {
            const expectedResult = require('../../test-resources/wfs/museam.json');
            mockAxios.onPost().reply(config => {
                const { pathname, query: queryString } = parse(config.url);
                expect(pathname).toBe(`${BASE_URL}`);
                const params = queryString.split('&');
                const paramPairs = params.map(p => p.split('='));
                expect(head(paramPairs.filter(([k, v]) => k === 'time' && v === encodeURIComponent(DATE)))).toNotExist();
                return [200, expectedResult];
            });
            testEpic(wfsQueryEpic, 2, query(BASE_URL, { pagination: {} }, { viewParams: "a:b" }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result).toEqual(expectedResult);
                        expect(action.queryOptions.viewParams).toEqual("a:b");
                        break;
                    case FEATURE_LOADING:
                        break;
                    default:
                        expect(false).toBe(true);
                    }
                });
                done();
            }, TIME_DISABLED_TEST_STATE);
        });
        it('wfsQueryEpic do not add time dimension, when timeSync disabled', (done) => {
            const expectedResult = require('../../test-resources/wfs/museam.json');
            mockAxios.onPost().reply(config => {
                const { pathname, query: queryString } = parse(config.url);
                expect(pathname).toBe(`${BASE_URL}`);
                const params = queryString.split('&');
                const paramPairs = params.map(p => p.split('='));
                expect(head(paramPairs.filter(([k, v]) => k === 'time' && v === encodeURIComponent(DATE)))).toExist();
                return [200, expectedResult];
            });
            testEpic(wfsQueryEpic, 2, query(BASE_URL, { pagination: {} }, { viewParams: "a:b" }), actions => {
                expect(actions.length).toBe(2);
                actions.map((action) => {
                    switch (action.type) {
                    case QUERY_RESULT:
                        expect(action.result).toEqual(expectedResult);
                        expect(action.queryOptions.viewParams).toEqual("a:b");
                        break;
                    case FEATURE_LOADING:
                        break;
                    default:
                        expect(false).toBe(true);
                    }
                });
                done();
            }, BASE_TIME_TEST_STATE);
        });
    });

    // this avoids race condition of state changes when update query is performed
    it('wfsQueryEpic stop on update query', (done) => {
        testEpic(addTimeoutEpic(wfsQueryEpic, 50), 2, [
            query("base/web/client/test-resources/wfs/museam.json", {pagination: {} }),
            updateQuery()
        ], actions => {
            expect(actions.length).toBe(2);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    break;
                case FEATURE_LOADING:
                    break;
                default:
                    expect(false).toBe(true);
                }
            });
            done();
        }, {
            layers: {
                selected: ['layerId'],
                flat: [{id: 'layerId'}]
            }
        });
    });
});
